import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import { ArrowLeft, Download, Table, Link as LinkIcon, X, Check, Settings } from 'lucide-react'
import { exportToExcel, exportToCSV, formatPrice, formatDate } from '../utils/export'
import { PriceComparisonChart, PriceDifferenceChart } from '../components/Charts'

export default function AnalysisDetail() {
  const { id } = useParams()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('report')
  const [linkingMode, setLinkingMode] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    fetchAnalysis()
  }, [id])

  const fetchAnalysis = async () => {
    try {
      const response = await api.get(`/analysis/${id}`)
      setAnalysis(response.data.analysis)
    } catch (error) {
      console.error('Error fetching analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = () => {
    if (!analysis?.product_links?.length) return
    
    const data = analysis.product_links.map(link => ({
      'Артикул (SKU)': link.competitor_product?.external_id || 'N/A',
      'Товар конкурента': link.competitor_product?.name || 'N/A',
      'Ваш товар': link.user_product?.name || 'N/A',
      'Ваша цена': link.user_product?.price || 'N/A',
      'Цена конкурента': link.competitor_product?.price || 'N/A',
      'Разница (₽)': link.price_difference !== null 
        ? `${link.price_difference > 0 ? '+' : ''}${link.price_difference}` 
        : 'N/A'
    }))
    
    exportToExcel(data, `analysis_${id}_${Date.now()}`)
  }

  const handleExportCSV = () => {
    if (!analysis?.product_links?.length) return
    
    const data = analysis.product_links.map(link => ({
      'SKU': link.competitor_product?.external_id || 'N/A',
      'Товар конкурента': link.competitor_product?.name || 'N/A',
      'Ваш товар': link.user_product?.name || 'N/A',
      'Ваша цена': link.user_product?.price || 'N/A',
      'Цена конкурента': link.competitor_product?.price || 'N/A',
      'Разница (₽)': link.price_difference !== null 
        ? `${link.price_difference > 0 ? '+' : ''}${link.price_difference}` 
        : 'N/A'
    }))
    
    exportToCSV(data, `analysis_${id}_${Date.now()}`)
  }

  const linkProducts = async (userProductId, competitorProductId) => {
    try {
      await api.post('/analysis/link', {
        analysis_id: parseInt(id),
        user_product_id: userProductId,
        competitor_product_id: competitorProductId
      })
      await fetchAnalysis()
      setLinkingMode(null)
      setSelectedProduct(null)
    } catch (error) {
      console.error('Error linking products:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Анализ не найден</h2>
        <Link to="/dashboard" className="btn-primary">Вернуться к списку</Link>
      </div>
    )
  }

  const userCompetitor = analysis.competitors?.find(c => c.is_user_site)
  const competitorList = analysis.competitors?.filter(c => !c.is_user_site) || []

  const chartData = analysis.product_links?.map(link => ({
    competitor: link.competitor_product?.name,
    user_price: link.user_product?.price,
    competitor_price: link.competitor_product?.price,
    price_difference: link.price_difference,
    competitor_product: link.competitor_product?.name
  })) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Назад к списку
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Анализ #{analysis.id}</h1>
            <p className="text-gray-600">
              {formatDate(analysis.created_at)} • Регион: {analysis.region}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handleExportExcel} className="btn-secondary flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Excel</span>
            </button>
            <button onClick={handleExportCSV} className="btn-secondary flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('report')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'report'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Отчёт
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'charts'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Графики
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Товары ({analysis.competitors?.reduce((acc, c) => acc + (c.products?.length || 0), 0) || 0})
          </button>
          <button
            onClick={() => setActiveTab('linking')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'linking'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Связывание ({analysis.product_links?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('competitors')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'competitors'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Конкуренты ({competitorList.length})
          </button>
        </nav>
      </div>

      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Сводный отчёт</h3>
            
            {(!analysis.product_links || analysis.product_links.length === 0) ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Нет данных для отображения</p>
                <p className="text-sm text-gray-400">
                  Для формирования отчёта необходимо связать товары на вкладке "Связывание"
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">SKU</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ваш товар</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ваша цена</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Товар конкурента</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Цена конкурента</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Разница</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analysis.product_links.map((link) => (
                      <tr key={link.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {link.competitor_product?.external_id || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {link.user_product?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatPrice(link.user_product?.price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {link.competitor_product?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatPrice(link.competitor_product?.price)}
                        </td>
                        <td className={`px-4 py-3 text-sm font-medium ${
                          link.price_difference > 0 ? 'text-red-600' : 
                          link.price_difference < 0 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {link.price_difference !== null 
                            ? `${link.price_difference > 0 ? '+' : ''}${formatPrice(link.price_difference)}`
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {analysis.product_links?.length > 0 && (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="card text-center">
                <p className="text-sm text-gray-500">Всего позиций</p>
                <p className="text-2xl font-bold text-gray-900">{analysis.product_links.length}</p>
              </div>
              <div className="card text-center">
                <p className="text-sm text-gray-500">Выше ценой</p>
                <p className="text-2xl font-bold text-red-600">
                  {analysis.product_links.filter(l => l.price_difference > 0).length}
                </p>
              </div>
              <div className="card text-center">
                <p className="text-sm text-gray-500">Ниже ценой</p>
                <p className="text-2xl font-bold text-green-600">
                  {analysis.product_links.filter(l => l.price_difference < 0).length}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'charts' && (
        <div className="space-y-6">
          {chartData.length > 0 ? (
            <>
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Сравнение цен</h3>
                <div className="h-80">
                  <PriceComparisonChart data={chartData} />
                </div>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Разница в ценах</h3>
                <div className="h-80">
                  <PriceDifferenceChart data={chartData} />
                </div>
              </div>
            </>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-500">Нет данных для графиков</p>
              <p className="text-sm text-gray-400 mt-2">
                Свяжите товары на вкладке "Связывание" для отображения графиков
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {userCompetitor && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">
                Ваши товары
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({userCompetitor.products?.length || 0})
                </span>
              </h3>
              {userCompetitor.products?.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {userCompetitor.products.map(product => (
                    <div key={product.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-primary-600 font-semibold">{formatPrice(product.price)}</p>
                        {product.external_id && (
                          <span className="text-xs text-gray-500">SKU: {product.external_id}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Нет товаров</p>
                  <Link 
                    to={`/analysis/${id}/competitor/${userCompetitor.id}/selectors`}
                    className="btn-secondary text-sm"
                  >
                    Настроить селекторы
                  </Link>
                </div>
              )}
            </div>
          )}

          {competitorList.map(competitor => (
            <div key={competitor.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {competitor.domain}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({competitor.products?.length || 0})
                  </span>
                </h3>
                <Link 
                  to={`/analysis/${id}/competitor/${competitor.id}/selectors`}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <Settings className="h-5 w-5" />
                </Link>
              </div>
              {competitor.products?.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {competitor.products.map(product => (
                    <div key={product.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-gray-600">{formatPrice(product.price)}</p>
                        {product.external_id && (
                          <span className="text-xs text-gray-500">SKU: {product.external_id}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Нет товаров</p>
                  <Link 
                    to={`/analysis/${id}/competitor/${competitor.id}/selectors`}
                    className="btn-primary text-sm"
                  >
                    Настроить селекторы
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'linking' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Связывание товаров</h3>
              <p className="text-sm text-gray-500">
                Свяжите ваши товары с товарами конкурентов для формирования отчёта
              </p>
            </div>
            {linkingMode ? (
              <button
                onClick={() => { setLinkingMode(null); setSelectedProduct(null); }}
                className="btn-secondary flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Отмена</span>
              </button>
            ) : (
              <button
                onClick={() => setLinkingMode('user')}
                className="btn-primary flex items-center space-x-2"
              >
                <LinkIcon className="h-4 w-4" />
                <span>Связать товары</span>
              </button>
            )}
          </div>

          {linkingMode === 'user' && (
            <div className="mb-6 p-4 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary-700 mb-2">Выберите ваш товар:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {userCompetitor?.products?.map(product => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`p-3 text-left rounded-lg border-2 transition-all ${
                      selectedProduct?.id === product.id
                        ? 'border-primary-500 bg-white'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{formatPrice(product.price)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {linkingMode === 'competitor' && selectedProduct && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                Выбранный товар: <strong>{selectedProduct.name}</strong>
              </p>
              <p className="text-sm text-gray-500 mb-4">Выберите товар конкурента:</p>
              <div className="grid gap-2">
                {competitorList.map(competitor => (
                  competitor.products?.map(product => (
                    <button
                      key={product.id}
                      onClick={() => linkProducts(selectedProduct.id, product.id)}
                      className="p-3 text-left rounded-lg border-2 border-gray-200 bg-white hover:border-primary-500 transition-all flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{competitor.domain}</p>
                      </div>
                      <span className="text-primary-600 font-semibold">{formatPrice(product.price)}</span>
                    </button>
                  ))
                ))}
              </div>
            </div>
          )}

          {selectedProduct && !linkingMode && (
            <button
              onClick={() => setLinkingMode('competitor')}
              className="btn-primary mb-6"
            >
              Выбрать товар конкурента
            </button>
          )}

          <h4 className="font-medium text-gray-900 mb-3">Текущие связи ({analysis.product_links?.length || 0})</h4>
          {analysis.product_links?.length > 0 ? (
            <div className="space-y-2">
              {analysis.product_links.map(link => (
                <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{link.user_product?.name}</p>
                      <p className="text-xs text-gray-500">{formatPrice(link.user_product?.price)}</p>
                    </div>
                    <span className="text-gray-400">↔</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{link.competitor_product?.name}</p>
                      <p className="text-xs text-gray-500">{formatPrice(link.competitor_product?.price)}</p>
                    </div>
                  </div>
                  <span className={`font-medium ml-4 ${
                    link.price_difference > 0 ? 'text-red-600' : 
                    link.price_difference < 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {link.price_difference !== null 
                      ? `${link.price_difference > 0 ? '+' : ''}${formatPrice(link.price_difference)}`
                      : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Нет связанных товаров</p>
          )}
        </div>
      )}

      {activeTab === 'competitors' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Список конкурентов</h3>
          {competitorList.length > 0 ? (
            <div className="space-y-3">
              {competitorList.map((comp, index) => (
                <div key={comp.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{comp.domain}</p>
                      <p className="text-sm text-gray-500">
                        {comp.products?.length || 0} товаров • {comp.competitor_type}
                      </p>
                    </div>
                  </div>
                  <Link 
                    to={`/analysis/${id}/competitor/${comp.id}/selectors`}
                    className="btn-secondary text-sm"
                  >
                    Настроить
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Конкуренты не найдены</p>
          )}
        </div>
      )}
    </div>
  )
}
