-- Finish the SalamRuby rename of the feedback-source → survey mapping domain.
--
-- The Prisma schema was renamed (model FeedbackSourceFormbricksMapping ->
-- FeedbackSourceSalamRubyMapping, and enum value 'formbricks_survey' ->
-- 'salamruby_survey') but the matching migration was never generated. The live
-- database therefore still has the old table name and enum value, so the
-- generated client's queries against that model fail at runtime.
--
-- This renames the enum value, the table, and the table's primary key, foreign
-- keys and indexes in place. All data is preserved. Constraint/index target
-- names mirror the simple 63-char truncation Prisma used for the original names.

-- Enum value (FeedbackSourceType): 'formbricks_survey' -> 'salamruby_survey'
ALTER TYPE "FeedbackSourceType" RENAME VALUE 'formbricks_survey' TO 'salamruby_survey';

-- Table
ALTER TABLE "FeedbackSourceFormbricksMapping" RENAME TO "FeedbackSourceSalamRubyMapping";

-- Primary key (renames the backing index of the same name too)
ALTER TABLE "FeedbackSourceSalamRubyMapping"
  RENAME CONSTRAINT "FeedbackSourceFormbricksMapping_pkey"
  TO "FeedbackSourceSalamRubyMapping_pkey";

-- Foreign keys
ALTER TABLE "FeedbackSourceSalamRubyMapping"
  RENAME CONSTRAINT "FeedbackSourceFormbricksMapping_feedbackSourceId_workspaceId_fk"
  TO "FeedbackSourceSalamRubyMapping_feedbackSourceId_workspaceId_fke";
ALTER TABLE "FeedbackSourceSalamRubyMapping"
  RENAME CONSTRAINT "FeedbackSourceFormbricksMapping_surveyId_workspaceId_fkey"
  TO "FeedbackSourceSalamRubyMapping_surveyId_workspaceId_fkey";

-- Indexes (the unique index backing @@unique, plus the two @@index entries)
ALTER INDEX "FeedbackSourceFormbricksMapping_workspaceId_feedbackSourceId_su"
  RENAME TO "FeedbackSourceSalamRubyMapping_workspaceId_feedbackSourceId_sur";
ALTER INDEX "FeedbackSourceFormbricksMapping_surveyId_idx"
  RENAME TO "FeedbackSourceSalamRubyMapping_surveyId_idx";
ALTER INDEX "FeedbackSourceFormbricksMapping_workspaceId_surveyId_idx"
  RENAME TO "FeedbackSourceSalamRubyMapping_workspaceId_surveyId_idx";
