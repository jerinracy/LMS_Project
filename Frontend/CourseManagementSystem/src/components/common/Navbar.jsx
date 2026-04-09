import { useEffect, useState } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../contexts/useAuth'

function navClass({ isActive }) {
  return isActive
    ? 'block rounded-full bg-white/20 px-3 py-2 text-sm font-semibold text-white'
    : 'block rounded-full px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white'
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const onLogout = async () => {
    await logout()
    setMobileOpen(false)
    navigate('/login')
  }

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-slate-900/95 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-wide text-white">
            CourseMS
          </Link>

          <button
            type="button"
            className="inline-flex items-center rounded-md border border-slate-500 p-2 text-slate-100 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/courses" className={navClass}>
              Courses
            </NavLink>

            {isAuthenticated && user?.role === 'student' && (
              <NavLink to="/my-courses" className={navClass}>
                My Learning
              </NavLink>
            )}

            {isAuthenticated && (user?.role === 'instructor' || user?.role === 'admin') && (
              <NavLink to="/instructor/courses" className={navClass}>
                Manage
              </NavLink>
            )}

            {isAuthenticated ? (
              <>
                <span className="ml-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-slate-100">
                  {user?.username}
                </span>
                <button type="button" onClick={onLogout} className="btn-danger text-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navClass}>
                  Login
                </NavLink>
                <Link to="/register" className="btn-primary text-sm">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>

        {mobileOpen && (
          <nav className="mt-4 space-y-2 border-t border-white/20 pt-4 md:hidden">
            <NavLink to="/courses" className={navClass}>
              Courses
            </NavLink>

            {isAuthenticated && user?.role === 'student' && (
              <NavLink to="/my-courses" className={navClass}>
                My Learning
              </NavLink>
            )}

            {isAuthenticated && (user?.role === 'instructor' || user?.role === 'admin') && (
              <NavLink to="/instructor/courses" className={navClass}>
                Manage
              </NavLink>
            )}

            {isAuthenticated ? (
              <div className="space-y-2 pt-2">
                <p className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-slate-100">
                  {user?.username}
                </p>
                <button type="button" onClick={onLogout} className="btn-danger w-full text-sm">
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <NavLink to="/login" className={navClass}>
                  Login
                </NavLink>
                <Link to="/register" className="btn-primary block w-full text-center text-sm">
                  Register
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
