const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@12345', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@iccha.test' },
    update: {},
    create: {
      email: 'admin@iccha.test',
      passwordHash,
      name: 'Iccha Admin',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Admin created:', admin.email);
}
main().finally(() => prisma.$disconnect());
