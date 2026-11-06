-- =====================================================================================
-- SAMSTRUST TECHNOLOGIES LIMITED (RC 9898142) - www.samstrusttech.com
-- Initial Production Seed Data for MySQL 8.0+ / MariaDB 10.11+
-- File: /database/samstrust_seed_data.sql
-- =====================================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------------------------------
-- 1. SEED: roles (5 Granular Enterprise RBAC Roles)
-- -------------------------------------------------------------------------------------
INSERT INTO `roles` (`id`, `role_slug`, `role_name`, `access_scope_description`, `requires_two_factor`, `permissions_json`)
VALUES
(1, 'customer', 'Registered Customer', 'Access to registered laboratory equipment, service requests, quote approval, and certificate downloads.', 0, JSON_OBJECT(
  'can_view_equipment', true,
  'can_request_service', true,
  'can_approve_quotes', true,
  'can_download_certificates', true,
  'can_manage_personnel', true,
  'can_manage_facilities', true
)),
(2, 'field-technician', 'Field Service Technician', 'Mobile field workbench for As-Found/As-Left calibration readings, environmental logging, and customer sign-off.', 1, JSON_OBJECT(
  'can_view_assigned_tickets', true,
  'can_record_calibration_readings', true,
  'can_log_parts_replaced', true,
  'can_capture_customer_signature', true,
  'can_close_tickets', true
)),
(3, 'service-coordinator', 'Service Coordinator', 'National dispatch console, ticket triage, technician calendar scheduling, and SLA monitoring.', 1, JSON_OBJECT(
  'can_view_all_tickets', true,
  'can_assign_technicians', true,
  'can_schedule_visits', true,
  'can_escalate_sla', true,
  'can_dispatch_mobile_units', true
)),
(4, 'accounts-sales', 'Accounts & Commercial Specialist', 'Commercial engine, RFQ processing, line-item formal quotations, proforma invoicing, and bank payment verification.', 1, JSON_OBJECT(
  'can_view_rfqs', true,
  'can_create_quotations', true,
  'can_issue_proforma_invoices', true,
  'can_verify_remittances', true,
  'can_manage_tax_rates', true
)),
(5, 'portal-admin', 'Portal Super Administrator', 'System configuration, role permissions matrix, security audit trail inspection, and database administration.', 1, JSON_OBJECT(
  'can_manage_all_roles', true,
  'can_manage_system_config', true,
  'can_inspect_audit_trail', true,
  'can_manage_database_backups', true,
  'can_override_idor_locks', true
))
ON DUPLICATE KEY UPDATE
  `role_name` = VALUES(`role_name`),
  `access_scope_description` = VALUES(`access_scope_description`),
  `permissions_json` = VALUES(`permissions_json`);

