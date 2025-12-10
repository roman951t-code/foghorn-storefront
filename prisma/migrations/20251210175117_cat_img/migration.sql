/*
  Warnings:

  - You are about to drop the column `attempts` on the `EmailRegistrationCode` table. All the data in the column will be lost.
  - You are about to drop the column `attempts` on the `EmailVerificationCode` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `cartItems` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `ProductVariant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_variantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductVariant" DROP CONSTRAINT "ProductVariant_productId_fkey";

-- AlterTable
ALTER TABLE "EmailRegistrationCode" DROP COLUMN "attempts";

-- AlterTable
ALTER TABLE "EmailVerificationCode" DROP COLUMN "attempts";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "variantId";

-- AlterTable
ALTER TABLE "ProductCategory" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "cartItems";

-- DropTable
DROP TABLE "public"."ProductVariant";
