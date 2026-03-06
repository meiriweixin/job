-- Add searchVector GIN index
CREATE INDEX IF NOT EXISTS "job_jobs_searchVector_idx" ON "job_jobs" USING GIN("searchVector");

-- Add trigram indexes for fuzzy search
CREATE INDEX IF NOT EXISTS "job_jobs_title_trgm_idx" ON "job_jobs" USING GIN("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "job_jobs_company_trgm_idx" ON "job_jobs" USING GIN("company" gin_trgm_ops);

-- Function + trigger to maintain searchVector automatically
CREATE OR REPLACE FUNCTION job_jobs_search_vector_update()
RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.company, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.location, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS job_jobs_search_vector_trigger ON "job_jobs";

CREATE TRIGGER job_jobs_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "job_jobs"
  FOR EACH ROW EXECUTE FUNCTION job_jobs_search_vector_update();
