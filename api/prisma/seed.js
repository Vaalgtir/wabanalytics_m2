import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const userModel = {
  username: "test",
  mail: "@test.com",
  password: "test",
  isAdmin: true,
  isValidated: true,
  nom: "Test",
  prenom: "George",
};

async function main() {
  const admin = await prisma.users.upsert({
    where: { mail: "dragnir19@gmail.com" },
    update: {},
    create: {
      username: "admin",
      mail: "dragnir19@gmail.com",
      password: "khunou",
      isAdmin: true,
      nom: "Spark",
      prenom: "Admin",
    },
  });

  for (let index = 0; index < 100; index++) {
    await prisma.users.upsert({
      where: { mail: `${userModel.username}${index}${userModel.mail}` },
      update: {},
      create: {
        ...userModel,
        username: `${userModel.username}${index}`,
        mail: `${userModel.username}${index}${userModel.mail}`,
      },
    });
  }

  console.log("done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
