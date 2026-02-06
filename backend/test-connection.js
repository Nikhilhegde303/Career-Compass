import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testBackendAuth() {
  console.log('🔍 Testing Backend Authentication Flow...\n');
  
  try {
    // 1. Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // 2. Clean up any existing test user
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' }
    });
    console.log('✅ Cleaned up test data');
    
    // 3. Test bcrypt hashing
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashing works');
    
    // 4. Test JWT token generation
    const testPayload = { userId: 'test-id', email: 'test@example.com', role: 'USER' };
    const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('✅ JWT token generation works');
    
    // 5. Test JWT verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT token verification works');
    
    console.log('\n🎉 Backend auth components are working correctly!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testBackendAuth();