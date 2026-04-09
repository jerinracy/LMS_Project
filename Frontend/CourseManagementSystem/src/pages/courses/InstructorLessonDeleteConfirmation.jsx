import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import ErrorMessage from '../../components/common/ErrorMessage'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { deleteLesson, getCourseDetails, getLessonDetails } from '../../services/api'

export default function InstructorLessonDeleteConfirmation() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [courseTitle, setCourseTitle] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const [course, lesson] = await Promise.all([
          getCourseDetails(courseId),
          getLessonDetails(courseId, lessonId),
        ])
        setCourseTitle(course?.title || '')
        setLessonTitle(lesson?.title || '')
      } catch {
        setError('Failed to load lesson for delete confirmation.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [courseId, lessonId])

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await deleteLesson(courseId, lessonId)
      toast.success('Lesson deleted successfully.')
      navigate('/instructor/courses')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not delete lesson.')
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
        <h1 className="text-2xl font-semibold text-slate-900">Confirm Lesson Deletion</h1>
        <p className="mt-2 text-sm text-slate-600">
          You are about to permanently delete this lesson from the course.
        </p>

        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">Course</p>
          <p className="text-base font-semibold text-slate-900">
            {courseTitle || location.state?.courseTitle || `Course #${courseId}`}
          </p>
          <p className="mt-3 text-sm text-slate-600">Lesson</p>
          <p className="text-base font-semibold text-slate-900">
            {lessonTitle || location.state?.lessonTitle || `Lesson #${lessonId}`}
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
