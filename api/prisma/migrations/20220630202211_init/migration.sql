-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(25) NOT NULL,
    "password" TEXT NOT NULL,
    "mail" VARCHAR(25) NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isValidated" BOOLEAN NOT NULL DEFAULT false,
    "nom" VARCHAR(25),
    "prenom" VARCHAR(25),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "username" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "mail" ON "users"("mail");
