import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import ErrorMessage from '../../components/common/ErrorMessage'
import LessonItem from '../../components/courses/LessonItem'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../contexts/useAuth'
import { getCourseDetails, getCourseProgress, markLessonComplete } from '../../services/api'

function getEmbedUrl(videoUrl) {
  if (!videoUrl) {
    return null
  }

  try {
    const url = new URL(videoUrl)
    const host = url.hostname.toLowerCase()

    if (host.includes('youtu.be')) {
      const id = url.pathname.replace('/', '')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (host.includes('youtube.com')) {
      if (url.pathname.startsWith('/embed/')) {
        return videoUrl
      }
      const id = url.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (host.includes('vimeo.com')) {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
  } catch {
    return null
  }

  return null
}

export default function LessonViewer() {
  const { courseId, lessonId } = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  const refreshProgress = async (id) => {
    try {
      const data = await getCourseProgress(id)
      setProgress(data)
    } catch {
      setProgress(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const courseData = await getCourseDetails(courseId)
        if (user?.role === 'student' && !courseData?.is_enrolled) {
          setError('You must enroll in this course before opening lessons.')
          return
        }
        setCourse(courseData)
        await refreshProgress(courseId)
      } catch {
        setError('Unable to load lesson viewer. Ensure you are enrolled in this course.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [courseId, user?.role])

  const selectedLesson = useMemo(
    () => course?.lessons?.find((lesson) => String(lesson.id) === String(lessonId)) || null,
    [course?.lessons, lessonId],
  )
  const embedUrl = useMemo(
    () => getEmbedUrl(selectedLesson?.video_url),
    [selectedLesson?.video_url],
  )

  const handleMarkComplete = async () => {
    if (!selectedLesson) {
      return
    }

    try {
      setUpdating(true)
      await markLessonComplete(selectedLesson.id)
      await refreshProgress(courseId)
      toast.success('Lesson marked as complete.')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not update progress.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6 lg:px-8">
        <ErrorMessage message={error} />
        <div className="mt-3">
          <Link to={`/courses/${courseId}`} className="btn-secondary text-sm">Back to Course Details</Link>
        </div>
      </div>
    )
  }

  if (!course || !selectedLesson) {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6 lg:px-8">
        <ErrorMessage message="Lesson not found in this course." />
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-3 lg:px-8">
      <section className="space-y-4 lg:col-span-2">
        <h1 className="text-2xl font-semibold text-slate-900">{selectedLesson.title}</h1>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          {embedUrl ? (
            <div className="overflow-hidden rounded-lg">
              <iframe
                src={embedUrl}
                title={selectedLesson.title}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Could not embed this video URL.
            </p>
          )}
        </div>

        <button type="button" onClick={handleMarkComplete} disabled={updating} className="btn-primary">
          {updating ? 'Updating...' : 'Mark Lesson Complete'}
        </button>

        {progress && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold text-slate-900">Course Progress</h2>
            <p className="mt-1 text-sm text-slate-600">
              {progress.completed_lessons} / {progress.total_lessons} lessons completed ({progress.progress_percentage}%)
            </p>
            <div className="mt-3 h-2 rounded bg-slate-200">
              <div className="h-2 rounded bg-blue-600" style={{ width: `${progress.progress_percentage}%` }} />
            </div>
          </div>
        )}
      </section>

      <aside className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">All Lessons</h2>
          <Link to={`/courses/${course.id}`} className="text-xs font-medium text-blue-700 hover:text-blue-800">Course Page</Link>
        </div>

        <ul className="space-y-2">
          {course.lessons.map((lesson) => (
            <LessonItem key={lesson.id} lesson={lesson} courseId={course.id} showOpenLink />
          ))}
        </ul>
      </aside>
    </div>
  )
}
