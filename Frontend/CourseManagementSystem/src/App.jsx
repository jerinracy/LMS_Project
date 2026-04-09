import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import Navbar from './components/common/Navbar'
import PrivateRoute from './components/common/PrivateRoute'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import CourseDetails from './pages/courses/CourseDetails'
import EnrollConfirmation from './pages/courses/EnrollConfirmation'
import CourseList from './pages/courses/CourseList'
import InstructorCourseManagement from './pages/courses/InstructorCourseManagement'
import InstructorCourseDeleteConfirmation from './pages/courses/InstructorCourseDeleteConfirmation'
import InstructorLessonDeleteConfirmation from './pages/courses/InstructorLessonDeleteConfirmation'
import InstructorLessonEdit from './pages/courses/InstructorLessonEdit'
import LessonViewer from './pages/courses/LessonViewer'
import MyEnrolledCourses from './pages/courses/MyEnrolledCourses'

function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">The page you requested does not exist.</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-app-gradient text-slate-900">
          <Navbar />

          <main className="pt-20 md:pt-24">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/courses" element={<CourseList />} />
              <Route path="/courses/:courseId" element={<CourseDetails />} />

              <Route
                path="/my-courses"
                element={(
                  <PrivateRoute roles={['student']}>
                    <MyEnrolledCourses />
                  </PrivateRoute>
                )}
              />

              <Route
                path="/courses/:courseId/lessons/:lessonId"
                element={(
                  <PrivateRoute roles={['student']}>
                    <LessonViewer />
                  </PrivateRoute>
                )}
              />

              <Route
                path="/courses/:courseId/enroll"
                element={(
                  <PrivateRoute roles={['student']}>
                    <EnrollConfirmation />
                  </PrivateRoute>
                )}
              />

              <Route
                path="/instructor/courses"
                element={(
                  <PrivateRoute roles={['instructor', 'admin']}>
                    <InstructorCourseManagement />
                  </PrivateRoute>
                )}
              />

              <Route
                path="/instructor/courses/:courseId/delete"
                element={(
                  <PrivateRoute roles={['instructor', 'admin']}>
                    <InstructorCourseDeleteConfirmation />
                  </PrivateRoute>
                )}
              />

              <Route
                path="/instructor/courses/:courseId/lessons/:lessonId/edit"
                element={(
                  <PrivateRoute roles={['instructor', 'admin']}>
                    <InstructorLessonEdit />
                  </PrivateRoute>
                )}
              />

              <Route
                path="/instructor/courses/:courseId/lessons/:lessonId/delete"
                element={(
                  <PrivateRoute roles={['instructor', 'admin']}>
                    <InstructorLessonDeleteConfirmation />
                  </PrivateRoute>
                )}
              />

              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>

        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  )
}
