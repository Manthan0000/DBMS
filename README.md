# 🎓 College ERP System

A comprehensive **Database Management System (DBMS)** project for college administration built with Next.js, TypeScript, Prisma, and MySQL.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Installation](#installation)
- [Usage](#usage)
- [DBMS Documentation](#dbms-documentation)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Student, Professor)
- Secure password hashing with bcrypt

### 👨‍💼 Admin Features
- Dashboard with statistics (Students, Professors, Courses, Revenue)
- Manage Students (CRUD operations)
- Manage Professors (CRUD operations)
- Manage Courses (CRUD operations)
- View Enrollments
- View Attendance Records
- View Grades
- Manage Fee Invoices

### 🎓 Student Features
- Personal Dashboard
- View Enrolled Courses
- View Attendance Records
- View Grades
- View Fee Invoices and Payment History

### 👨‍🏫 Professor Features
- Teaching Dashboard
- View Assigned Courses
- Mark Student Attendance
- Enter Grades
- Create Assessments

## 🛠 Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS, Shadcn UI
- **Backend:** Next.js API Routes
- **Database:** MySQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Zod

## 🗄 Database Schema

The database is fully normalized to **3NF (Third Normal Form)** with proper relationships, constraints, and triggers.

### Entity Relationship Diagram

```
Users (1) ──┬── (1) Students
            ├── (1) Professors
            └── (1) Admins

Students (N) ── (1) Departments
Professors (N) ── (1) Departments
Courses (N) ── (1) Departments

CourseOfferings (N) ── (1) Courses
CourseOfferings (N) ── (1) Terms

TeachingAssignments (N) ── (1) CourseOfferings
TeachingAssignments (N) ── (1) Professors

Enrollments (N) ── (1) CourseOfferings
Enrollments (N) ── (1) Students

ClassSessions (N) ── (1) CourseOfferings
AttendanceRecords (N) ── (1) ClassSessions
AttendanceRecords (N) ── (1) Students

Assessments (N) ── (1) CourseOfferings
GradeRecords (N) ── (1) Assessments
GradeRecords (N) ── (1) Students

FeeInvoices (N) ── (1) Students
FeeInvoices (N) ── (1) Terms
Payments (N) ── (1) FeeInvoices
```

### Tables

1. **Users** - Authentication and user management
2. **Students** - Student information
3. **Professors** - Professor information
4. **Admins** - Admin information
5. **Departments** - Academic departments
6. **Courses** - Course catalog
7. **Terms** - Academic terms/semesters
8. **CourseOfferings** - Course instances in specific terms
9. **TeachingAssignments** - Professor-course assignments
10. **Enrollments** - Student course enrollments
11. **ClassSessions** - Individual class meetings
12. **AttendanceRecords** - Student attendance
13. **Assessments** - Exams, quizzes, assignments
14. **GradeRecords** - Student grades
15. **FeeInvoices** - Fee invoices
16. **Payments** - Payment records

## 🚀 Installation

### Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd college-erp-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/college_erp"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Push schema to database
   npx prisma db push

   # Seed database with sample data
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Default Login Credentials

After seeding the database, you can login with:

**Admin:**
- Email: `admin@college.edu`
- Password: `password123`

**Student:**
- Email: `student1@college.edu`
- Password: `password123`

**Professor:**
- Email: `prof1@college.edu`
- Password: `password123`

### Database Management

- **Prisma Studio** (Visual Database Browser):
  ```bash
  npm run db:studio
  ```

- **Create Migration:**
  ```bash
  npm run db:migrate
  ```

## 📚 DBMS Documentation

### Functional Dependencies

The database schema follows these functional dependencies:

1. **Users:**
   - `user_id → email, password_hash, role`
   - `email → user_id` (unique)

2. **Students:**
   - `student_id → user_id, roll_no, department_id, first_name, last_name`
   - `roll_no → student_id` (unique)
   - `user_id → student_id` (unique)

3. **Professors:**
   - `professor_id → user_id, emp_no, department_id, first_name, last_name`
   - `emp_no → professor_id` (unique)
   - `user_id → professor_id` (unique)

4. **Courses:**
   - `course_id → code, title, department_id, credits`
   - `code → course_id` (unique)

5. **CourseOfferings:**
   - `offering_id → course_id, term_id, section`
   - `(course_id, term_id, section) → offering_id` (unique)

6. **Enrollments:**
   - `(offering_id, student_id) → enrolled_at`

7. **AttendanceRecords:**
   - `(session_id, student_id) → status, marked_at`

8. **GradeRecords:**
   - `(assessment_id, student_id) → marks`

9. **FeeInvoices:**
   - `invoice_id → student_id, term_id, total_amount, status`
   - `(student_id, term_id) → invoice_id` (unique)

### Candidate Keys

1. **Users:** `user_id` (Primary), `email` (Alternate)
2. **Students:** `student_id` (Primary), `roll_no` (Alternate), `user_id` (Alternate)
3. **Professors:** `professor_id` (Primary), `emp_no` (Alternate), `user_id` (Alternate)
4. **Courses:** `course_id` (Primary), `code` (Alternate)
5. **CourseOfferings:** `offering_id` (Primary), `(course_id, term_id, section)` (Alternate)
6. **Enrollments:** `(offering_id, student_id)` (Composite Primary Key)
7. **TeachingAssignments:** `(offering_id, professor_id)` (Composite Primary Key)
8. **AttendanceRecords:** `(session_id, student_id)` (Composite Primary Key)
9. **GradeRecords:** `(assessment_id, student_id)` (Composite Primary Key)
10. **FeeInvoices:** `invoice_id` (Primary), `(student_id, term_id)` (Alternate)

### Normalization (3NF)

The database is normalized to **Third Normal Form (3NF)**:

1. **First Normal Form (1NF):** ✅
   - All attributes are atomic
   - No repeating groups

2. **Second Normal Form (2NF):** ✅
   - All non-key attributes are fully functionally dependent on the primary key
   - No partial dependencies

3. **Third Normal Form (3NF):** ✅
   - No transitive dependencies
   - All non-key attributes are non-transitively dependent on the primary key

### Constraints

- **Primary Keys:** All tables have primary keys
- **Foreign Keys:** Proper referential integrity with CASCADE deletes
- **Unique Constraints:** Email, roll_no, emp_no, course code, etc.
- **Check Constraints:** Status enums, marks validation
- **Composite Keys:** Used where appropriate (Enrollments, Attendance, Grades)

### Triggers (Business Logic)

The following business rules are enforced:

1. **Enrollment Validation:** Students can only enroll in courses if capacity allows
2. **Attendance Validation:** Attendance can only be marked for enrolled students
3. **Grade Validation:** Grades can only be entered for enrolled students
4. **Payment Validation:** Payments cannot exceed invoice total amount
5. **Marks Validation:** Grades cannot exceed assessment max_marks

## 🔌 API Documentation

### Authentication

- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Students

- `GET /api/students` - Get all students (Admin/Professor only)
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create student (Admin only)

### Professors

- `GET /api/professors` - Get all professors (Admin only)
- `POST /api/professors` - Create professor (Admin only)

### Courses

- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (Admin only)

### Enrollments

- `GET /api/enrollments` - Get enrollments
- `POST /api/enrollments` - Create enrollment (Admin/Student)

### Attendance

- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance (Admin/Professor)

### Grades

- `GET /api/grades` - Get grade records
- `POST /api/grades` - Create/update grade (Admin/Professor)

### Assessments

- `GET /api/assessments` - Get assessments
- `POST /api/assessments` - Create assessment (Admin/Professor)

### Payments

- `GET /api/payments` - Get payments
- `POST /api/payments` - Create payment (Admin/Student)

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics

## 📁 Project Structure

```
college-erp-system/
├── app/
│   ├── api/              # API routes
│   ├── admin/             # Admin pages
│   ├── student/           # Student pages
│   ├── professor/         # Professor pages
│   ├── login/             # Login page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # UI components (shadcn)
│   └── layout/            # Layout components
├── lib/
│   ├── auth.ts            # Authentication utilities
│   ├── db.ts              # Prisma client
│   ├── validations.ts     # Zod schemas
│   └── utils.ts           # Utility functions
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed script
├── middleware.ts          # Next.js middleware
└── README.md              # This file
```

## 🎯 Future Enhancements

- [ ] Email notifications
- [ ] File uploads for assignments
- [ ] Real-time notifications
- [ ] Advanced analytics and reports
- [ ] Mobile app support
- [ ] Multi-language support
- [ ] Export to PDF/Excel
- [ ] Calendar integration
- [ ] Chat/messaging system

## 📝 License

This project is created for academic purposes as a DBMS project.

## 👥 Contributors

- Created as a comprehensive DBMS academic project

---

**Note:** This is a production-level implementation suitable for academic DBMS projects. The database design follows strict normalization principles and includes proper constraints, relationships, and business logic enforcement.
