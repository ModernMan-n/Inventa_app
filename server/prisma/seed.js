const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash("password", 10);
  await prisma.user.upsert({
    where: { email: "admin@inventa.test" },
    update: {},
    create: { email: "admin@inventa.test", password: hashed, name: "Admin" },
  });
  console.log("Seed finished");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
