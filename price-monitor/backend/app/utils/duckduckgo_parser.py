import requests
from bs4 import BeautifulSoup
from urllib.parse import quote, urlparse
import time
import random
from fake_useragent import UserAgent
from .domains import is_excluded_domain, extract_domain
import gzip
from io import BytesIO

ua = UserAgent()

class DuckDuckGoParser:
    BASE_URL = 'https://html.duckduckgo.com/html/'
    
    def __init__(self, region='wt-wt', delay=2):
        self.region = region
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': ua.random
        })
    
    def search(self, query, positions=5):
        all_results = {'organic': [], 'ads': []}
        
        params = {
            'q': query,
            'kl': self.region
        }
        
        try:
            time.sleep(random.uniform(self.delay * 0.5, self.delay * 1.5))
            
            response = self.session.get(
                self.BASE_URL,
                params=params,
                timeout=15
            )
            response.raise_for_status()
            
            # Handle gzip compression
            html = response.text
            if response.headers.get('Content-Encoding') == 'gzip':
                try:
                    html = gzip.decompress(response.content).decode('utf-8')
                except:
                    html = response.text
            
            results = self._parse_page(html)
            all_results['organic'] = results[:positions]
            
        except Exception as e:
            print(f"DuckDuckGo search error: {e}")
        
        return all_results
    
    def _parse_page(self, html):
        soup = BeautifulSoup(html, 'lxml')
        results = []
        
        # DuckDuckGo results are in .result class
        items = soup.select('.result')
        for idx, item in enumerate(items, 1):
            try:
                link_elem = item.select_one('a.result__a')
                if link_elem:
                    url = link_elem.get('href', '')
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
                if not is_excluded_domain(domain):
                    if domain not in competitors:
                        competitors[domain] = {
                            'domain': domain,
                            'found_in_queries': [],
                            'positions': {},
                            'types': ['organic']
                        }
                    competitors[domain]['found_in_queries'].append(query)
                    competitors[domain]['positions'][query] = item['position']
        
        return list(competitors.values())
