import { prisma } from '@/lib/db'

export async function getStudentByUserId(userId: string) {
  return prisma.student.findUnique({ where: { user_id: userId } })
}

export async function getProfessorByUserId(userId: string) {
  return prisma.professor.findUnique({
    where: { user_id: userId },
    include: {
      teachingAssignments: { select: { offering_id: true } },
    },
  })
}

export async function professorTeachesOffering(
  professorId: string,
  offeringId: string
): Promise<boolean> {
  const row = await prisma.teachingAssignment.findFirst({
    where: { professor_id: professorId, offering_id: offeringId },
  })
  return !!row
}

export function offeringIdsForProfessor(prof: {
  teachingAssignments: { offering_id: string }[]
}) {
  return prof.teachingAssignments.map((t) => t.offering_id)
}
