class MockSearchParser:
    
    def __init__(self, region='213', delay=1):
        self.region = region
        self.delay = delay
    
    def find_competitors(self, queries, positions=5):
        import time
        time.sleep(1)  # Simulate search delay
        
        # Mock competitors based on common e-commerce sites
        mock_competitors = {
            'amazon.com': {
                'domain': 'amazon.com',
                'found_in_queries': [],
                'positions': {},
                'types': ['organic']
            },
            'ebay.com': {
                'domain': 'ebay.com',
                'found_in_queries': [],
                'positions': {},
                'types': ['organic']
            },
            'ozon.ru': {
                'domain': 'ozon.ru',
                'found_in_queries': [],
                'positions': {},
                'types': ['organic']
            },
            'wildberries.ru': {
                'domain': 'wildberries.ru',
                'found_in_queries': [],
                'positions': {},
                'types': ['organic']
            },
            'aliexpress.com': {
                'domain': 'aliexpress.com',
                'found_in_queries': [],
                'positions': {},
                'types': ['organic']
            }
        }
        
        competitors = {}
        for query in queries:
            # Select 2-3 random competitors for each query
            import random
            selected = random.sample(list(mock_competitors.keys()), min(3, len(mock_competitors)))
            
            for idx, domain in enumerate(selected, 1):
                if domain not in competitors:
                    competitors[domain] = mock_competitors[domain].copy()
                    competitors[domain]['found_in_queries'] = []
                    competitors[domain]['positions'] = {}
                
                competitors[domain]['found_in_queries'].append(query)
                competitors[domain]['positions'][query] = idx
        
        return list(competitors.values())
    
    def search(self, query, positions=5, result_types=None):
        return {'organic': [], 'ads': []}
