import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { config } from 'dotenv'
import path from 'path'

// Load .env.local from project root
config({ path: path.resolve(__dirname, '../../.env.local') })

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prismaClient: PrismaClient

if (globalForPrisma.prisma) {
  prismaClient = globalForPrisma.prisma
} else {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  prismaClient = new PrismaClient({ adapter })
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaClient
  }
}

export const db = prismaClient
