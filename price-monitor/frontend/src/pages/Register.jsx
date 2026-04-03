import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  
  const { register } = useAuth()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    
    if (!email) {
      newErrors.email = 'Email обязателен'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Некорректный формат email'
    }
    
    if (!password) {
      newErrors.password = 'Пароль обязателен'
    } else if (password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов'
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Подтверждение пароля обязательно'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setLoading(true)

    try {
      await register(email, password)
      success('Регистрация прошла успешно!')
      navigate('/dashboard')
    } catch (err) {
      showError(err.response?.data?.error || 'Произошла ошибка при регистрации')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = password.length >= 6 ? 'bg-green-500' : password.length >= 4 ? 'bg-yellow-500' : 'bg-gray-300'

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Регистрация</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Уже есть аккаунт? <Link to="/login" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">Войти</Link>
          </p>
        </div>

        <form className="card space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors({ ...errors, email: '' })
                }}
                className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="example@mail.ru"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors({ ...errors, password: '' })
                }}
                className={`input-field pl-10 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Минимум 6 символов"
              />
            </div>
            {password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${passwordStrength} transition-all`} style={{ width: `${Math.min(100, password.length * 10)}%` }}></div>
                </div>
                <span className="text-xs text-gray-500">
                  {password.length < 4 ? 'Слабый' : password.length < 6 ? 'Средний' : 'Надёжный'}
                </span>
              </div>
            )}
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Подтверждение пароля
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
                }}
                className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="Повторите пароль"
              />
            </div>
            {confirmPassword && !errors.confirmPassword && password === confirmPassword && (
              <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Пароли совпадают
              </p>
            )}
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                Регистрация...
              </span>
            ) : 'Зарегистрироваться'}
          </button>
        </form>
      </div>
    </div>
  )
}
