import { z } from 'zod'

// Auth Validations
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'STUDENT', 'PROFESSOR']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
})

// Student Validations
export const createStudentSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rollNo: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  departmentId: z.string().uuid(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
})

// Professor Validations
export const createProfessorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  empNo: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  departmentId: z.string().uuid(),
  phone: z.string().optional(),
})

// Course Validations
export const createCourseSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  credits: z.number().int().min(1).max(6),
  departmentId: z.string().uuid(),
})

// Enrollment Validations
export const enrollmentSchema = z.object({
  offeringId: z.string().uuid(),
  studentId: z.string().uuid(),
})

// Attendance Validations
export const attendanceSchema = z.object({
  sessionId: z.string().uuid(),
  studentId: z.string().uuid(),
  status: z.enum(['PRESENT', 'ABSENT']),
})

// Grade Validations
export const gradeSchema = z.object({
  assessmentId: z.string().uuid(),
  studentId: z.string().uuid(),
  marks: z.number().min(0),
})

// Assessment Validations
export const assessmentSchema = z.object({
  offeringId: z.string().uuid(),
  name: z.string().min(1),
  type: z.string().min(1),
  maxMarks: z.number().min(0),
  dueDate: z.string().optional(),
})

// Payment Validations
export const paymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().min(0),
  paymentMethod: z.string().optional(),
})
