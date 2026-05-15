import requests
from bs4 import BeautifulSoup
from urllib.parse import quote, urlparse, parse_qs, unquote
import time
import random
from .domains import extract_domain

REAL_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service as ChromeService
    from selenium.webdriver.chrome.options import Options as ChromeOptions
    from webdriver_manager.chrome import ChromeDriverManager
    from selenium.webdriver.common.by import By
    from selenium.common.exceptions import TimeoutException
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False


DDG_REGION_MAP = {
    '213': 'ru-ru', '2': 'ru-ru', '54': 'ru-ru', '47': 'ru-ru',
    '43': 'ru-ru', '120': 'ru-ru', '51': 'ru-ru', '24': 'ru-ru',
    '35': 'ru-ru', '39': 'ru-ru', '38': 'ru-ru', '59': 'ru-ru',
    '28': 'ru-ru', '48': 'ru-ru', '50': 'ru-ru', '64': 'ru-ru',
    '189': 'ru-ru', '30': 'ru-ru', '66': 'ru-ru', '75': 'ru-ru',
    '44': 'ru-ru', '58': 'ru-ru', '57': 'ru-ru', '192': 'ru-ru',
    '69': 'ru-ru', '68': 'ru-ru', '22': 'ru-ru', '26': 'ru-ru',
    '70': 'ru-ru', '49': 'ru-ru',
}


class DuckDuckGoParser:
    BASE_URL = 'https://html.duckduckgo.com/html/'
    JS_URL = 'https://duckduckgo.com/'
    
    def __init__(self, region='213', delay=2):
        self.region = DDG_REGION_MAP.get(str(region), 'ru-ru')
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'DNT': '1',
            'User-Agent': REAL_UA
        })
        self.driver = None
    
    def search(self, query, positions=5):
        all_results = {'organic': [], 'ads': []}
        
        # Try requests-based HTML search first (fast)
        try:
            time.sleep(random.uniform(self.delay * 0.5, self.delay * 1.5))
            response = self.session.get(
                self.BASE_URL,
                params={'q': query, 'kl': self.region},
                headers={'Referer': 'https://duckduckgo.com/'},
                timeout=15
            )
            if response.status_code == 200:
                results = self._parse_page(response.text)
                if results:
                    all_results['organic'] = results[:positions]
                    return all_results
        except Exception:
            pass
        
        # Fallback: Selenium (handles rate-limiting / JS challenge)
        if SELENIUM_AVAILABLE:
            try:
                all_results = self._search_selenium(query, positions)
            except Exception as e:
                print(f"DuckDuckGo selenium error: {e}")
        
        return all_results
    
    def _search_selenium(self, query, positions):
        results = {'organic': [], 'ads': []}
        
        if not self.driver:
            options = ChromeOptions()
            options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--window-size=1280,1024')
            options.add_argument(f'user-agent={REAL_UA}')
            self.driver = webdriver.Chrome(
                service=ChromeService(ChromeDriverManager().install()),
                options=options
            )
        
        search_url = f'{self.JS_URL}?q={quote(query)}&ia=web'
        self.driver.get(search_url)
        time.sleep(random.uniform(2, 4))
        
        # Extract organic results
        articles = self.driver.find_elements(By.CSS_SELECTOR, 'article[data-testid="result"]')
        for idx, article in enumerate(articles[:positions], 1):
            try:
                a = article.find_element(By.CSS_SELECTOR, 'a[data-testid="result-title-a"], a[href]')
                href = a.get_attribute('href')
                title = a.text.strip()
                url = self._extract_ddg_url(href)
                results['organic'].append({
                    'position': idx,
                    'domain': extract_domain(url),
                    'title': title or '',
                    'url': url,
                    'type': 'organic',
                })
            except Exception:
                continue
        
        # Extract ad results (DuckDuckGo shows ads with 'ad' attribute or class)
        ads = self.driver.find_elements(By.CSS_SELECTOR, 'article[data-testid="result"][data-ad="true"], [class*=ad] a[href]')
        for idx, ad in enumerate(ads[:positions], 1):
            try:
                href = ad.get_attribute('href')
                url = self._extract_ddg_url(href)
                results['ads'].append({
                    'position': idx,
                    'domain': extract_domain(url),
                    'title': ad.text.strip() or '',
                    'url': url,
                    'type': 'ad',
                })
            except Exception:
                continue
        
        return results
    
    def _extract_ddg_url(self, href):
        if not href:
            return ''
        if 'uddg=' in href:
            parsed = urlparse(href)
            qs = parse_qs(parsed.query)
            if 'uddg' in qs:
                return unquote(qs['uddg'][0])
        if '//duckduckgo.com/l/' in href:
            parsed = urlparse(href)
            qs = parse_qs(parsed.query)
            if 'uddg' in qs:
                return unquote(qs['uddg'][0])
        return href
    
    def _parse_page(self, html):
        soup = BeautifulSoup(html, 'lxml')
        results = []
        
        items = soup.select('.result')
        for idx, item in enumerate(items, 1):
            try:
                link_elem = item.select_one('a.result__a')
                if link_elem:
                    href = link_elem.get('href', '')
                    url = self._extract_ddg_url(href)
                    title = link_elem.get_text(strip=True)
                    results.append({
                        'position': idx,
                        'domain': extract_domain(url),
                        'title': title,
                        'url': url,
                        'type': 'organic'
                    })
            except Exception:
                continue
        
        return results
    
    def find_competitors(self, queries, positions=5):
        competitors = {}
        
        for query in queries:
            results = self.search(query, positions)
            
            for item in results.get('organic', []):
                domain = item['domain']
                if self._exclude_domain(domain):
                    continue
                if domain not in competitors:
                    competitors[domain] = {
                        'domain': domain,
                        'found_in_queries': [],
                        'positions': {},
                        'types': ['organic']
                    }
                competitors[domain]['found_in_queries'].append(query)
                competitors[domain]['positions'][query] = item['position']
            
            for item in results.get('ads', []):
                domain = item['domain']
                if self._exclude_domain(domain):
                    continue
                if domain not in competitors:
                    competitors[domain] = {
                        'domain': domain,
                        'found_in_queries': [],
                        'positions': {},
                        'types': []
                    }
                competitors[domain]['found_in_queries'].append(query)
                competitors[domain]['positions'][query] = item['position']
                if 'ad' not in competitors[domain]['types']:
                    competitors[domain]['types'].append('ad')
        
        return list(competitors.values())
    
    def __del__(self):
        if self.driver:
            try:
                self.driver.quit()
            except Exception:
                pass
    
    @staticmethod
    def _exclude_domain(domain):
        domain_lower = domain.lower()
        EXCLUDED = ['google.com', 'yandex.ru', 'yandex.com', 'duckduckgo.com',
                    'facebook.com', 'instagram.com', 'youtube.com',
                    'vk.com', 'ok.ru', 't.me', 'mail.ru']
        for exc in EXCLUDED:
            if exc in domain_lower:
                return True
        return False
