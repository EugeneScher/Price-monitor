import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import time
import random
from fake_useragent import UserAgent
import re

ua = UserAgent()


class SiteParser:
    def __init__(self, delay=1):
        self.delay = delay
        self.session = requests.Session()
        
    def _get_headers(self):
        return {
            'User-Agent': ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        }

    def _clean_price(self, price_str):
        if not price_str:
            return None
        price_str = re.sub(r'[^\d.,]', '', price_str)
        price_str = price_str.replace(',', '.')
        try:
            return float(price_str)
        except:
            return None

    def _try_selectors(self, soup, selectors):
        for selector in selectors:
            elements = soup.select(selector)
            if elements:
                return elements
        return []

    def get_page(self, url):
        try:
            time.sleep(random.uniform(self.delay * 0.5, self.delay * 1.5))
            response = self.session.get(url, headers=self._get_headers(), timeout=15)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None

    def parse_products(self, html, name_selector, price_selector, sku_selector=None):
        if not html:
            return []
        
        soup = BeautifulSoup(html, 'lxml')
        products = []
        
        name_elements = self._try_selectors(soup, name_selector.split(',') if ',' in name_selector else [name_selector])
        price_elements = self._try_selectors(soup, price_selector.split(',') if ',' in price_selector else [price_selector])
        sku_elements = self._try_selectors(soup, [sku_selector]) if sku_selector else []
        
        min_len = min(len(name_elements), len(price_elements))
        
        for i in range(min_len):
            name = name_elements[i].get_text(strip=True)
            price_text = price_elements[i].get_text(strip=True)
            price = self._clean_price(price_text)
            sku = sku_elements[i].get_text(strip=True) if i < len(sku_elements) else None
            
            if name:
                products.append({
                    'name': name,
                    'price': price,
                    'currency': 'RUB',
                    'external_id': sku
                })
        
        return products

    def verify_selectors(self, html, name_selector, price_selector, sku_selector=None):
        if not html:
            return {'valid': False, 'name_count': 0, 'price_count': 0, 'sample_names': [], 'sample_prices': []}
        
        soup = BeautifulSoup(html, 'lxml')
        
        name_elements = self._try_selectors(soup, [name_selector])
        price_elements = self._try_selectors(soup, [price_selector])
        sku_elements = self._try_selectors(soup, [sku_selector]) if sku_selector else []
        
        sample_names = [el.get_text(strip=True) for el in name_elements[:5] if el.get_text(strip=True)]
        sample_prices = [el.get_text(strip=True) for el in price_elements[:5] if el.get_text(strip=True)]
        sample_skus = [el.get_text(strip=True) for el in sku_elements[:5] if el.get_text(strip=True)]
        
        return {
            'valid': len(name_elements) > 0 and len(price_elements) > 0,
            'name_count': len(name_elements),
            'price_count': len(price_elements),
            'sku_count': len(sku_elements),
            'sample_names': sample_names,
            'sample_prices': sample_prices,
            'sample_skus': sample_skus
        }

    def test_selector(self, url, selector, selector_type='name'):
        html = self.get_page(url)
        if not html:
            return {'success': False, 'elements': [], 'count': 0}
        
        soup = BeautifulSoup(html, 'lxml')
        elements = soup.select(selector)
        
        sample_texts = [el.get_text(strip=True) for el in elements[:5] if el.get_text(strip=True)]
        
        return {
            'success': len(elements) > 0,
            'count': len(elements),
            'sample_texts': sample_texts
        }
