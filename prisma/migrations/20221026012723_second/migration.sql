/*
  Warnings:

  - You are about to drop the column `secondName` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "secondName",
ADD COLUMN     "lastName" TEXT;
