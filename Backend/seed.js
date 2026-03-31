const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    }
  });
  console.log('Admin created:', admin);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
