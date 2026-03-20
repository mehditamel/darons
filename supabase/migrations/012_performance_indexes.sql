-- Performance indexes on frequently queried foreign keys
-- UP

CREATE INDEX IF NOT EXISTS idx_family_members_household ON family_members(household_id);
CREATE INDEX IF NOT EXISTS idx_identity_documents_member ON identity_documents(member_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_member ON vaccinations(member_id);
CREATE INDEX IF NOT EXISTS idx_medical_appointments_member ON medical_appointments(member_id);
CREATE INDEX IF NOT EXISTS idx_growth_measurements_member ON growth_measurements(member_id);
CREATE INDEX IF NOT EXISTS idx_documents_household ON documents(household_id);
CREATE INDEX IF NOT EXISTS idx_budget_entries_household_month ON budget_entries(household_id, month);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account_date ON bank_transactions(account_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_proactive_alerts_household ON proactive_alerts(household_id);
CREATE INDEX IF NOT EXISTS idx_health_examinations_member ON health_examinations(member_id);
CREATE INDEX IF NOT EXISTS idx_activities_member ON activities(member_id);
CREATE INDEX IF NOT EXISTS idx_administrative_tasks_household ON administrative_tasks(household_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_household ON notification_log(household_id);
CREATE INDEX IF NOT EXISTS idx_caf_allocations_household ON caf_allocations(household_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_household ON savings_goals(household_id);
CREATE INDEX IF NOT EXISTS idx_schooling_member ON schooling(member_id);
CREATE INDEX IF NOT EXISTS idx_development_milestones_member ON development_milestones(member_id);
CREATE INDEX IF NOT EXISTS idx_parent_journal_member ON parent_journal(member_id);

-- DOWN
-- DROP INDEX IF EXISTS idx_family_members_household;
-- DROP INDEX IF EXISTS idx_identity_documents_member;
-- DROP INDEX IF EXISTS idx_vaccinations_member;
-- DROP INDEX IF EXISTS idx_medical_appointments_member;
-- DROP INDEX IF EXISTS idx_growth_measurements_member;
-- DROP INDEX IF EXISTS idx_documents_household;
-- DROP INDEX IF EXISTS idx_budget_entries_household_month;
-- DROP INDEX IF EXISTS idx_bank_transactions_account_date;
-- DROP INDEX IF EXISTS idx_proactive_alerts_household;
-- DROP INDEX IF EXISTS idx_health_examinations_member;
-- DROP INDEX IF EXISTS idx_activities_member;
-- DROP INDEX IF EXISTS idx_administrative_tasks_household;
-- DROP INDEX IF EXISTS idx_notification_log_household;
-- DROP INDEX IF EXISTS idx_caf_allocations_household;
-- DROP INDEX IF EXISTS idx_savings_goals_household;
-- DROP INDEX IF EXISTS idx_schooling_member;
-- DROP INDEX IF EXISTS idx_development_milestones_member;
-- DROP INDEX IF EXISTS idx_parent_journal_member;
