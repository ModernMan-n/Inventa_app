const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  try {
    // Create dyn_mvl
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "dyn_mvl" (id serial primary key, "name" text, "phone" text, created_at timestamp default now())`
    );
    // Insert sample
    await prisma.$executeRawUnsafe(
      `INSERT INTO "dyn_mvl" ("name","phone") VALUES ($1,$2)`,
      "Иванов И.И.",
      "+7 900 000 00 01"
    );

    // Create dyn_employees
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "dyn_employees" (id serial primary key, "firstName" text, "lastName" text, "position" text, created_at timestamp default now())`
    );
    await prisma.$executeRawUnsafe(
      `INSERT INTO "dyn_employees" ("firstName","lastName","position") VALUES ($1,$2,$3)`,
      "Пётр",
      "Петров",
      "Менеджер"
    );

    console.log("Test tables created/seeded.");
  } catch (e) {
    console.error("Error creating test tables", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
