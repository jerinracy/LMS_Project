import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import ErrorMessage from '../../components/common/ErrorMessage'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { deleteCourse, getCourseDetails } from '../../services/api'

export default function InstructorCourseDeleteConfirmation() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getCourseDetails(courseId)
        setCourse(data)
      } catch {
        setError('Failed to load course for delete confirmation.')
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await deleteCourse(courseId)
      toast.success('Course deleted successfully.')
      navigate('/instructor/courses')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not delete course.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-10 sm:px-6 lg:px-8">
        <ErrorMessage message={error} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-red-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Confirm Course Deletion</h1>
        <p className="mt-2 text-sm text-slate-600">
          You are about to permanently delete this course and all associated lessons.
        </p>

        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">Course title</p>
          <p className="text-base font-semibold text-slate-900">
            {course?.title || location.state?.courseTitle || `Course #${courseId}`}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Lessons: {course?.lessons?.length ?? 0}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="btn-danger disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span>{deleting ? 'Deleting...' : 'Confirm Delete'}</span>
          </button>
          <Link to="/instructor/courses" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </section>
    </div>
  )
}
