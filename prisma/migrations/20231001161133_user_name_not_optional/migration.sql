/*
  Warnings:

  - Made the column `name` on table `AuthUser` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AuthUser" ALTER COLUMN "name" SET NOT NULL;
