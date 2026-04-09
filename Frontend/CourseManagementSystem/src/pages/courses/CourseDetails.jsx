import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import ErrorMessage from '../../components/common/ErrorMessage'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../contexts/useAuth'
import { getCourseDetails } from '../../services/api'

const fallbackImage = 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=60'

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) {
    return 'N/A'
  }
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs.toString().padStart(2, '0')}s`
}

export default function CourseDetails() {
  const { courseId } = useParams()
  const { user, isAuthenticated } = useAuth()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getCourseDetails(courseId)
        setCourse(data)
      } catch {
        setError('Failed to load course details.')
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [courseId])

  const canEnroll = useMemo(() => {
    if (!isAuthenticated || user?.role !== 'student') {
      return false
    }
    if (course?.is_enrolled) {
      return false
    }
    return user?.id !== course?.instructor?.id
  }, [course?.instructor?.id, course?.is_enrolled, isAuthenticated, user?.id, user?.role])

  const isStudent = isAuthenticated && user?.role === 'student'
  const isEnrolledStudent = isStudent && Boolean(course?.is_enrolled)
  const firstLessonId = course?.lessons?.[0]?.id

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ErrorMessage message={error} />
      </div>
    )
  }

  if (!course) {
    return null
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 pb-10 sm:px-6 lg:px-8">
      <img src={course.thumbnail || fallbackImage} alt={course.title} className="h-64 w-full rounded-xl object-cover sm:h-72" />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">{course.title}</h1>
            <p className="text-sm text-slate-600">Instructor: {course.instructor?.username}</p>
          </div>
          <span className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {course.lessons?.length || 0} lessons
          </span>
        </div>

        <p className="mt-4 text-slate-700">{course.description}</p>

        {isStudent && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            {isEnrolledStudent
              ? 'You are enrolled in this course. You can open lessons now.'
              : 'You are not enrolled yet. You can see the lesson list, but cannot open lessons.'}
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        {canEnroll && (
          <Link to={`/courses/${course.id}/enroll`} className="btn-primary">
            Enroll Now
          </Link>
        )}

        {isEnrolledStudent && firstLessonId && (
          <Link to={`/courses/${course.id}/lessons/${firstLessonId}`} className="btn-primary">
            Start Learning
          </Link>
        )}

        {isStudent && (
          <Link to="/my-courses" className="btn-secondary">Go to My Courses</Link>
        )}

        {isAuthenticated && (user?.role === 'instructor' || user?.role === 'admin') && (
          <Link to="/instructor/courses" className="btn-secondary">Manage Courses</Link>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Lessons</h2>
        {course.lessons?.length ? (
          <ul className="space-y-2">
            {course.lessons.map((lesson) => (
              <li key={lesson.id} className="rounded-md border border-slate-200 px-3 py-3">
                {isEnrolledStudent ? (
                  <Link
                    to={`/courses/${course.id}/lessons/${lesson.id}`}
                    className="font-medium text-blue-700 hover:text-blue-800 hover:underline"
                  >
                    {lesson.order}. {lesson.title}
                  </Link>
                ) : (
                  <p className="font-medium text-slate-900">
                    {lesson.order}. {lesson.title}
                  </p>
                )}
                <p className="text-xs text-slate-500">Duration: {formatDuration(lesson.duration)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600">No lessons in this course yet.</p>
        )}
      </section>
    </div>
  )
}
