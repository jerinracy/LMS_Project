import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import ErrorMessage from '../../components/common/ErrorMessage'
import { useAuth } from '../../contexts/useAuth'

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/courses'

  const onSubmit = async (values) => {
    setError('')
    try {
      await login(values)
      toast.success('Logged in successfully.')
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials.')
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-10 sm:px-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <h1 className="text-2xl font-semibold text-slate-900">Login</h1>

        {error && <ErrorMessage message={error} />}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
          <input className="input-field" {...register('username', { required: 'Username is required' })} />
          {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input type="password" className="input-field" {...register('password', { required: 'Password is required' })} />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-sm text-slate-600">
          New user?{' '}
          <Link to="/register" className="font-medium text-blue-700 hover:text-blue-800">Create account</Link>
        </p>
      </form>
    </div>
  )
}
