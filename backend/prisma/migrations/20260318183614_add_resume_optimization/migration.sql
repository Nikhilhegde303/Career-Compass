-- CreateTable
CREATE TABLE "resume_optimizations" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "analysis_id" TEXT,
    "section" TEXT NOT NULL,
    "original" TEXT NOT NULL,
    "optimized" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_optimizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resume_optimizations_resume_id_idx" ON "resume_optimizations"("resume_id");

-- CreateIndex
CREATE INDEX "resume_optimizations_user_id_idx" ON "resume_optimizations"("user_id");

-- AddForeignKey
ALTER TABLE "resume_optimizations" ADD CONSTRAINT "resume_optimizations_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_optimizations" ADD CONSTRAINT "resume_optimizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
