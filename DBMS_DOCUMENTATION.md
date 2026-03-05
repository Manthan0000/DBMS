# 📊 DBMS Documentation - College ERP System

## 1. Database Design Overview

This document provides comprehensive documentation of the database design, normalization process, functional dependencies, and implementation details for the College ERP System.

## 2. Entity Relationship Diagram (ERD)

### Entities and Relationships

```
┌─────────────┐
│    Users    │
└──────┬──────┘
       │
       ├───(1:1)───┐
       │           │
       │      ┌────▼────┐
       │      │ Students│
       │      └────┬────┘
       │           │
       │      ┌────▼────────┐
       │      │ Departments │
       │      └────┬────────┘
       │           │
       ├───(1:1)───┤
       │           │
       │      ┌────▼────────┐
       │      │ Professors  │
       │      └─────────────┘
       │
       └───(1:1)───┐
                   │
              ┌────▼────┐
              │  Admins │
              └─────────┘

┌──────────────┐      ┌──────────────┐
│   Courses    │      │    Terms     │
└──────┬───────┘      └──────┬───────┘
       │                     │
       └──────────┬───────────┘
                  │
         ┌────────▼──────────┐
         │ Course Offerings  │
         └────────┬───────────┘
                  │
         ┌────────┼────────┐
         │        │        │
    ┌────▼────┐ ┌─▼────┐ ┌─▼──────────┐
    │Teaching │ │Enroll│ │Class       │
    │Assign.  │ │ments │ │Sessions    │
    └─────────┘ └──┬───┘ └──┬─────────┘
                    │        │
              ┌─────▼────────▼─────┐
              │ Attendance Records │
              └────────────────────┘

┌──────────────┐      ┌──────────────┐
│ Assessments  │      │ Fee Invoices│
└──────┬───────┘      └──────┬───────┘
       │                     │
       │              ┌───────▼───────┐
       │              │   Payments    │
       │              └────────────────┘
       │
┌──────▼───────┐
│ Grade Records│
└──────────────┘
```

## 3. Functional Dependencies (FDs)

### 3.1 Users Table
- `user_id → email, password_hash, role, created_at, updated_at`
- `email → user_id` (Unique constraint)

### 3.2 Students Table
- `student_id → user_id, roll_no, first_name, last_name, department_id, ...`
- `roll_no → student_id` (Unique constraint)
- `user_id → student_id` (Unique constraint)
- `student_id → department_id` (Foreign key)

### 3.3 Professors Table
- `professor_id → user_id, emp_no, first_name, last_name, department_id, ...`
- `emp_no → professor_id` (Unique constraint)
- `user_id → professor_id` (Unique constraint)
- `professor_id → department_id` (Foreign key)

### 3.4 Departments Table
- `department_id → name, created_at`
- `name → department_id` (Unique constraint)

### 3.5 Courses Table
- `course_id → code, title, description, credits, department_id, ...`
- `code → course_id` (Unique constraint)
- `course_id → department_id` (Foreign key)

### 3.6 Terms Table
- `term_id → name, start_date, end_date, created_at`

### 3.7 Course Offerings Table
- `offering_id → course_id, term_id, section, capacity, created_at`
- `(course_id, term_id, section) → offering_id` (Unique constraint)
- `offering_id → course_id` (Foreign key)
- `offering_id → term_id` (Foreign key)

### 3.8 Teaching Assignments Table
- `(offering_id, professor_id) → [no other attributes]`
- Composite Primary Key: `(offering_id, professor_id)`

### 3.9 Enrollments Table
- `(offering_id, student_id) → enrolled_at`
- Composite Primary Key: `(offering_id, student_id)`

### 3.10 Class Sessions Table
- `session_id → offering_id, session_date, topic, created_at`
- `session_id → offering_id` (Foreign key)

### 3.11 Attendance Records Table
- `(session_id, student_id) → status, marked_at`
- Composite Primary Key: `(session_id, student_id)`

### 3.12 Assessments Table
- `assessment_id → offering_id, name, type, max_marks, due_date, created_at`
- `assessment_id → offering_id` (Foreign key)

### 3.13 Grade Records Table
- `(assessment_id, student_id) → marks, graded_at`
- Composite Primary Key: `(assessment_id, student_id)`

### 3.14 Fee Invoices Table
- `invoice_id → student_id, term_id, total_amount, status, created_at, due_date`
- `(student_id, term_id) → invoice_id` (Unique constraint)

### 3.15 Payments Table
- `payment_id → invoice_id, amount, payment_date, payment_method, transaction_id`
- `payment_id → invoice_id` (Foreign key)

## 4. Minimal Cover

