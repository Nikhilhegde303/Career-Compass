-- CreateTable
CREATE TABLE "analysis_results" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "analysis_type" TEXT NOT NULL,
    "job_description" TEXT,
    "job_title" TEXT,
    "company" TEXT,
    "overall_score" INTEGER,
    "match_score" INTEGER,
    "structure_score" INTEGER,
    "keyword_score" INTEGER,
    "impact_score" INTEGER,
    "skills_score" INTEGER,
    "readability_score" INTEGER,
    "strengths" JSONB NOT NULL,
    "weaknesses" JSONB NOT NULL,
    "suggestions" JSONB NOT NULL,
    "matched_keywords" JSONB,
    "missing_keywords" JSONB,
    "feature_vector" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analysis_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analysis_results_resume_id_idx" ON "analysis_results"("resume_id");

-- CreateIndex
CREATE INDEX "analysis_results_user_id_idx" ON "analysis_results"("user_id");

-- AddForeignKey
ALTER TABLE "analysis_results" ADD CONSTRAINT "analysis_results_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_results" ADD CONSTRAINT "analysis_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
