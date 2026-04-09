import { useEffect, useState } from 'react'

import CourseCard from '../../components/courses/CourseCard'
import ErrorMessage from '../../components/common/ErrorMessage'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { listCourses } from '../../services/api'

export default function CourseList() {
  const [courses, setCourses] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await listCourses(page)
        setCourses(data.results)
        setCount(data.count)
      } catch {
        setError('Failed to load courses.')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [page])

  const totalPages = Math.max(1, Math.ceil(count / 10))

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">All Courses</h1>
          <p className="text-sm text-slate-600">Browse public course catalog.</p>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <>
          {courses.length === 0 ? (
            <p className="text-sm text-slate-600">No courses found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-700">Page {page} of {totalPages}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
