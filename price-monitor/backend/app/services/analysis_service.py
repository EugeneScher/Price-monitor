from ..models import db, User, Analysis, Competitor, Product, ProductLink, SearchResult
from ..utils import YandexParser, DuckDuckGoParser, MockSearchParser, SiteParser, extract_domain


class AnalysisService:
    @staticmethod
    def create_analysis(user_id, analysis_type, region, queries):
        analysis = Analysis(
            user_id=user_id,
            analysis_type=analysis_type,
            region=region,
            queries='\n'.join(queries) if isinstance(queries, list) else queries
        )
        db.session.add(analysis)
        db.session.commit()
        return analysis

    @staticmethod
    def get_user_analyses(user_id):
        return Analysis.query.filter_by(user_id=user_id).order_by(Analysis.created_at.desc()).all()

    @staticmethod
    def get_analysis_by_id(analysis_id, user_id=None):
        query = Analysis.query.filter_by(id=analysis_id)
        if user_id:
            query = query.filter_by(user_id=user_id)
        return query.first()

    @staticmethod
    def delete_analysis(analysis_id, user_id):
        analysis = Analysis.query.filter_by(id=analysis_id, user_id=user_id).first()
        if analysis:
            db.session.delete(analysis)
            db.session.commit()
            return True
        return False


class CompetitorService:
    @staticmethod
    def add_competitor(analysis_id, domain, competitor_type=None, position=None, is_user_site=False, 
                       title_selector=None, price_selector=None):
        competitor = Competitor(
            analysis_id=analysis_id,
            domain=domain,
            competitor_type=competitor_type,
            position=position,
            is_user_site=is_user_site,
            title_selector=title_selector,
            price_selector=price_selector
        )
        db.session.add(competitor)
        db.session.commit()
        return competitor

    @staticmethod
    def get_competitors(analysis_id):
        return Competitor.query.filter_by(analysis_id=analysis_id).all()

    @staticmethod
    def update_selectors(competitor_id, title_selector, price_selector, sku_selector=None):
        competitor = Competitor.query.get(competitor_id)
        if competitor:
            competitor.title_selector = title_selector
            competitor.price_selector = price_selector
            competitor.sku_selector = sku_selector
            db.session.commit()
            return competitor
        return None

    @staticmethod
    def delete_competitor(competitor_id):
        competitor = Competitor.query.get(competitor_id)
        if competitor:
            db.session.delete(competitor)
            db.session.commit()
            return True
        return False


class ProductService:
    @staticmethod
    def add_product(competitor_id, name, price, currency='RUB', external_id=None):
        product = Product(
            competitor_id=competitor_id,
            name=name,
            price=price,
            currency=currency,
            external_id=external_id
        )
        db.session.add(product)
        db.session.commit()
        return product

    @staticmethod
    def get_competitor_products(competitor_id):
        return Product.query.filter_by(competitor_id=competitor_id).all()

    @staticmethod
    def update_product(product_id, name=None, price=None):
        product = Product.query.get(product_id)
        if product:
            if name is not None:
                product.name = name
            if price is not None:
                product.price = price
            db.session.commit()
            return product
        return None


class ProductLinkService:
    @staticmethod
    def link_products(analysis_id, user_product_id, competitor_product_id):
        existing = ProductLink.query.filter_by(
            analysis_id=analysis_id,
            user_product_id=user_product_id,
            competitor_product_id=competitor_product_id
        ).first()
        
        if existing:
            return existing
        
        link = ProductLink(
            analysis_id=analysis_id,
            user_product_id=user_product_id,
            competitor_product_id=competitor_product_id
        )
        db.session.add(link)
        db.session.commit()
        return link

    @staticmethod
    def unlink_products(link_id):
        link = ProductLink.query.get(link_id)
        if link:
            db.session.delete(link)
            db.session.commit()
            return True
        return False

    @staticmethod
    def get_analysis_links(analysis_id):
        return ProductLink.query.filter_by(analysis_id=analysis_id).all()


class SearchService:
    @staticmethod
    def perform_search(analysis_id, queries, positions, result_types, region):
        parser = MockSearchParser(region=region)
        competitors = parser.find_competitors(queries, positions)
        
        saved_competitors = []
        for comp in competitors:
            competitor = CompetitorService.add_competitor(
                analysis_id=analysis_id,
                domain=comp['domain'],
                competitor_type=','.join(comp['types']) if comp['types'] else 'organic'
            )
            saved_competitors.append(competitor)
            
            for query in comp.get('found_in_queries', []):
                position = comp['positions'].get(query)
                result_type = comp['types'][0] if comp['types'] else 'organic'
                
                search_result = SearchResult(
                    analysis_id=analysis_id,
                    query=query,
                    result_type=result_type,
                    position=position,
                    domain=comp['domain'],
                    title='',
                    url=''
                )
                db.session.add(search_result)
        
        db.session.commit()
        return saved_competitors


class SiteParsingService:
    @staticmethod
    def parse_competitor_site(competitor_id, url, title_selector, price_selector, sku_selector=None):
        parser = SiteParser()
        html = parser.get_page(url)
        
        if not html:
            return []
        
        products = parser.parse_products(html, title_selector, price_selector, sku_selector)
        
        competitor = Competitor.query.get(competitor_id)
        if competitor:
            competitor.title_selector = title_selector
            competitor.price_selector = price_selector
            competitor.sku_selector = sku_selector
        
        saved_products = []
        for prod in products:
            product = ProductService.add_product(
                competitor_id=competitor_id,
                name=prod['name'],
                price=prod['price'],
                currency=prod.get('currency', 'RUB'),
                external_id=prod.get('external_id')
            )
            saved_products.append(product)
        
        return saved_products

    @staticmethod
    def verify_selectors(competitor_id, url, title_selector, price_selector, sku_selector=None):
        parser = SiteParser()
        html = parser.get_page(url)
        
        if not html:
            return {'valid': False, 'name_count': 0, 'price_count': 0}
        
        return parser.verify_selectors(html, title_selector, price_selector, sku_selector)

    @staticmethod
    def test_selector(competitor_id, url, selector, selector_type):
        parser = SiteParser()
        return parser.test_selector(url, selector, selector_type)