-- -------------------------------------------------------------------------------------
-- 2. SEED: Initial Portal Super Admin & Staff Accounts
-- Note: Passwords below are initial setup hashes. Change immediately upon first login.
-- -------------------------------------------------------------------------------------
INSERT INTO `users` (
  `id`, `role_id`, `email`, `password_hash`, `password_salt`, `full_name`, `job_title`,
  `company_name`, `cac_registration_number`, `phone_number`, `assigned_region`,
  `two_factor_enabled`, `account_status`, `password_must_change`
)
VALUES
(
  'usr-admin-0001', 5, 'admin@samstrusttech.com',
  '$2b$10$giDkkEcdD2MKse/Nb5hoTuilMIKjP4vpKSX2yhqCVABjnrtJpqhI6',
  'SALT_ADM_2026', 'Engr. Samuel O. Trust', 'Managing Director & Chief Metrologist',
  'Samstrust Technologies Limited', 'RC 9898142', '+2348029844356', 'Headquarters (Lagos)',
  1, 'Active', 0
),
(
  'usr-tech-0001', 2, 'tech.okoye@samstrusttech.com',
  '$2b$10$giDkkEcdD2MKse/Nb5hoTuilMIKjP4vpKSX2yhqCVABjnrtJpqhI6',
  'SALT_TCH_2026', 'Engr. Nnamdi Okoye', 'Senior COREN Metrology Specialist',
  'Samstrust Technologies Limited', 'RC 9898142', '+2348029844356', 'Lagos & South-West',
  1, 'Active', 1
),
(
  'usr-coord-0001', 3, 'dispatch@samstrusttech.com',
  '$2b$10$giDkkEcdD2MKse/Nb5hoTuilMIKjP4vpKSX2yhqCVABjnrtJpqhI6',
  'SALT_CRD_2026', 'Engr. Amina Suleiman', 'National Service Operations Lead',
  'Samstrust Technologies Limited', 'RC 9898142', '+2348029844356', 'National Operations',
  1, 'Active', 1
),
(
  'usr-sales-0001', 4, 'commercial@samstrusttech.com',
  '$2b$10$giDkkEcdD2MKse/Nb5hoTuilMIKjP4vpKSX2yhqCVABjnrtJpqhI6',
  'SALT_SLS_2026', 'Femi Adebayo', 'Senior Commercial Accounts Specialist',
  'Samstrust Technologies Limited', 'RC 9898142', '+2348029844356', 'Commercial Desk',
  1, 'Active', 1
),
(
  'usr-cust-0001', 1, 'c.nwachukwu@biozenith.com',
  '$2b$10$giDkkEcdD2MKse/Nb5hoTuilMIKjP4vpKSX2yhqCVABjnrtJpqhI6',
  'SALT_BZ_2026', 'Dr. Chioma Nwachukwu', 'Director of Quality Assurance',
  'BioZenith Pharmaceuticals Ltd', 'RC 1489201', '+2348023341188', 'Lagos & South-West',
  0, 'Active', 0
)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`), `password_hash` = VALUES(`password_hash`);

-- -------------------------------------------------------------------------------------
-- 3. SEED: Initial Customer Facility
-- -------------------------------------------------------------------------------------
INSERT INTO `customer_facilities` (
  `id`, `customer_user_id`, `facility_name`, `facility_type`, `facility_address`,
  `city`, `state_province`, `postal_code`, `primary_site_contact_name`,
  `primary_site_contact_phone`, `access_restrictions_notes`, `is_headquarters`
)
VALUES
(
  'fac-biozenith-01', 'usr-cust-0001', 'Central Testing Lab & Cleanroom HQ',
  'Central Testing Lab', 'Plot 14, Oba Akran Industrial Avenue, Ikeja',
  'Ikeja', 'Lagos State', '100282', 'Dr. Chioma Nwachukwu',
  '+2348023341188', 'ISO Class 5 Gowning Mandatory • Biometric Gate Pass Required', 1
)
ON DUPLICATE KEY UPDATE `facility_name` = VALUES(`facility_name`);

-- -------------------------------------------------------------------------------------
-- 4. SEED: Initial Digital Equipment Passport
-- -------------------------------------------------------------------------------------
INSERT INTO `equipment_registry` (
  `id`, `customer_user_id`, `facility_id`, `equipment_name`, `oem_brand`,
  `model_number`, `serial_number`, `internal_asset_tag`, `equipment_category`,
  `commissioning_date`, `calibration_interval_months`, `last_calibration_date`,
  `next_calibration_due`, `calibration_status`, `measurement_range`,
  `nominal_accuracy`, `room_location`, `qr_passport_code`
)
VALUES
(
  'eq-sartorius-01', 'usr-cust-0001', 'fac-biozenith-01',
  'Sartorius Cubis II Ultra-Micro Analytical Balance', 'Sartorius AG (Germany)',
  'MCA225S-2S00-M', 'SN-ST-2025-7730', 'BZ-QC-BAL-01', 'Mass & Analytical Balances',
  '2025-02-10', 6, '2026-08-14', '2027-02-14', 'Valid',
  '0.01 mg – 220 g', '±0.05 mg (OIML Class I)', 'Suite B-204 Analytical Weighing Bay',
  'SAM-QR-8841-ISO17025-9F2A'
)
ON DUPLICATE KEY UPDATE `equipment_name` = VALUES(`equipment_name`);

-- -------------------------------------------------------------------------------------
-- 5. SEED: Initial Service Ticket
-- -------------------------------------------------------------------------------------
INSERT INTO `service_tickets` (
  `id`, `ticket_reference`, `customer_user_id`, `facility_id`, `equipment_id`,
  `assigned_technician_id`, `coordinator_user_id`, `service_type`, `urgency_rating`,
  `ticket_status`, `problem_summary`, `detailed_description`, `scheduled_visit_date`,
  `target_sla_resolution_date`
)
VALUES
(
  'tkt-sam-0001', 'SRV-SAM-2026-1094', 'usr-cust-0001', 'fac-biozenith-01', 'eq-sartorius-01',
  'usr-tech-0001', 'usr-coord-0001', 'On-site ISO Calibration', 'Routine',
  'Completed', 'Bi-Annual USP <41> & OIML Class I Mass Calibration',
  '5-point linearity and corner load verification using NIST/VSL traceable standard weights.',
  '2026-08-14 10:00:00', '2026-08-15 17:00:00'
)
ON DUPLICATE KEY UPDATE `ticket_reference` = VALUES(`ticket_reference`);

SET FOREIGN_KEY_CHECKS = 1;
