import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, Search, TrendingUp, Clock, Shield, Zap } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

  const handleDemoClick = () => {
    navigate('/dashboard', { state: { demo: true } })
  }
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Анализ цен конкурентов в Яндексе
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Автоматический мониторинг ценовой политики конкурентов без ручного труда. 
              Экономьте время и принимайте решения на основе данных.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={handleDemoClick} className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                Начать бесплатно
              </button>
              <Link to="/login" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Войти
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Как это работает</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Наш сервис автоматически собирает данные о ценах конкурентов из поисковой выдачи Яндекс
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">1. Введите запросы</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Укажите поисковые запросы и регион для анализа. Система найдёт ваших конкурентов автоматически.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">2. Автоматический сбор</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Мы собираем данные о ценах с сайтов конкурентов и формируем сравнительный отчёт.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">3. Анализируйте</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Получите детальный отчёт с экспортом в Excel или CSV для дальнейшего анализа.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Преимущества</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start space-x-3">
              <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">Экономия времени</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Автоматический сбор данных вместо ручного мониторинга</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Zap className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">Актуальность</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Данные обновляются в реальном времени</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">Точность</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Исключение человеческого фактора и ошибок</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <BarChart3 className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">Визуализация</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Графики и диаграммы для удобного анализа</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Готовы начать?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Зарегистрируйтесь бесплатно и начните отслеживать цены конкурентов уже сегодня
          </p>
          <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors inline-block">
            Регистрация
          </Link>
        </div>
      </section>
    </div>
  )
}
