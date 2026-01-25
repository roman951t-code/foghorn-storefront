-- CreateTable
CREATE TABLE "ProductAttributeSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductAttributeSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAttributeSetItem" (
    "id" TEXT NOT NULL,
    "attributeSetId" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductAttributeSetItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductAttributeSet_categoryId_key" ON "ProductAttributeSet"("categoryId");

-- CreateIndex
CREATE INDEX "ProductAttributeSetItem_attributeId_idx" ON "ProductAttributeSetItem"("attributeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAttributeSetItem_attributeSetId_attributeId_key" ON "ProductAttributeSetItem"("attributeSetId", "attributeId");

-- AddForeignKey
ALTER TABLE "ProductAttributeSet" ADD CONSTRAINT "ProductAttributeSet_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeSetItem" ADD CONSTRAINT "ProductAttributeSetItem_attributeSetId_fkey" FOREIGN KEY ("attributeSetId") REFERENCES "ProductAttributeSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeSetItem" ADD CONSTRAINT "ProductAttributeSetItem_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "ProductAttribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
