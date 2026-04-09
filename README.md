# Course Management System

Course Management System is a full-stack learning platform with a Django REST API backend and a React + Vite frontend. It supports role-based workflows for students, instructors, and admins, including authentication, course publishing, lesson management, student enrollments, and lesson progress tracking.

## Project Overview

This repository is split into two main applications:

- `Backend/`: Django + Django REST Framework API
- `Frontend/CourseManagementSystem/`: React frontend built with Vite

## Core Features

- JWT-based authentication with access and refresh tokens
- Custom user model with `student`, `instructor`, and `admin` roles
- Student registration and login
- Course listing and course detail pages
- Instructor/admin course creation, update, and deletion
- Instructor/admin lesson creation, update, and deletion
- Student course enrollment flow
- Student lesson completion and course progress tracking
- Protected frontend routes based on authenticated user role

## Tech Stack

### Backend

- Python
- Django
- Django REST Framework
- Simple JWT
- SQLite by default, with `DATABASE_URL` support for other databases
- WhiteNoise for static files
- Pillow for image uploads

### Frontend

- React 19
- Vite
- React Router
- Axios
- React Hook Form
- React Hot Toast
- Tailwind CSS

## Project Structure

```text
CourseManagementSystem/
├── Backend/
│   ├── CourseManagementSystem/
│   ├── courses/
│   ├── enrollments/
│   ├── progress/
│   ├── users/
│   ├── .env.example
│   ├── manage.py
│   └── requirements.txt
├── Frontend/
│   └── CourseManagementSystem/
│       ├── public/
│       ├── src/
│       ├── .env.example
│       ├── package.json
│       └── vite.config.js
└── README.md
```

## Backend Details

The backend exposes REST API endpoints under `/api/` and uses a custom `User` model. By default, all API endpoints require authentication unless a view explicitly allows public access.

### Backend Apps

- `users`: registration, login, logout, token refresh, custom roles
- `courses`: courses and lessons
- `enrollments`: student enrollments and enrolled course listing
- `progress`: lesson completion and course-level progress

### Main Backend Endpoints

#### Auth

- `POST /api/users/register/`
- `POST /api/users/login/`
- `POST /api/users/token/refresh/`
- `POST /api/users/logout/`

#### Courses and Lessons

- `GET /api/courses/`
- `POST /api/courses/`
- `GET /api/courses/<id>/`
- `PATCH /api/courses/<id>/`
- `DELETE /api/courses/<id>/`
- `GET /api/courses/<course_id>/lessons/`
- `POST /api/courses/<course_id>/lessons/`
- `GET /api/courses/<course_id>/lessons/<lesson_id>/`
- `PATCH /api/courses/<course_id>/lessons/<lesson_id>/`
- `DELETE /api/courses/<course_id>/lessons/<lesson_id>/`

#### Enrollments and Progress

- `POST /api/enrollments/enroll/`
- `GET /api/enrollments/my-courses/`
- `POST /api/progress/lessons/<lesson_id>/complete/`
- `GET /api/progress/courses/<course_id>/`

### Backend Role Rules

- `student`:
  Can register, browse courses, enroll, open enrolled lessons, and track progress.
- `instructor`:
  Can create and manage their own courses and lessons.
- `admin`:
  Can manage instructor-owned course content and create courses for instructors from the API.

## Frontend Details

The frontend is a React SPA that consumes the Django API using Axios. Authentication state is stored in `localStorage`, and Axios automatically attaches bearer tokens and attempts token refresh on `401` responses.

### Main Frontend Routes

- `/`: home page with course highlights
- `/login`: user login
- `/register`: student registration
- `/courses`: paginated course catalog
- `/courses/:courseId`: course details
- `/courses/:courseId/enroll`: enrollment confirmation for students
- `/my-courses`: enrolled courses for students
- `/courses/:courseId/lessons/:lessonId`: lesson viewer and progress
- `/instructor/courses`: instructor/admin dashboard

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd CourseManagementSystem
```

## Backend Setup

### 1. Move into the backend directory

```bash
cd Backend
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv
source venv/bin/activate
```

On Windows:

```bash
venv\Scripts\activate
```

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 4. Create backend environment file

Copy `Backend/.env.example` to `Backend/.env` and update values as needed.

Example:

```env
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173
```

Notes:

- The project reads environment variables from `Backend/.env`.
- Database configuration uses `DATABASE_URL` when provided.
- If `DATABASE_URL` is not set, Django falls back to SQLite at `Backend/db.sqlite3`.

### 5. Run migrations

```bash
python manage.py migrate
```

### 6. Create an admin user

```bash
python manage.py createsuperuser
```

The custom user manager assigns the `admin` role to superusers automatically.

### 7. Start the backend server

```bash
python manage.py runserver
```

Backend should now be available at:

- `http://127.0.0.1:8000`

## Frontend Setup

### 1. Open a new terminal and move into the frontend directory

```bash
cd Frontend/CourseManagementSystem
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Create frontend environment file

Copy `Frontend/CourseManagementSystem/.env.example` to `Frontend/CourseManagementSystem/.env`.

For local development, use:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### 4. Start the frontend development server

```bash
npm run dev
```

Frontend should now be available at:

- `http://localhost:5173`

## Local Development Workflow

Run both services at the same time:

### Terminal 1

```bash
cd Backend
source venv/bin/activate
python manage.py runserver
```

### Terminal 2

```bash
cd Frontend/CourseManagementSystem
npm install
npm run dev
```

Then open:

- Frontend: `http://localhost:5173`
- Backend API: `http://127.0.0.1:8000/api`
- Django Admin: `http://127.0.0.1:8000/admin/`

## Default User Flow

### Student

1. Register a new account.
2. Log in from the frontend.
3. Browse available courses.
4. Enroll in a course.
5. Open lessons and mark them complete.
6. Track progress from enrolled course pages.

### Instructor

1. Create an instructor user from Django admin or shell.
2. Log in with the instructor account.
3. Open the instructor dashboard.
4. Create courses and add lessons.
5. Edit or delete owned course content.

### Admin

1. Create a superuser with `createsuperuser`.
2. Log in to Django admin and manage users.
3. Use admin privileges to manage course content across instructors.

## Useful Commands

### Backend

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Environment Variables

### Backend `.env`

- `DJANGO_ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- `DATABASE_URL` (optional)

### Frontend `.env`

- `VITE_API_BASE_URL`

## Important Notes

- Student registration creates users with the `student` role only.
- Course thumbnails use Django media storage and require Pillow.
- Lesson video URLs are validated for YouTube and Vimeo links.
- API pagination is enabled on the backend with a default page size of `10`.
- The backend currently runs with `DEBUG = False`, so local media serving configured behind `if settings.DEBUG` will not be active unless that setting is changed.

## Future Improvements

- Add automated backend and frontend test coverage
- Add instructor self-registration or admin role management UI
- Add deployment guides for Render and Vercel
- Add API documentation with Swagger or ReDoc
