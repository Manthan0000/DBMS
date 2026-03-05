import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.payment.deleteMany()
  await prisma.feeInvoice.deleteMany()
  await prisma.gradeRecord.deleteMany()
  await prisma.assessment.deleteMany()
  await prisma.attendanceRecord.deleteMany()
  await prisma.classSession.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.teachingAssignment.deleteMany()
  await prisma.courseOffering.deleteMany()
  await prisma.course.deleteMany()
  await prisma.term.deleteMany()
  await prisma.student.deleteMany()
  await prisma.professor.deleteMany()
  await prisma.admin.deleteMany()
  await prisma.user.deleteMany()
  await prisma.department.deleteMany()

  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create Departments
  const csDept = await prisma.department.create({
    data: { name: 'Computer Science' },
  })

  const eeDept = await prisma.department.create({
    data: { name: 'Electrical Engineering' },
  })

  const meDept = await prisma.department.create({
    data: { name: 'Mechanical Engineering' },
  })

  console.log('✅ Created departments')

  // Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@college.edu',
      password_hash: hashedPassword,
      role: 'ADMIN',
      admin: {
        create: {
          first_name: 'Admin',
          last_name: 'User',
        },
      },
    },
  })

  console.log('✅ Created admin user')

  // Create Professors
  const prof1User = await prisma.user.create({
    data: {
      email: 'prof1@college.edu',
      password_hash: hashedPassword,
      role: 'PROFESSOR',
      professor: {
        create: {
          emp_no: 'EMP001',
          first_name: 'John',
          last_name: 'Smith',
          department_id: csDept.department_id,
          phone: '1234567890',
        },
      },
    },
  })

  const prof2User = await prisma.user.create({
    data: {
      email: 'prof2@college.edu',
      password_hash: hashedPassword,
      role: 'PROFESSOR',
      professor: {
        create: {
          emp_no: 'EMP002',
          first_name: 'Jane',
          last_name: 'Doe',
          department_id: csDept.department_id,
          phone: '1234567891',
        },
      },
    },
  })

  const prof3User = await prisma.user.create({
    data: {
      email: 'prof3@college.edu',
      password_hash: hashedPassword,
      role: 'PROFESSOR',
      professor: {
        create: {
          emp_no: 'EMP003',
          first_name: 'Robert',
          last_name: 'Johnson',
          department_id: eeDept.department_id,
          phone: '1234567892',
        },
      },
    },
  })

  console.log('✅ Created professors')

  // Create Students
  const students = []
  for (let i = 1; i <= 20; i++) {
    const dept = i <= 10 ? csDept : i <= 15 ? eeDept : meDept
    const studentUser = await prisma.user.create({
      data: {
        email: `student${i}@college.edu`,
        password_hash: hashedPassword,
        role: 'STUDENT',
        student: {
          create: {
            roll_no: `CS${String(i).padStart(4, '0')}`,
            first_name: `Student${i}`,
            last_name: `Last${i}`,
            department_id: dept.department_id,
            phone: `1234567${String(i).padStart(3, '0')}`,
            date_of_birth: new Date(2000 + (i % 5), i % 12, i % 28 + 1),
          },
        },
      },
    })
    students.push(studentUser)
  }

  console.log('✅ Created students')

  // Create Terms
  const fall2024 = await prisma.term.create({
    data: {
      name: 'Fall 2024',
      start_date: new Date('2024-09-01'),
      end_date: new Date('2024-12-15'),
    },
  })

  const spring2024 = await prisma.term.create({
    data: {
      name: 'Spring 2024',
      start_date: new Date('2024-01-15'),
      end_date: new Date('2024-05-15'),
    },
  })

  console.log('✅ Created terms')

  // Create Courses
  const courses = [
    { code: 'CS101', title: 'Introduction to Programming', credits: 3, dept: csDept },
    { code: 'CS201', title: 'Data Structures', credits: 3, dept: csDept },
    { code: 'CS301', title: 'Database Management Systems', credits: 3, dept: csDept },
    { code: 'EE101', title: 'Circuit Analysis', credits: 3, dept: eeDept },
    { code: 'EE201', title: 'Digital Electronics', credits: 3, dept: eeDept },
    { code: 'ME101', title: 'Engineering Mechanics', credits: 3, dept: meDept },
  ]

  const createdCourses = []
  for (const course of courses) {
    const created = await prisma.course.create({
      data: {
        code: course.code,
        title: course.title,
        credits: course.credits,
        department_id: course.dept.department_id,
        description: `Course description for ${course.title}`,
      },
    })
    createdCourses.push(created)
  }

  console.log('✅ Created courses')

  // Create Course Offerings
  const offerings = []
  for (const course of createdCourses.slice(0, 4)) {
    const offering = await prisma.courseOffering.create({
      data: {
        course_id: course.course_id,
        term_id: fall2024.term_id,
        section: 'A',
        capacity: 30,
      },
    })
    offerings.push(offering)
  }

  console.log('✅ Created course offerings')

  // Create Teaching Assignments
  const profs = await prisma.professor.findMany()
  await prisma.teachingAssignment.create({
    data: {
      offering_id: offerings[0].offering_id,
      professor_id: profs[0].professor_id,
    },
  })

  await prisma.teachingAssignment.create({
    data: {
      offering_id: offerings[1].offering_id,
      professor_id: profs[1].professor_id,
    },
  })

  await prisma.teachingAssignment.create({
    data: {
      offering_id: offerings[2].offering_id,
      professor_id: profs[0].professor_id,
    },
  })

  console.log('✅ Created teaching assignments')

  // Create Enrollments
  const allStudents = await prisma.student.findMany()
  for (let i = 0; i < Math.min(10, allStudents.length); i++) {
    await prisma.enrollment.create({
      data: {
        offering_id: offerings[0].offering_id,
        student_id: allStudents[i].student_id,
      },
    })
  }

  for (let i = 0; i < Math.min(8, allStudents.length); i++) {
    await prisma.enrollment.create({
      data: {
        offering_id: offerings[1].offering_id,
        student_id: allStudents[i].student_id,
      },
    })
  }

  console.log('✅ Created enrollments')

  // Create Class Sessions
  const sessions = []
  for (let i = 0; i < 5; i++) {
    const session = await prisma.classSession.create({
      data: {
        offering_id: offerings[0].offering_id,
        session_date: new Date(2024, 8, 5 + i * 7), // Weekly classes
        topic: `Lecture ${i + 1}: Introduction to Topic ${i + 1}`,
      },
    })
    sessions.push(session)
  }

  console.log('✅ Created class sessions')

  // Create Attendance Records
  const enrolledStudents = await prisma.enrollment.findMany({
    where: { offering_id: offerings[0].offering_id },
    include: { student: true },
  })

  for (const session of sessions) {
    for (const enrollment of enrolledStudents) {
      await prisma.attendanceRecord.create({
        data: {
          session_id: session.session_id,
          student_id: enrollment.student_id,
          status: Math.random() > 0.2 ? 'PRESENT' : 'ABSENT', // 80% attendance rate
        },
      })
    }
  }

  console.log('✅ Created attendance records')

  // Create Assessments
  const assessments = []
  const assessmentTypes = ['Midterm Exam', 'Final Exam', 'Quiz 1', 'Assignment 1']
  for (let i = 0; i < assessmentTypes.length; i++) {
    const assessment = await prisma.assessment.create({
      data: {
        offering_id: offerings[0].offering_id,
        name: assessmentTypes[i],
        type: i < 2 ? 'Exam' : i === 2 ? 'Quiz' : 'Assignment',
        max_marks: i < 2 ? 100 : i === 2 ? 20 : 30,
        due_date: new Date(2024, 8, 15 + i * 14),
      },
    })
    assessments.push(assessment)
  }

  console.log('✅ Created assessments')

  // Create Grade Records
  for (const assessment of assessments) {
    for (const enrollment of enrolledStudents) {
      await prisma.gradeRecord.create({
        data: {
          assessment_id: assessment.assessment_id,
          student_id: enrollment.student_id,
          marks: Math.floor(Math.random() * Number(assessment.max_marks) * 0.4) + Number(assessment.max_marks) * 0.6, // 60-100% range
        },
      })
    }
  }

  console.log('✅ Created grade records')

  // Create Fee Invoices
  for (const student of allStudents) {
    await prisma.feeInvoice.create({
      data: {
        student_id: student.student_id,
        term_id: fall2024.term_id,
        total_amount: 50000,
        status: Math.random() > 0.5 ? 'PAID' : 'PENDING',
        due_date: new Date('2024-10-01'),
      },
    })
  }

  console.log('✅ Created fee invoices')

  // Create Payments
  const invoices = await prisma.feeInvoice.findMany({
    where: { status: 'PAID' },
  })

  for (const invoice of invoices) {
    await prisma.payment.create({
      data: {
        invoice_id: invoice.invoice_id,
        amount: invoice.total_amount,
        payment_method: 'ONLINE',
        transaction_id: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      },
    })
  }

  console.log('✅ Created payments')
  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
