-- CreateTable
CREATE TABLE "SelfDestruct" (
    "id" TEXT NOT NULL,
    "gadgetId" TEXT NOT NULL,
    "confirmationCode" TEXT NOT NULL,
    "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SelfDestruct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SelfDestruct_gadgetId_key" ON "SelfDestruct"("gadgetId");

-- AddForeignKey
ALTER TABLE "SelfDestruct" ADD CONSTRAINT "SelfDestruct_gadgetId_fkey" FOREIGN KEY ("gadgetId") REFERENCES "Gadget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
