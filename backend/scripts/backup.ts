import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  const outDir = path.resolve(__dirname, '../../backups')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filePath = path.join(outDir, `backup-${timestamp}.json`)

  const data = {
    users: await prisma.user.findMany(),
    workers: await prisma.worker.findMany(),
    holidays: await prisma.holiday.findMany(),
    recurringPatterns: await prisma.recurringPattern.findMany(),
    assignments: await prisma.assignment.findMany(),
    rotations: await prisma.rotation.findMany(),
    vacations: await prisma.vacation.findMany(),
    speds: await prisma.sped.findMany(),
    trips: await prisma.trip.findMany(),
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
  console.log('Backup salvo em:', filePath)
}

main()
  .catch((e) => {
    console.error('Erro ao gerar backup:', e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
