/*
  Warnings:

  - A unique constraint covering the columns `[fullSlug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Product_fullSlug_key" ON "public"."Product"("fullSlug");