The minimal cover (canonical cover) of functional dependencies:

1. **Users:** `user_id → email, password_hash, role`
2. **Students:** `student_id → user_id, roll_no, department_id, first_name, last_name`
3. **Professors:** `professor_id → user_id, emp_no, department_id, first_name, last_name`
4. **Departments:** `department_id → name`
5. **Courses:** `course_id → code, title, credits, department_id`
6. **Terms:** `term_id → name, start_date, end_date`
7. **Course Offerings:** `offering_id → course_id, term_id, section`
8. **Composite Keys:** All composite keys represent minimal covers for their respective tables

## 5. Candidate Keys

### Primary Keys (Chosen)
- Users: `user_id`
- Students: `student_id`
- Professors: `professor_id`
- Admins: `admin_id`
- Departments: `department_id`
- Courses: `course_id`
- Terms: `term_id`
- Course Offerings: `offering_id`
- Teaching Assignments: `(offering_id, professor_id)`
- Enrollments: `(offering_id, student_id)`
- Class Sessions: `session_id`
- Attendance Records: `(session_id, student_id)`
- Assessments: `assessment_id`
- Grade Records: `(assessment_id, student_id)`
- Fee Invoices: `invoice_id`
- Payments: `payment_id`

### Alternate Keys
- Users: `email`
- Students: `roll_no`, `user_id`
- Professors: `emp_no`, `user_id`
- Courses: `code`
- Course Offerings: `(course_id, term_id, section)`
- Fee Invoices: `(student_id, term_id)`

## 6. Normalization Proof

### 6.1 First Normal Form (1NF)

✅ **All tables are in 1NF:**
- All attributes are atomic (no multi-valued attributes)
- No repeating groups
- Each row is unique

**Example:** The `Enrollments` table stores each enrollment as a separate row with composite key `(offering_id, student_id)`, not as arrays or nested structures.

### 6.2 Second Normal Form (2NF)

✅ **All tables are in 2NF:**
- All tables are in 1NF
- All non-key attributes are fully functionally dependent on the primary key
- No partial dependencies

**Example:** In `Students` table, all attributes (`first_name`, `last_name`, `department_id`, etc.) are fully dependent on `student_id`, not on any subset of the key.

**Composite Key Tables:**
- `TeachingAssignments`: No non-key attributes, so automatically in 2NF
- `Enrollments`: `enrolled_at` is fully dependent on `(offering_id, student_id)`
- `AttendanceRecords`: `status` and `marked_at` are fully dependent on `(session_id, student_id)`
- `GradeRecords`: `marks` and `graded_at` are fully dependent on `(assessment_id, student_id)`

### 6.3 Third Normal Form (3NF)

✅ **All tables are in 3NF:**
- All tables are in 2NF
- No transitive dependencies
- All non-key attributes are non-transitively dependent on the primary key

**Proof by Example:**

**Students Table:**
- `student_id → department_id` (direct dependency)
- `student_id → first_name, last_name` (direct dependency)
- No transitive dependency: `student_id → department_id → department_name` is handled by foreign key relationship, not stored redundantly

**Course Offerings Table:**
- `offering_id → course_id` (direct dependency)
- `offering_id → term_id` (direct dependency)
- Course details (title, credits) are accessed via `course_id` foreign key, not stored redundantly

**Fee Invoices Table:**
- `invoice_id → student_id` (direct dependency)
- `invoice_id → term_id` (direct dependency)
- Student and term details are accessed via foreign keys, not stored redundantly

### 6.4 Why No Transitive Dependencies?

Transitive dependencies are eliminated because:

1. **Foreign Key Relationships:** Instead of storing redundant data, we use foreign keys to reference related entities
   - Example: `Students.department_id` → `Departments.department_id` (not storing `department_name` in Students)

2. **Normalized Design:** Each entity stores only its own attributes
   - Example: `CourseOfferings` stores `course_id`, not `course_title` or `course_credits`

3. **Proper Decomposition:** Related data is separated into different tables
   - Example: User authentication (`Users`) is separate from role-specific data (`Students`, `Professors`, `Admins`)

## 7. Database Constraints

### 7.1 Primary Key Constraints
- Every table has a primary key
- Composite primary keys used where appropriate

### 7.2 Foreign Key Constraints
- All foreign keys have proper referential integrity
- `ON DELETE CASCADE` used where appropriate:
  - Deleting a User cascades to Student/Professor/Admin
  - Deleting a Course Offering cascades to Enrollments, Sessions, Assessments

