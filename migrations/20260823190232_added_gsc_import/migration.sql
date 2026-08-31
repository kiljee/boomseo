-- CreateTable
CREATE TABLE "GSCImport" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GSCImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GSCQuery" (
    "id" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL,
    "clicks" INTEGER NOT NULL,
    "ctr" DOUBLE PRECISION NOT NULL,
    "position" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "GSCQuery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GSCImport_organizationId_key" ON "GSCImport"("organizationId");

-- CreateIndex
CREATE INDEX "GSCQuery_importId_idx" ON "GSCQuery"("importId");

-- CreateIndex
CREATE INDEX "GSCQuery_query_idx" ON "GSCQuery"("query");

-- AddForeignKey
ALTER TABLE "GSCImport" ADD CONSTRAINT "GSCImport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GSCQuery" ADD CONSTRAINT "GSCQuery_importId_fkey" FOREIGN KEY ("importId") REFERENCES "GSCImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
