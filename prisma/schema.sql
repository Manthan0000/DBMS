-- College ERP System - SQL Schema
-- Fully Normalized to 3NF
-- MySQL Database Schema

-- Create Database
CREATE DATABASE IF NOT EXISTS college_erp;
USE college_erp;

-- ============================================
-- USER MANAGEMENT (Authentication Layer)
-- ============================================

CREATE TABLE Users (
    user_id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'STUDENT', 'PROFESSOR') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- ============================================
-- DEPARTMENT
-- ============================================

CREATE TABLE Departments (
    department_id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- ============================================
-- STUDENT
-- ============================================

CREATE TABLE Students (
    student_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(20),
    address TEXT,
    department_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES Departments(department_id),
    INDEX idx_roll_no (roll_no),
    INDEX idx_department_id (department_id)
);

-- ============================================
-- PROFESSOR
-- ============================================

CREATE TABLE Professors (
    professor_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL,
    emp_no VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    department_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES Departments(department_id),
    INDEX idx_emp_no (emp_no),
    INDEX idx_department_id (department_id)
);

-- ============================================
-- ADMIN
-- ============================================

CREATE TABLE Admins (
    admin_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- ============================================
-- TERM (Semester/Quarter)
-- ============================================

CREATE TABLE Terms (
    term_id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date)
);

-- ============================================
-- COURSE
-- ============================================

CREATE TABLE Courses (
    course_id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    credits INT DEFAULT 3,
    department_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES Departments(department_id),
    INDEX idx_code (code),
    INDEX idx_department_id (department_id)
);

-- ============================================
-- COURSE OFFERING (Course in a specific term)
-- ============================================

CREATE TABLE CourseOfferings (
    offering_id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) NOT NULL,
    term_id VARCHAR(36) NOT NULL,
    section VARCHAR(10) NOT NULL,
    capacity INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (term_id) REFERENCES Terms(term_id) ON DELETE CASCADE,
    UNIQUE KEY unique_offering (course_id, term_id, section),
    INDEX idx_course_id (course_id),
    INDEX idx_term_id (term_id)
);

-- ============================================
-- TEACHING ASSIGNMENT (Professor teaches Course Offering)
-- ============================================

CREATE TABLE TeachingAssignments (
    offering_id VARCHAR(36) NOT NULL,
    professor_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (offering_id, professor_id),
    FOREIGN KEY (offering_id) REFERENCES CourseOfferings(offering_id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES Professors(professor_id) ON DELETE CASCADE,
    INDEX idx_professor_id (professor_id)
);

-- ============================================
-- ENROLLMENT (Student enrolls in Course Offering)
-- ============================================

CREATE TABLE Enrollments (
    offering_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (offering_id, student_id),
    FOREIGN KEY (offering_id) REFERENCES CourseOfferings(offering_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id)
);

-- ============================================
-- CLASS SESSION (Individual class meeting)
-- ============================================

CREATE TABLE ClassSessions (
    session_id VARCHAR(36) PRIMARY KEY,
    offering_id VARCHAR(36) NOT NULL,
    session_date DATETIME NOT NULL,
    topic VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (offering_id) REFERENCES CourseOfferings(offering_id) ON DELETE CASCADE,
    INDEX idx_offering_id (offering_id),
    INDEX idx_session_date (session_date)
);

-- ============================================
-- ATTENDANCE RECORD
-- ============================================

CREATE TABLE AttendanceRecords (
    session_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    status ENUM('PRESENT', 'ABSENT') DEFAULT 'ABSENT',
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id, student_id),
    FOREIGN KEY (session_id) REFERENCES ClassSessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id)
);

-- ============================================
-- ASSESSMENT (Exam, Quiz, Assignment)
-- ============================================

CREATE TABLE Assessments (
    assessment_id VARCHAR(36) PRIMARY KEY,
    offering_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    max_marks DECIMAL(5,2) NOT NULL,
    due_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (offering_id) REFERENCES CourseOfferings(offering_id) ON DELETE CASCADE,
    INDEX idx_offering_id (offering_id)
);

-- ============================================
-- GRADE RECORD
-- ============================================

CREATE TABLE GradeRecords (
    assessment_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    marks DECIMAL(5,2) NOT NULL,
    graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (assessment_id, student_id),
    FOREIGN KEY (assessment_id) REFERENCES Assessments(assessment_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id)
);

-- ============================================
-- FEE INVOICE
-- ============================================

CREATE TABLE FeeInvoices (
    invoice_id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    term_id VARCHAR(36) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE NOT NULL,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (term_id) REFERENCES Terms(term_id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_term (student_id, term_id),
    INDEX idx_student_id (student_id),
    INDEX idx_term_id (term_id),
    INDEX idx_status (status)
);

-- ============================================
-- PAYMENT
-- ============================================

CREATE TABLE Payments (
    payment_id VARCHAR(36) PRIMARY KEY,
    invoice_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) DEFAULT 'ONLINE',
    transaction_id VARCHAR(100),
    FOREIGN KEY (invoice_id) REFERENCES FeeInvoices(invoice_id) ON DELETE CASCADE,
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_payment_date (payment_date)
);

-- ============================================
-- TRIGGERS (Business Logic)
-- ============================================

-- Note: MySQL triggers would be implemented here for:
-- 1. Preventing attendance if student not enrolled
-- 2. Preventing grade entry if student not enrolled
-- 3. Preventing overpayment beyond invoice total
-- 
-- However, these are implemented in the application layer (API routes)
-- for better maintainability and error handling.

-- Example Trigger (for reference):
-- DELIMITER $$
-- CREATE TRIGGER check_enrollment_before_attendance
-- BEFORE INSERT ON AttendanceRecords
-- FOR EACH ROW
-- BEGIN
--     IF NOT EXISTS (
--         SELECT 1 FROM Enrollments e
--         JOIN ClassSessions cs ON e.offering_id = cs.offering_id
--         WHERE cs.session_id = NEW.session_id AND e.student_id = NEW.student_id
--     ) THEN
--         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student not enrolled in this course';
--     END IF;
-- END$$
-- DELIMITER ;
