import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import ErrorMessage from '../../components/common/ErrorMessage'
import { useAuth } from '../../contexts/useAuth'

export default function Register() {
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm()
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const onSubmit = async (values) => {
    setError('')
    try {
      await registerUser({
        username: values.username,
        email: values.email,
        first_name: values.firstName,
        last_name: values.lastName,
        password: values.password,
      })
      toast.success('Registration successful. Please login.')
      navigate('/login')
    } catch (err) {
      const apiError = err.response?.data
      if (typeof apiError === 'object') {
        const firstKey = Object.keys(apiError)[0]
        const value = apiError[firstKey]
        setError(Array.isArray(value) ? value[0] : String(value))
      } else {
        setError('Registration failed.')
      }
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-10 sm:px-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>

        {error && <ErrorMessage message={error} />}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">First name</label>
            <input className="input-field" {...register('firstName', { required: 'First name is required' })} />
            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Last name</label>
            <input className="input-field" {...register('lastName', { required: 'Last name is required' })} />
            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
          <input className="input-field" {...register('username', { required: 'Username is required' })} />
          {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input type="email" className="input-field" {...register('email', { required: 'Email is required' })} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input type="password" className="input-field" {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          })} />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Confirm password</label>
          <input type="password" className="input-field" {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === getValues('password') || 'Passwords do not match',
          })} />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>

        <p className="text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-700 hover:text-blue-800">Login</Link>
        </p>
      </form>
    </div>
  )
}
