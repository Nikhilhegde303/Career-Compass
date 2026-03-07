import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing Prisma connection...');
    const users = await prisma.user.findMany();
    console.log('✅ Prisma works! Found users:', users.length);
    
    console.log('Testing Resume model...');
    const resumes = await prisma.resume.findMany();
    console.log('✅ Resume model works! Found resumes:', resumes.length);
  } catch (error) {
    console.error('❌ Prisma error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();