import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import CourseCard from '../../components/courses/CourseCard'
import ErrorMessage from '../../components/common/ErrorMessage'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { listMyEnrollments } from '../../services/api'

export default function MyEnrolledCourses() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await listMyEnrollments()
        setEnrollments(data.results)
      } catch {
        setError('Failed to load enrolled courses.')
      } finally {
        setLoading(false)
      }
    }

    fetchEnrollments()
  }, [])

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-slate-900">My Enrolled Courses</h1>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <>
          {enrollments.length === 0 ? (
            <p className="text-sm text-slate-600">You are not enrolled in any course yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {enrollments.map((item) => (
                <CourseCard
                  key={item.id}
                  course={item.course}
                  actionSlot={item.course.lessons?.length ? (
                    <Link to={`/courses/${item.course.id}/lessons/${item.course.lessons[0].id}`} className="btn-secondary text-sm">
                      Open Learning
                    </Link>
                  ) : null}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