### 7.3 Unique Constraints
- `Users.email` - Unique
- `Students.roll_no` - Unique
- `Students.user_id` - Unique
- `Professors.emp_no` - Unique
- `Professors.user_id` - Unique
- `Courses.code` - Unique
- `Departments.name` - Unique
- `CourseOfferings(course_id, term_id, section)` - Unique
- `FeeInvoices(student_id, term_id)` - Unique

### 7.4 Check Constraints (Business Logic)

Implemented in application layer (Prisma/API):

1. **Enrollment Capacity:** Students cannot enroll if course is full
2. **Attendance Validation:** Attendance can only be marked for enrolled students
3. **Grade Validation:** Grades can only be entered for enrolled students
4. **Marks Validation:** Grades cannot exceed `max_marks`
5. **Payment Validation:** Payments cannot exceed invoice total

### 7.5 Data Types
- UUIDs for primary keys
- Decimal for monetary values and marks
- DateTime for timestamps
- ENUMs for status fields (UserRole, AttendanceStatus)

## 8. Database Triggers (Business Logic)

While Prisma doesn't support triggers directly, the following business logic is enforced in the application layer:

### 8.1 Enrollment Validation Trigger
**Logic:** Before inserting into `Enrollments`, check:
- Student is not already enrolled
- Course offering has available capacity

**Implementation:** API route validation in `/api/enrollments`

### 8.2 Attendance Validation Trigger
**Logic:** Before inserting/updating `AttendanceRecords`, check:
- Student is enrolled in the course offering

**Implementation:** API route validation in `/api/attendance`

### 8.3 Grade Validation Trigger
**Logic:** Before inserting/updating `GradeRecords`, check:
- Student is enrolled in the course offering
- Marks do not exceed `max_marks`

**Implementation:** API route validation in `/api/grades`

### 8.4 Payment Validation Trigger
**Logic:** Before inserting into `Payments`, check:
- Payment amount does not exceed remaining invoice amount
- Update invoice status (PENDING → PARTIAL → PAID)

**Implementation:** API route validation in `/api/payments`

## 9. Indexes

### Primary Indexes
- All primary keys are automatically indexed

### Secondary Indexes
- `Users.email` - For login lookups
- `Users.role` - For role-based queries
- `Students.roll_no` - For student lookups
- `Students.department_id` - For department filtering
- `Professors.emp_no` - For professor lookups
- `Professors.department_id` - For department filtering
- `Courses.code` - For course lookups
- `CourseOfferings.course_id` - For course filtering
- `CourseOfferings.term_id` - For term filtering
- `Enrollments.student_id` - For student enrollment queries
- `AttendanceRecords.student_id` - For student attendance queries
- `GradeRecords.student_id` - For student grade queries
- `FeeInvoices.student_id` - For student fee queries
- `FeeInvoices.status` - For status filtering
- `Payments.invoice_id` - For invoice payment queries
- `Payments.payment_date` - For date range queries
- `Terms.start_date`, `end_date` - For term queries
- `ClassSessions.session_date` - For date-based queries

## 10. Data Integrity

### 10.1 Referential Integrity
- All foreign keys maintain referential integrity
- Cascade deletes ensure data consistency
- Orphaned records cannot exist

### 10.2 Domain Integrity
- ENUMs restrict values (UserRole, AttendanceStatus)
- Data types ensure correct format
- Validation in application layer ensures business rules

### 10.3 Entity Integrity
- Primary keys ensure uniqueness
- NOT NULL constraints on required fields
- Unique constraints prevent duplicates

## 11. Query Optimization

### 11.1 Indexed Columns
- Frequently queried columns are indexed
- Foreign keys are indexed for join performance

### 11.2 Query Patterns
- Use of Prisma's `include` for eager loading
- Avoid N+1 queries with proper includes
- Pagination for large datasets

## 12. Security Considerations

### 12.1 Authentication
- Passwords hashed with bcrypt
- JWT tokens for session management
- Secure cookie storage

### 12.2 Authorization
- Role-based access control (RBAC)
- Middleware protection for routes
- API-level permission checks

### 12.3 Data Protection
- Input validation with Zod
- SQL injection prevention via Prisma
- XSS protection via React

## 13. Conclusion

The College ERP System database is:

✅ **Fully Normalized** - All tables are in 3NF
✅ **Properly Constrained** - Primary keys, foreign keys, unique constraints
✅ **Well Indexed** - Optimized for common query patterns
✅ **Secure** - Authentication, authorization, input validation
✅ **Scalable** - Proper relationships, no redundancy
✅ **Maintainable** - Clear structure, documented dependencies

This database design follows industry best practices and is suitable for academic DBMS projects requiring demonstration of normalization, functional dependencies, and proper database design principles.
