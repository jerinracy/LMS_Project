import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FiBookOpen, FiChevronDown, FiChevronUp, FiLayers, FiSearch } from 'react-icons/fi'

import ErrorMessage from '../../components/common/ErrorMessage'
import LessonItem from '../../components/courses/LessonItem'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../contexts/useAuth'
import {
  createCourse,
  createLesson,
  listCourses,
  listLessons,
} from '../../services/api'

export default function InstructorCourseManagement() {
  const { user } = useAuth()

  const {
    register: registerCourse,
    handleSubmit: submitCourse,
    reset: resetCourse,
    formState: { isSubmitting: isCreatingCourse },
  } = useForm()

  const {
    register: registerLesson,
    handleSubmit: submitLesson,
    reset: resetLesson,
    formState: { isSubmitting: isCreatingLesson },
  } = useForm()

  const [courses, setCourses] = useState([])
  const [lessonsByCourse, setLessonsByCourse] = useState({})
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [expandedCourseId, setExpandedCourseId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const visibleCourses = useMemo(() => {
    if (user?.role === 'admin') {
      return courses
    }
    return courses.filter((course) => course.instructor?.id === user?.id)
  }, [courses, user?.id, user?.role])

  const filteredCourses = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) {
      return visibleCourses
    }
    return visibleCourses.filter((course) => {
      const title = course.title?.toLowerCase() || ''
      const description = course.description?.toLowerCase() || ''
      return title.includes(q) || description.includes(q)
    })
  }, [searchTerm, visibleCourses])

  const totalLessons = useMemo(
    () => visibleCourses.reduce((sum, course) => sum + (lessonsByCourse[course.id]?.length || course.lesson_count || 0), 0),
    [lessonsByCourse, visibleCourses],
  )

  const selectedCourseTitle = useMemo(
    () => visibleCourses.find((course) => String(course.id) === String(selectedCourseId))?.title || 'None selected',
    [selectedCourseId, visibleCourses],
  )

  const fetchCourses = async () => {
    setLoading(true)
    setError('')
    try {
      const firstPage = await listCourses(1)
      setCourses(firstPage.results)

      const lessonPromises = firstPage.results.map(async (course) => {
        const lessons = await listLessons(course.id)
        return [String(course.id), lessons]
      })
      const lessonEntries = await Promise.all(lessonPromises)
      setLessonsByCourse(Object.fromEntries(lessonEntries))
    } catch {
      setError('Failed to load instructor dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    if (!visibleCourses.length) {
      setSelectedCourseId('')
      setExpandedCourseId(null)
      return
    }

    const exists = visibleCourses.some((course) => String(course.id) === String(selectedCourseId))
    if (!exists) {
      const firstCourseId = String(visibleCourses[0].id)
      setSelectedCourseId(firstCourseId)
      setExpandedCourseId(firstCourseId)
    }
  }, [selectedCourseId, visibleCourses])

  const onCreateCourse = async (values) => {
    try {
      const payload = {
        title: values.title,
        description: values.description,
        thumbnail: values.thumbnail?.[0] || null,
      }
      await createCourse(payload)
      toast.success('Course created.')
      resetCourse()
      await fetchCourses()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not create course.')
    }
  }

  const onCreateLesson = async (values) => {
    if (!selectedCourseId) {
      toast.error('Select a course first.')
      return
    }

    try {
      await createLesson(selectedCourseId, {
        title: values.title,
        video_url: values.videoUrl,
        duration: Number(values.duration),
        order: Number(values.order),
      })
      toast.success('Lesson added.')
      resetLesson()
      const updatedLessons = await listLessons(selectedCourseId)
      setLessonsByCourse((prev) => ({
        ...prev,
        [selectedCourseId]: updatedLessons,
      }))
      setExpandedCourseId(String(selectedCourseId))
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not add lesson.')
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-10 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Instructor Dashboard</h1>
        <p className="text-sm text-slate-600 sm:text-base">
          Create courses, add lessons quickly, and keep your catalog organized from one place.
        </p>
      </header>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total Courses</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{visibleCourses.length}</p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total Lessons</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{totalLessons}</p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2 lg:col-span-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">Selected Course</p>
              <p className="mt-2 truncate text-base font-semibold text-slate-900">{selectedCourseTitle}</p>
            </article>
          </section>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Create Course</h2>
              <p className="mt-1 text-sm text-slate-600">Add a new course to your catalog.</p>

              <form className="mt-4 grid grid-cols-1 gap-3" onSubmit={submitCourse(onCreateCourse)}>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Course title</label>
                  <input className="input-field" placeholder="e.g. React for Beginners" {...registerCourse('title', { required: true })} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    className="input-field"
                    placeholder="Write a short and clear course summary"
                    rows={4}
                    {...registerCourse('description', { required: true })}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Thumbnail (optional)</label>
                  <input type="file" accept="image/*" className="input-field" {...registerCourse('thumbnail')} />
                </div>

                <button className="btn-primary w-fit" type="submit" disabled={isCreatingCourse}>
                  {isCreatingCourse ? 'Creating...' : 'Create Course'}
                </button>
              </form>
            </article>

            <article id="add-lesson-form" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Add Lesson</h2>
              <p className="mt-1 text-sm text-slate-600">Pick a course and add lesson content.</p>

              <form className="mt-4 grid grid-cols-1 gap-3" onSubmit={submitLesson(onCreateLesson)}>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Course</label>
                  <select className="input-field" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
                    <option value="">Select a course</option>
                    {visibleCourses.map((course) => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Lesson title</label>
                  <input className="input-field" placeholder="e.g. State and Props" {...registerLesson('title', { required: true })} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Video URL</label>
                  <input className="input-field" placeholder="YouTube or Vimeo URL" {...registerLesson('videoUrl', { required: true })} />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Duration (seconds)</label>
                    <input className="input-field" type="number" min={1} {...registerLesson('duration', { required: true, min: 1 })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Order</label>
                    <input className="input-field" type="number" min={1} {...registerLesson('order', { required: true, min: 1 })} />
                  </div>
                </div>

                <button className="btn-primary w-fit" type="submit" disabled={isCreatingLesson}>
                  {isCreatingLesson ? 'Adding...' : 'Add Lesson'}
                </button>
              </form>
            </article>
          </section>

          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">My Courses</h2>
                <p className="text-sm text-slate-600">Search, open, and manage lessons for each course.</p>
              </div>

              <label className="relative block w-full sm:w-72">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="input-field pl-9"
                  placeholder="Search courses"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
            </div>

            {filteredCourses.length === 0 ? (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {visibleCourses.length ? 'No matching courses found.' : 'No courses found for your account.'}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredCourses.map((course) => {
                  const courseId = String(course.id)
                  const courseLessons = lessonsByCourse[courseId] || []
                  const isOpen = expandedCourseId === courseId

                  return (
                    <article key={course.id} className="rounded-xl border border-slate-200 bg-slate-50/50">
                      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-slate-900">{course.title}</h3>
                          <p className="mt-1 text-sm text-slate-600">{course.description}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <FiBookOpen className="h-4 w-4" />
                              {courseLessons.length} lessons
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <FiLayers className="h-4 w-4" />
                              Course ID: {course.id}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedCourseId(isOpen ? null : courseId)}
                            className="btn-secondary text-sm"
                          >
                            {isOpen ? (
                              <span className="inline-flex items-center gap-1"><FiChevronUp /> Hide Lessons</span>
                            ) : (
                              <span className="inline-flex items-center gap-1"><FiChevronDown /> Show Lessons</span>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCourseId(courseId)
                              setExpandedCourseId(courseId)
                              const section = document.getElementById('add-lesson-form')
                              section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }}
                            className="btn-secondary text-sm"
                          >
                            Add Lesson
                          </button>

                          <Link to={`/courses/${course.id}`} className="btn-secondary text-sm">
                            View Course
                          </Link>

                          <Link
                            to={`/instructor/courses/${course.id}/delete`}
                            state={{ courseTitle: course.title }}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </Link>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="border-t border-slate-200 bg-white px-4 py-3">
                          {courseLessons.length ? (
                            <ul className="space-y-2">
                              {courseLessons.map((lesson) => (
                                <LessonItem
                                  key={lesson.id}
                                  lesson={lesson}
                                  courseId={course.id}
                                  actionSlot={(
                                    <div className="flex items-center gap-2">
                                      <Link
                                        to={`/instructor/courses/${course.id}/lessons/${lesson.id}/edit`}
                                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                                      >
                                        Edit
                                      </Link>
                                      <Link
                                        to={`/instructor/courses/${course.id}/lessons/${lesson.id}/delete`}
                                        state={{ lessonTitle: lesson.title, courseTitle: course.title }}
                                        className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
                                      >
                                        Delete
                                      </Link>
                                    </div>
                                  )}
                                />
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-slate-600">No lessons yet. Use “Add Lesson” to create the first one.</p>
                          )}
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
