import { Link } from 'react-router-dom'

const fallbackImage = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=60'

export default function CourseCard({ course, actionSlot }) {
  const thumbnailUrl = course.thumbnail || fallbackImage

  return (
    <article className="card border border-slate-200 p-4 sm:p-5">
      <img src={thumbnailUrl} alt={course.title} className="h-44 w-full rounded-lg object-cover sm:h-48" />

      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">{course.title}</h3>
        <p className="line-clamp-3 text-sm text-slate-600">{course.description}</p>

        <div className="text-xs text-slate-500">
          <p>Instructor: {course.instructor?.username || 'Unknown'}</p>
          <p>Lessons: {course.lesson_count ?? course.lessons?.length ?? 0}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link to={`/courses/${course.id}`} className="btn-primary text-sm sm:min-w-32">
          View Details
        </Link>
        {actionSlot}
      </div>
    </article>
  )
}
