import requests
from bs4 import BeautifulSoup
from urllib.parse import quote, urlparse
import time
import random
from fake_useragent import UserAgent
from .domains import is_excluded_domain, extract_domain

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service as ChromeService
    from selenium.webdriver.chrome.options import Options as ChromeOptions
    from webdriver_manager.chrome import ChromeDriverManager
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

ua = UserAgent()


class YandexParser:
    BASE_URL = 'https://yandex.ru/search/'
    
    def __init__(self, region='213', delay=2, use_selenium=False):
        self.region = region
        self.delay = delay
        self.use_selenium = use_selenium and SELENIUM_AVAILABLE
        if self.use_selenium:
            self._init_selenium()
        else:
            self.session = requests.Session()
            self.session.headers.update({
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            })
    
    def _init_selenium(self):
        try:
            options = ChromeOptions()
            options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument(f'user-agent={ua.random}')
            self.driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
        except Exception as e:
            print(f"Selenium init error: {e}")
            self.use_selenium = False
            self.session = requests.Session()

    def _get_headers(self):
        return {
            'User-Agent': ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        }

    def _parse_page(self, html):
        soup = BeautifulSoup(html, 'lxml')
        results = {'organic': [], 'ads': []}
        
        ads = soup.select('.OrganicPureEntity, .serp-item[data-type="adv"]')
        for idx, item in enumerate(ads, 1):
            try:
                link_elem = item.select_one('a.OrganicTitle-link, .OrganicTitle a')
                title_elem = item.select_one('h2.OrganicTitle, .OrganicTitle')
                if link_elem:
                    url = link_elem.get('href', '')
                    title = title_elem.get_text(strip=True) if title_elem else ''
                    results['ads'].append({
                        'position': idx,
                        'domain': extract_domain(url),
                        'title': title,
                        'url': url,
                        'type': 'ad'
                    })
            except Exception:
                continue
        
        organic_items = soup.select('.serp-item:not([data-type="adv"])')
        for idx, item in enumerate(organic_items, 1):
            try:
                link_elem = item.select_one('a.OrganicTitle-link')
                title_elem = item.select_one('h2.OrganicTitle')
                if link_elem:
                    url = link_elem.get('href', '')
                    title = title_elem.get_text(strip=True) if title_elem else ''
                    results['organic'].append({
                        'position': idx,
                        'domain': extract_domain(url),
                        'title': title,
                        'url': url,
                        'type': 'organic'
                    })
            except Exception:
                continue
        
        return results

    def search(self, query, positions=5, result_types=None):
        if result_types is None:
            result_types = ['organic', 'ads']
        
        if self.use_selenium:
            return self._search_selenium(query, positions, result_types)
        else:
            return self._search_requests(query, positions, result_types)
    
    def _search_requests(self, query, positions, result_types):
        all_results = {'organic': [], 'ads': []}
        
        params = {
            'text': query,
            'lr': self.region,
            'nocfg': '1',
            'numdoc': str(positions * 2)
        }
        
        try:
            time.sleep(random.uniform(self.delay * 0.5, self.delay * 1.5))
            
            response = self.session.get(
                self.BASE_URL,
                params=params,
                headers=self._get_headers(),
                timeout=15
            )
            response.raise_for_status()
            
            results = self._parse_page(response.text)
            
            for rt in result_types:
                if rt in results:
                    all_results[rt] = results[rt][:positions]
            
        except requests.RequestException as e:
            print(f"Request error: {e}")
        except Exception as e:
            print(f"Parse error: {e}")
        
        return all_results
    
    def _search_selenium(self, query, positions, result_types):
        all_results = {'organic': [], 'ads': []}
        
        try:
            search_url = f"{self.BASE_URL}?text={quote(query)}&lr={self.region}"
            self.driver.get(search_url)
            time.sleep(random.uniform(2, 4))
            
            html = self.driver.page_source
            results = self._parse_page(html)
            
            for rt in result_types:
                if rt in results:
                    all_results[rt] = results[rt][:positions]
                    
        except Exception as e:
            print(f"Selenium search error: {e}")
        
        return all_results
    
    def __del__(self):
        if self.use_selenium and hasattr(self, 'driver'):
            try:
                self.driver.quit()
            except:
                pass

    def find_competitors(self, queries, positions=5, result_types=None):
        competitors = {}
        
        for query in queries:
            results = self.search(query, positions, result_types)
            
            for result_type in result_types or ['organic', 'ads']:
                for item in results.get(result_type, []):
                    domain = item['domain']
                    if not is_excluded_domain(domain):
                        if domain not in competitors:
                            competitors[domain] = {
                                'domain': domain,
                                'found_in_queries': [],
                                'positions': {},
                                'types': []
                            }
                        competitors[domain]['found_in_queries'].append(query)
                        competitors[domain]['positions'][query] = item['position']
                        if result_type not in competitors[domain]['types']:
                            competitors[domain]['types'].append(result_type)
            
            time.sleep(random.uniform(1, 2))
        
        return list(competitors.values())
