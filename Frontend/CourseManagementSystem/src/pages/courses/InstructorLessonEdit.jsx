import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import ErrorMessage from '../../components/common/ErrorMessage'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { getCourseDetails, getLessonDetails, updateLesson } from '../../services/api'

export default function InstructorLessonEdit() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [courseTitle, setCourseTitle] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const [course, lesson] = await Promise.all([
          getCourseDetails(courseId),
          getLessonDetails(courseId, lessonId),
        ])

        setCourseTitle(course.title)
        reset({
          title: lesson.title || '',
          videoUrl: lesson.video_url || '',
          duration: lesson.duration || 1,
          order: lesson.order || 1,
        })
      } catch {
        setError('Failed to load lesson details for editing.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [courseId, lessonId, reset])

  const onSubmit = async (values) => {
    try {
      await updateLesson(courseId, lessonId, {
        title: values.title,
        video_url: values.videoUrl,
        duration: Number(values.duration),
        order: Number(values.order),
      })
      toast.success('Lesson updated successfully.')
      navigate('/instructor/courses')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not update lesson.')
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
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Edit Lesson</h1>
        <p className="mt-1 text-sm text-slate-600">
          Course: <span className="font-medium text-slate-800">{courseTitle || `#${courseId}`}</span>
        </p>

        <form className="mt-5 grid grid-cols-1 gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Lesson title</label>
            <input className="input-field" {...register('title', { required: true })} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Video URL</label>
            <input className="input-field" {...register('videoUrl', { required: true })} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Duration (seconds)</label>
              <input className="input-field" type="number" min={1} {...register('duration', { required: true, min: 1 })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Order</label>
              <input className="input-field" type="number" min={1} {...register('order', { required: true, min: 1 })} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <Link to="/instructor/courses" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}
