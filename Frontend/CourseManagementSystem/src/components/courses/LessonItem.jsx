import { Link } from 'react-router-dom'

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) {
    return 'N/A'
  }
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs.toString().padStart(2, '0')}s`
}

export default function LessonItem({ lesson, courseId, showOpenLink = false, actionSlot }) {
  return (
    <li className="flex flex-col gap-3 rounded-md border border-slate-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-slate-900">{lesson.order}. {lesson.title}</p>
        <p className="text-xs text-slate-500">Duration: {formatDuration(lesson.duration)}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {showOpenLink && (
          <Link to={`/courses/${courseId}/lessons/${lesson.id}`} className="btn-secondary text-xs">
            Open
          </Link>
        )}
        {actionSlot}
      </div>
    </li>
  )
}
