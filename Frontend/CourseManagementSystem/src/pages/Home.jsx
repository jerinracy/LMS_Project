import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiBookOpen, FiClock, FiGrid, FiUsers } from 'react-icons/fi'
import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaXTwitter } from 'react-icons/fa6'

import CourseCard from '../components/courses/CourseCard'
import ErrorMessage from '../components/common/ErrorMessage'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuth } from '../contexts/useAuth'
import { listCourses } from '../services/api'

export default function Home() {
  const { user, isAuthenticated } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAllCourses = async () => {
      setLoading(true)
      setError('')

      try {
        const allCourses = []
        let page = 1
        let totalCount = 0

        while (true) {
          const data = await listCourses(page)
          allCourses.push(...(data.results || []))
          totalCount = data.count || allCourses.length

          if (!data.next || allCourses.length >= totalCount || !data.results?.length) {
            break
          }

          page += 1
        }

        setCourses(allCourses)
      } catch {
        setError('Failed to load courses for the home page.')
      } finally {
        setLoading(false)
      }
    }

    fetchAllCourses()
  }, [])

  const totalLessons = useMemo(
    () => courses.reduce((sum, course) => sum + (course.lesson_count ?? course.lessons?.length ?? 0), 0),
    [courses],
  )

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 pb-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-r from-slate-900 via-sky-900 to-slate-800 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-sky-100">
              Modern Learning Platform
            </p>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Learn practical skills from every published course in one place
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-200 sm:text-base">
              Browse the complete catalog, enroll fast, and keep learning progress visible across devices.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/courses" className="btn-primary">
                Open Catalog
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                  Create Free Account
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-sky-100">Total Courses</p>
              <p className="mt-2 text-2xl font-bold">{courses.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-sky-100">Total Lessons</p>
              <p className="mt-2 text-2xl font-bold">{totalLessons}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-sky-100">Account Status</p>
              <p className="mt-2 text-sm font-semibold">{isAuthenticated ? `${user?.username} (${user?.role})` : 'Guest'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card border border-slate-200 p-5">
          <FiGrid className="h-6 w-6 text-sky-700" />
          <h2 className="mt-3 text-base font-semibold text-slate-900">Complete Catalog</h2>
          <p className="mt-1 text-sm text-slate-600">See every published course directly on the home page.</p>
        </div>
        <div className="card border border-slate-200 p-5">
          <FiBookOpen className="h-6 w-6 text-sky-700" />
          <h2 className="mt-3 text-base font-semibold text-slate-900">Structured Lessons</h2>
          <p className="mt-1 text-sm text-slate-600">Each course displays instructor and lesson depth clearly.</p>
        </div>
        <div className="card border border-slate-200 p-5">
          <FiClock className="h-6 w-6 text-sky-700" />
          <h2 className="mt-3 text-base font-semibold text-slate-900">Track Progress</h2>
          <p className="mt-1 text-sm text-slate-600">Students can continue and monitor completion seamlessly.</p>
        </div>
        <div className="card border border-slate-200 p-5">
          <FiUsers className="h-6 w-6 text-sky-700" />
          <h2 className="mt-3 text-base font-semibold text-slate-900">Role Based Access</h2>
          <p className="mt-1 text-sm text-slate-600">Clean workflows for students, instructors, and admins.</p>
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">All Courses</h2>
            <p className="text-sm text-slate-600">This list is loaded from the complete course catalog.</p>
          </div>
          <Link to="/courses" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
            Open paginated view
          </Link>
        </div>

        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}

        {!loading && !error && (
          <>
            {courses.length === 0 ? (
              <p className="text-sm text-slate-600">No courses are available right now.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <footer className="rounded-2xl border border-slate-200 bg-slate-900 px-5 py-8 text-slate-100 shadow-sm sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <section>
            <h3 className="text-lg font-semibold">CourseMS Learning Ltd.</h3>
            <p className="mt-2 text-sm text-slate-300">
              123 Skill Avenue, Tech Park, Learning City, 4500
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Building practical skills through accessible online education.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">Contact</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li>Email: contact@coursems.example</li>
              <li>Phone: +1 (555) 017-2486</li>
              <li>Support: Mon-Fri, 9:00 AM-6:00 PM</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold">Social</h3>
            <div className="mt-3 flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="rounded-full bg-white/10 p-2.5 text-slate-100 hover:bg-white/20">
                <FaFacebookF className="h-4 w-4" />
              </a>
              <a href="#" aria-label="X" className="rounded-full bg-white/10 p-2.5 text-slate-100 hover:bg-white/20">
                <FaXTwitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Whatsapp" className="rounded-full bg-white/10 p-2.5 text-slate-100 hover:bg-white/20">
                <FaWhatsapp className="h-4 w-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="rounded-full bg-white/10 p-2.5 text-slate-100 hover:bg-white/20">
                <FaLinkedinIn className="h-4 w-4" />
              </a>
            </div>
          </section>
        </div>

        <p className="mt-8 border-t border-white/10 pt-4 text-xs text-slate-400">
          © 2026 CourseMS Learning Ltd. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
