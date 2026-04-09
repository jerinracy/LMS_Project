import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import ErrorMessage from '../../components/common/ErrorMessage'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { enrollInCourse, getCourseDetails } from '../../services/api'

const fallbackImage = 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=60'

export default function EnrollConfirmation() {
  const { courseId } = useParams()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getCourseDetails(courseId)
        setCourse(data)
      } catch {
        setError('Failed to load course details for confirmation.')
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

  const handleConfirm = async () => {
    if (!course) {
      return
    }

    try {
      setSubmitting(true)
      await enrollInCourse(course.id)
      toast.success('Enrollment successful.')
      navigate('/courses')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Enrollment failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6 lg:px-8">
        <ErrorMessage message={error} />
      </div>
    )
  }

  if (!course) {
    return null
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6 lg:px-8">
      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Confirm Enrollment</h1>
        <p className="text-sm text-slate-600">
          Please review this course before confirming your enrollment.
        </p>

        <img
          src={course.thumbnail || fallbackImage}
          alt={course.title}
          className="h-56 w-full rounded-xl object-cover sm:h-72"
        />

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">{course.title}</h2>
          <p className="text-sm text-slate-600">Instructor: {course.instructor?.username || 'Unknown'}</p>
          <p className="text-sm text-slate-600">
            Lessons: {course.lesson_count ?? course.lessons?.length ?? 0}
          </p>
          <p className="text-slate-700">{course.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button type="button" onClick={handleConfirm} disabled={submitting} className="btn-primary">
            {submitting ? 'Confirming...' : 'Confirm'}
          </button>
          <Link to="/courses" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </section>
    </div>
  )
}
