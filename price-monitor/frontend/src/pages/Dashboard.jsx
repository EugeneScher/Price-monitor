import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../utils/api'
import { Plus, Calendar, Globe, Trash2, Eye, Search, Edit3, ChevronLeft, ChevronRight, Filter, TrendingUp, Users, BarChart3 } from 'lucide-react'
import { formatDate } from '../utils/export'
import { AnalysisHistoryChart, CompetitorsDistribution } from '../components/Charts'

const ITEMS_PER_PAGE = 10

export default function Dashboard() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewAnalysisModal, setShowNewAnalysisModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchAnalyses()
  }, [])

  const fetchAnalyses = async () => {
    try {
      const response = await api.get('/analysis')
      setAnalyses(response.data.analyses)
    } catch (error) {
      console.error('Error fetching analyses:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteAnalysis = async (id) => {
    try {
      await api.delete(`/analysis/${id}`)
      setAnalyses(analyses.filter(a => a.id !== id))
      success('Анализ удалён')
    } catch (error) {
      showError('Ошибка при удалении')
    }
  }

  const filteredAnalyses = useMemo(() => {
    return analyses.filter(a => {
      const matchesType = filterType === 'all' || a.analysis_type === filterType
      const matchesSearch = !searchQuery || 
        a.queries?.some(q => q.toLowerCase().includes(searchQuery.toLowerCase())) ||
        a.region?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [analyses, filterType, searchQuery])

  const totalPages = Math.ceil(filteredAnalyses.length / ITEMS_PER_PAGE)
  const paginatedAnalyses = filteredAnalyses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [filterType, searchQuery])

  const stats = {
    total: analyses.length,
    autoCount: analyses.filter(a => a.analysis_type === 'auto').length,
    manualCount: analyses.filter(a => a.analysis_type === 'manual').length,
    totalCompetitors: analyses.reduce((acc, a) => acc + (a.competitors_count || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Мои анализы</h1>
          <p className="text-gray-600 mt-1">Управление анализами цен конкурентов</p>
        </div>
        <button
          onClick={() => setShowNewAnalysisModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Новый анализ</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-sm text-gray-500">Всего анализов</p>
          </div>
        </div>
        
        <div className="card flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
            <Search className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.autoCount}</p>
            <p className="text-sm text-gray-500">Автоматических</p>
          </div>
        </div>
        
        <div className="card flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
            <Edit3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.manualCount}</p>
            <p className="text-sm text-gray-500">Ручных</p>
          </div>
        </div>
        
        <div className="card flex items-center space-x-4">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
            <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCompetitors}</p>
            <p className="text-sm text-gray-500">Конкурентов</p>
          </div>
        </div>
      </div>

      {analyses.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">История анализов</h3>
            <div className="h-48">
              <AnalysisHistoryChart analyses={analyses} />
            </div>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Распределение типов</h3>
            <div className="h-48">
              <CompetitorsDistribution competitors={analyses} />
            </div>
          </div>
        </div>
      )}

      {analyses.length === 0 ? (
        <div className="card text-center py-12">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">У вас пока нет анализов</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Создайте первый анализ, чтобы начать отслеживать цены конкурентов</p>
          <button
            onClick={() => setShowNewAnalysisModal(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Создать анализ</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Все анализы ({filteredAnalyses.length})
            </h2>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-8 py-1.5 text-sm w-48"
                />
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field py-1.5 text-sm"
              >
                <option value="all">Все типы</option>
                <option value="auto">Автоматические</option>
                <option value="manual">Ручные</option>
              </select>
            </div>
          </div>
          
          {paginatedAnalyses.length === 0 ? (
            <div className="card text-center py-8">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Нет анализов по заданным фильтрам</p>
            </div>
          ) : (
            paginatedAnalyses.map((analysis) => (
            <div key={analysis.id} className="card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                    {analysis.analysis_type === 'auto' ? 'Автоматический' : 'Ручной'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {analysis.competitors_count} конкурентов
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(analysis.created_at)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Globe className="h-4 w-4" />
                    <span>{analysis.region}</span>
                  </span>
                </div>
                {analysis.queries && analysis.queries.length > 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    Запросы: {analysis.queries.slice(0, 3).join(', ')}
                    {analysis.queries.length > 3 && ` и ещё ${analysis.queries.length - 3}`}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to={`/analysis/${analysis.id}`}
                  className="btn-secondary flex items-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>Открыть</span>
                </Link>
                <button
                  onClick={() => deleteAnalysis(analysis.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNewAnalysisModal && (
        <NewAnalysisModal
          onClose={() => setShowNewAnalysisModal(false)}
          onSuccess={(analysis) => {
            setShowNewAnalysisModal(false)
            navigate(`/analysis/${analysis.id}`)
          }}
        />
      )}
    </div>
  )
}

function NewAnalysisModal({ onClose, onSuccess }) {
  const [analysisType, setAnalysisType] = useState('auto')
  const [region, setRegion] = useState('213')
  const [regionSearch, setRegionSearch] = useState('')
  const [queries, setQueries] = useState('')
  const [positions, setPositions] = useState(5)
  const [resultTypes, setResultTypes] = useState(['organic'])
  const [userSite, setUserSite] = useState('')
  const [competitors, setCompetitors] = useState([''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const regions = [
    { value: '213', label: 'Москва' },
    { value: '2', label: 'Санкт-Петербург' },
    { value: '109', label: 'Екатеринбург' },
    { value: '47', label: 'Новосибирск' },
    { value: '43', label: 'Краснодар' },
    { value: '120', label: 'Казань' },
    { value: '54', label: 'Самара' },
    { value: '24', label: 'Воронеж' },
    { value: '62', label: 'Минск' },
    { value: '157', label: 'Алматы' },
    { value: '187', label: 'Ташкент' },
    { value: '102', label: 'Уфа' },
    { value: '45', label: 'Красноярск' },
    { value: '10', label: 'Волгоград' },
    { value: '76', label: 'Пермь' },
    { value: '39', label: 'Ростов-на-Дону' },
    { value: '38', label: 'Владивосток' },
    { value: '30', label: 'Иркутск' },
    { value: '65', label: 'Челябинск' },
    { value: '58', label: 'Саратов' }
  ]

  const filteredRegions = regions.filter(r => 
    r.label.toLowerCase().includes(regionSearch.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = {
        type: analysisType,
        region,
        queries: queries.split('\n').filter(q => q.trim()),
        positions,
        result_types: resultTypes
      }

      if (analysisType === 'manual') {
        data.user_site = userSite
        data.competitors = competitors.filter(c => c.trim()).map(domain => ({ domain: domain.trim() }))
      }

      const response = await api.post('/analysis', data)
      onSuccess(response.data.analysis)
    } catch (err) {
      setError(err.response?.data?.error || 'Произошла ошибка при создании анализа')
    } finally {
      setLoading(false)
    }
  }

  const addCompetitor = () => {
    if (competitors.length < 3) {
      setCompetitors([...competitors, ''])
    }
  }

  const removeCompetitor = (index) => {
    setCompetitors(competitors.filter((_, i) => i !== index))
  }

  const updateCompetitor = (index, value) => {
    const updated = [...competitors]
    updated[index] = value
    setCompetitors(updated)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Новый анализ</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Тип анализа</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAnalysisType('auto')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  analysisType === 'auto' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Search className="h-6 w-6 text-primary-600 mb-2" />
                <h4 className="font-semibold">Автоматический поиск</h4>
                <p className="text-sm text-gray-600">Система найдёт конкурентов по вашим запросам</p>
              </button>
              <button
                type="button"
                onClick={() => setAnalysisType('manual')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  analysisType === 'manual' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Edit3 className="h-6 w-6 text-primary-600 mb-2" />
                <h4 className="font-semibold">Ручной ввод</h4>
                <p className="text-sm text-gray-600">Укажите сайты конкурентов самостоятельно</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Регион (с поиском)</label>
            <div className="relative">
              <input
                type="text"
                value={regionSearch}
                onChange={(e) => {
                  setRegionSearch(e.target.value)
                  const found = regions.find(r => r.label.toLowerCase().includes(e.target.value.toLowerCase()))
                  if (found) setRegion(found.value)
                }}
                placeholder="Поиск региона..."
                className="input-field mb-2"
              />
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="input-field"
              >
                {filteredRegions.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {analysisType === 'auto' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Поисковые запросы (один на строку, до 10)
                </label>
                <textarea
                  value={queries}
                  onChange={(e) => setQueries(e.target.value)}
                  className="input-field min-h-[120px]"
                  placeholder="iphone 15&#10;samsung galaxy s24&#10;xiaomi 14"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Количество позиций (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={positions}
                    onChange={(e) => setPositions(parseInt(e.target.value) || 5)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Тип выдачи</label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={resultTypes.includes('organic')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setResultTypes([...resultTypes, 'organic'])
                          } else {
                            setResultTypes(resultTypes.filter(t => t !== 'organic'))
                          }
                        }}
                        className="rounded text-primary-600"
                      />
                      <span className="text-sm">Органическая</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={resultTypes.includes('ads')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setResultTypes([...resultTypes, 'ads'])
                          } else {
                            setResultTypes(resultTypes.filter(t => t !== 'ads'))
                          }
                        }}
                        className="rounded text-primary-600"
                      />
                      <span className="text-sm">Реклама</span>
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          {analysisType === 'manual' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ваш сайт</label>
                <input
                  type="text"
                  value={userSite}
                  onChange={(e) => setUserSite(e.target.value)}
                  className="input-field"
                  placeholder="example.ru"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Конкуренты (до 3)
                </label>
                {competitors.map((comp, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={comp}
                      onChange={(e) => updateCompetitor(index, e.target.value)}
                      className="input-field flex-1"
                      placeholder={`Сайт конкурента ${index + 1}`}
                    />
                    {competitors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCompetitor(index)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                {competitors.length < 3 && (
                  <button
                    type="button"
                    onClick={addCompetitor}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Добавить конкурента</span>
                  </button>
)}
              </div>
            </div>
          ))}
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500">
                Показано {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredAnalyses.length)} из {filteredAnalyses.length}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary p-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary p-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Создание...</span>
                </>
              ) : (
                <>
                  <span>Создать анализ</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
