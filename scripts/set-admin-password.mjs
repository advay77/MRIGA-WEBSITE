// Creates the admin account, or resets its password, from ADMIN_EMAIL and ADMIN_PASSWORD,
// then signs that admin out everywhere. Run against production by pointing DATABASE_URL at it:
//   npm run admin:password
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { PrismaClient } from "@prisma/client";

const stretch = promisify(scrypt);
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";

if (!email || !email.includes("@")) {
  console.error("Set ADMIN_EMAIL to the admin's email address.");
  process.exit(1);
}
if (password.length < 12 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
  console.error("ADMIN_PASSWORD must be at least 12 characters and include a letter and a number.");
  process.exit(1);
}

// Same format as lib/password.ts: "<salt hex>:<scrypt hash hex>".
const salt = randomBytes(16).toString("hex");
const passwordHash = `${salt}:${(await stretch(password, salt, 64)).toString("hex")}`;

const prisma = new PrismaClient();
try {
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
  if (existing && existing.role !== "ADMIN") {
    console.error(`${email} belongs to a ${existing.role} account. Use a different ADMIN_EMAIL.`);
    process.exitCode = 1;
  } else {
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, name: "MRIGA Admin", passwordHash, role: "ADMIN" },
      update: { passwordHash },
    });
    const { count } = await prisma.session.deleteMany({ where: { userId: user.id } });
    console.log(`Admin password ${existing ? "reset" : "created"} for ${email}. Signed out ${count} session(s).`);
  }
} finally {
  await prisma.$disconnect();
}
