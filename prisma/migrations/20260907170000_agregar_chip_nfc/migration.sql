-- CreateTable
CREATE TABLE "ChipNfc" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "profesionalId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reclamadoEn" TIMESTAMP(3),

    CONSTRAINT "ChipNfc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChipNfc_codigo_key" ON "ChipNfc"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "ChipNfc_profesionalId_key" ON "ChipNfc"("profesionalId");

-- AddForeignKey
ALTER TABLE "ChipNfc" ADD CONSTRAINT "ChipNfc_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Profesional"("id") ON DELETE SET NULL ON UPDATE CASCADE;
