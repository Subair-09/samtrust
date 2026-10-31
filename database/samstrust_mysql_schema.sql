-- =====================================================================================
-- SAMSTRUST TECHNOLOGIES LIMITED (RC 9898142) - www.samstrusttech.com
-- Unified Enterprise MySQL 8.0+ / MariaDB 10.11+ Relational Database Schema (DDL)
-- =====================================================================================
-- Tables (11 Core Entities):
--   1. roles
--   2. users
--   3. customer_facilities
--   4. equipment_registry
--   5. service_tickets
--   6. calibration_readings
--   7. quotations
--   8. quotation_items
--   9. invoices
--  10. notifications
--  11. audit_trail
-- =====================================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -------------------------------------------------------------------------------------
-- 1. TABLE: roles
-- Defines Role-Based Access Control (RBAC) matrix for customers and internal staff
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_slug` VARCHAR(50) NOT NULL COMMENT 'customer | field-technician | service-coordinator | accounts-sales | portal-admin',
  `role_name` VARCHAR(100) NOT NULL,
  `access_scope_description` VARCHAR(255) NOT NULL,
  `requires_two_factor` TINYINT(1) NOT NULL DEFAULT 0,
  `permissions_json` JSON NOT NULL COMMENT 'Granular RBAC resource action permissions',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_slug` (`role_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 2. TABLE: users
-- Authenticated portal accounts for Customer Facility Managers and Samstrust Staff
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` CHAR(36) NOT NULL COMMENT 'UUID v4 Primary Key',
  `role_id` INT UNSIGNED NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'PBKDF2-HMAC-SHA256 / Argon2id salted digest',
  `password_salt` VARCHAR(128) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `job_title` VARCHAR(120) NOT NULL,
  `company_name` VARCHAR(200) NOT NULL,
  `cac_registration_number` VARCHAR(40) DEFAULT NULL COMMENT 'Nigerian CAC RC or BN number (e.g. RC 9898142)',
  `phone_number` VARCHAR(40) NOT NULL,
  `assigned_region` VARCHAR(100) DEFAULT 'Lagos & South-West',
  `two_factor_enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `two_factor_secret` VARCHAR(128) DEFAULT NULL,
  `notify_email_quotes` TINYINT(1) NOT NULL DEFAULT 1,
  `notify_email_calibration_due` TINYINT(1) NOT NULL DEFAULT 1,
  `notify_whatsapp_dispatch` TINYINT(1) NOT NULL DEFAULT 1,
  `account_status` ENUM('Active', 'Pending Verification', 'Suspended', 'Locked') NOT NULL DEFAULT 'Active',
  `failed_login_attempts` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `last_login_at` DATETIME DEFAULT NULL,
  `password_must_change` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Flag requiring user to replace temporary password on first login',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`),
  KEY `idx_users_role_id` (`role_id`),
  KEY `idx_users_company_cac` (`company_name`, `cac_registration_number`),
  CONSTRAINT `fk_users_role`
    FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 3. TABLE: customer_facilities
-- Multi-facility laboratory/plant locations owned by a registered customer organization
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `customer_facilities` (
  `id` CHAR(36) NOT NULL,
  `owner_user_id` CHAR(36) NOT NULL COMMENT 'Anti-IDOR tenant owner reference',
  `company_name` VARCHAR(200) NOT NULL,
  `cac_registration_number` VARCHAR(40) NOT NULL,
  `facility_code` VARCHAR(40) NOT NULL COMMENT 'e.g. FAC-LOS-01',
  `facility_name` VARCHAR(180) NOT NULL COMMENT 'e.g. Central Testing Laboratory - Victoria Island',
  `facility_type` ENUM(
    'Central Testing Lab',
    'Satellite QA Unit',
    'Factory Production Bay',
    'Clinical & Molecular Lab',
    'Refinery & Petrochemical Terminal',
    'University Research Facility'
  ) NOT NULL DEFAULT 'Central Testing Lab',
  `street_address` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state_region` VARCHAR(100) NOT NULL COMMENT 'Nigerian State (Lagos, Rivers, FCT Abuja, Ogun, Kano, etc.)',
  `iso_accreditation_ref` VARCHAR(100) DEFAULT NULL,
  `receiving_bay_hours` VARCHAR(120) DEFAULT 'Mon-Fri 08:00 - 17:00 WAT',
  `primary_contact_name` VARCHAR(150) NOT NULL,
  `primary_contact_phone` VARCHAR(40) NOT NULL,
  `primary_contact_email` VARCHAR(191) NOT NULL,
  `is_primary_hq` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_facility_code` (`facility_code`),
  KEY `idx_facilities_owner_user` (`owner_user_id`),
  KEY `idx_facilities_state` (`state_region`),
  CONSTRAINT `fk_facilities_owner_user`
    FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 4. TABLE: equipment_registry
-- Digital Equipment Passport: tracked laboratory, clinical, and process instruments
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `equipment_registry` (
  `id` CHAR(36) NOT NULL,
  `facility_id` CHAR(36) NOT NULL,
  `owner_user_id` CHAR(36) NOT NULL,
  `asset_tag` VARCHAR(64) NOT NULL COMMENT 'Internal asset identifier e.g. STL-AST-0104',
  `serial_number` VARCHAR(120) NOT NULL COMMENT 'Manufacturer unique hardware serial number',
  `equipment_name` VARCHAR(220) NOT NULL,
  `oem_brand` VARCHAR(120) NOT NULL,
  `model_number` VARCHAR(120) NOT NULL,
  `category` ENUM(
    'Analytical Instruments',
    'Process & Flow Metering',
    'Life Science & Biotech',
    'Material & Civil Testing',
    'Environmental Monitoring',
    'Weighing & Mass Metrology'
  ) NOT NULL,
  `lab_room_location` VARCHAR(160) NOT NULL,
  `commissioning_date` DATE NOT NULL,
  `last_calibration_date` DATE DEFAULT NULL,
  `next_calibration_due_date` DATE NOT NULL,
  `calibration_interval_months` SMALLINT UNSIGNED NOT NULL DEFAULT 12,
  `calibration_status` ENUM(
    'Calibrated & Active',
    'Calibration Due Soon',
    'Overdue / Out of Tolerance',
    'Under Maintenance'
  ) NOT NULL DEFAULT 'Calibrated & Active',
  `current_certificate_number` VARCHAR(80) DEFAULT NULL,
  `qr_verification_hash` VARCHAR(128) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_equipment_serial` (`serial_number`),
  UNIQUE KEY `uk_equipment_asset_tag` (`asset_tag`),
  KEY `idx_equipment_facility` (`facility_id`),
  KEY `idx_equipment_owner` (`owner_user_id`),
  KEY `idx_equipment_cal_due` (`next_calibration_due_date`, `calibration_status`),
  CONSTRAINT `fk_equipment_facility`
    FOREIGN KEY (`facility_id`) REFERENCES `customer_facilities` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_equipment_owner`
    FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 5. TABLE: service_tickets
-- End-to-End Field Service Management (FSM) work orders & calibration dispatches
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `service_tickets` (
  `id` CHAR(36) NOT NULL,
  `ticket_number` VARCHAR(40) NOT NULL COMMENT 'Public work order reference e.g. SRV-2025-0891',
  `customer_user_id` CHAR(36) NOT NULL,
  `facility_id` CHAR(36) NOT NULL,
  `equipment_id` CHAR(36) DEFAULT NULL COMMENT 'Nullable if customer specifies an unlisted device',
  `unlisted_device_description` VARCHAR(255) DEFAULT NULL,
  `assigned_technician_id` CHAR(36) DEFAULT NULL,
  `coordinator_user_id` CHAR(36) DEFAULT NULL,
  `service_type` ENUM(
    'ISO/IEC 17025 Calibration',
    'Preventive Maintenance (PM)',
    'Emergency Breakdown Repair',
    'IQ/OQ/PQ Qualification',
    'Installation & Commissioning',
    'User Training'
  ) NOT NULL,
  `urgency_level` ENUM('Routine', 'Urgent', 'Critical Production Stoppage') NOT NULL DEFAULT 'Routine',
  `ticket_status` ENUM(
    'Submitted',
    'Under Review',
    'Scheduled',
    'Assigned',
    'In Progress',
    'Awaiting Parts',
    'Completed',
    'Closed'
  ) NOT NULL DEFAULT 'Submitted',
  `problem_description` TEXT NOT NULL,
  `scheduled_visit_date` DATETIME DEFAULT NULL,
  `sla_deadline_at` DATETIME NOT NULL,
  `ambient_temperature_c` DECIMAL(5,2) DEFAULT NULL,
  `ambient_humidity_percent` DECIMAL(5,2) DEFAULT NULL,
  `traceable_reference_standard` VARCHAR(180) DEFAULT NULL,
  `technician_work_summary` TEXT DEFAULT NULL,
  `customer_signoff_name` VARCHAR(150) DEFAULT NULL,
  `customer_signoff_title` VARCHAR(120) DEFAULT NULL,
  `customer_signature_svg_data` MEDIUMTEXT DEFAULT NULL,
  `completed_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_ticket_number` (`ticket_number`),
  KEY `idx_tickets_customer` (`customer_user_id`),
  KEY `idx_tickets_facility` (`facility_id`),
  KEY `idx_tickets_equipment` (`equipment_id`),
  KEY `idx_tickets_technician` (`assigned_technician_id`),
  KEY `idx_tickets_status_urgency` (`ticket_status`, `urgency_level`),
  CONSTRAINT `fk_tickets_customer`
    FOREIGN KEY (`customer_user_id`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_tickets_facility`
    FOREIGN KEY (`facility_id`) REFERENCES `customer_facilities` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_tickets_equipment`
    FOREIGN KEY (`equipment_id`) REFERENCES `equipment_registry` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_tickets_technician`
    FOREIGN KEY (`assigned_technician_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 6. TABLE: calibration_readings
-- Metrology As-Found & As-Left measurement test points linked to service tickets
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `calibration_readings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `service_ticket_id` CHAR(36) NOT NULL,
  `equipment_id` CHAR(36) NOT NULL,
  `certificate_number` VARCHAR(80) NOT NULL COMMENT 'e.g. STL-CAL-2025-8841',
  `test_point_sequence` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `parameter_name` VARCHAR(120) NOT NULL COMMENT 'e.g. Mass Linearity @ 100g, Flow Rate @ 50 L/min',
  `reference_standard_used` VARCHAR(160) NOT NULL COMMENT 'e.g. OIML Class E2 Weight Set #STL-REF-09',
  `nominal_value` DECIMAL(14,5) NOT NULL,
  `as_found_value` DECIMAL(14,5) NOT NULL,
  `as_left_value` DECIMAL(14,5) NOT NULL,
  `tolerance_limit_plus_minus` DECIMAL(14,5) NOT NULL,
  `expanded_uncertainty_k2` DECIMAL(14,5) NOT NULL DEFAULT 0.00100,
  `measurement_unit` VARCHAR(32) NOT NULL COMMENT 'g, mg, °C, mL/min, bar, nm, pH',
  `pass_fail_status` ENUM('PASS', 'ADJUSTED_PASS', 'FAIL_OUT_OF_TOLERANCE') NOT NULL DEFAULT 'PASS',
  `recorded_by_technician_id` CHAR(36) NOT NULL,
  `recorded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cal_readings_ticket` (`service_ticket_id`),
  KEY `idx_cal_readings_equipment` (`equipment_id`),
  KEY `idx_cal_readings_cert_num` (`certificate_number`),
  CONSTRAINT `fk_cal_readings_ticket`
    FOREIGN KEY (`service_ticket_id`) REFERENCES `service_tickets` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_cal_readings_equipment`
    FOREIGN KEY (`equipment_id`) REFERENCES `equipment_registry` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_cal_readings_technician`
    FOREIGN KEY (`recorded_by_technician_id`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 7. TABLE: quotations
-- Commercial Engine: Formal Quotations generated from Website RFQs or Service Tickets
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quotations` (
  `id` CHAR(36) NOT NULL,
  `quote_reference` VARCHAR(40) NOT NULL COMMENT 'e.g. QT-STL-2025-0412',
  `linked_website_rfq_ref` VARCHAR(40) DEFAULT NULL COMMENT 'Reference from public website RFQ form',
  `linked_service_ticket_id` CHAR(36) DEFAULT NULL COMMENT 'Reference when quoting field service/calibration',
  `customer_user_id` CHAR(36) DEFAULT NULL,
  `customer_company_name` VARCHAR(200) NOT NULL,
  `customer_contact_name` VARCHAR(150) NOT NULL,
  `customer_contact_email` VARCHAR(191) NOT NULL,
  `delivery_nigerian_state` VARCHAR(100) NOT NULL,
  `currency_code` ENUM('NGN', 'USD') NOT NULL DEFAULT 'NGN',
  `exchange_rate_ngn_per_usd` DECIMAL(12,2) NOT NULL DEFAULT 1580.00,
  `subtotal_usd` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `discount_percent` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `freight_delivery_usd` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `vat_percent` DECIMAL(5,2) NOT NULL DEFAULT 7.50 COMMENT 'Nigerian Finance Act 7.5% VAT',
  `total_amount_usd` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `total_amount_ngn` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `payment_validity_terms` VARCHAR(255) NOT NULL DEFAULT '30 Days Quote Validity | 70% Advance / 30% On Delivery or Corporate PO (Net-30)',
  `quote_status` ENUM(
    'Draft',
    'Sent for Approval',
    'Customer Approved',
    'Revision Requested',
    'Rejected'
  ) NOT NULL DEFAULT 'Sent for Approval',
  `customer_po_number` VARCHAR(80) DEFAULT NULL,
  `customer_po_file_path` VARCHAR(255) DEFAULT NULL,
  `customer_po_mime_type` VARCHAR(120) DEFAULT NULL,
  `customer_po_sha256` CHAR(64) DEFAULT NULL,
  `issued_by_staff_id` CHAR(36) DEFAULT NULL,
  `issued_date` DATE NOT NULL,
  `valid_until_date` DATE NOT NULL,
  `commercial_notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_quotations_ref` (`quote_reference`),
  KEY `idx_quotations_customer_email` (`customer_contact_email`),
  KEY `idx_quotations_customer_user` (`customer_user_id`),
  KEY `idx_quotations_ticket` (`linked_service_ticket_id`),
  KEY `idx_quotations_status` (`quote_status`),
  CONSTRAINT `fk_quotations_customer_user`
    FOREIGN KEY (`customer_user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_quotations_service_ticket`
    FOREIGN KEY (`linked_service_ticket_id`) REFERENCES `service_tickets` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_quotations_staff`
    FOREIGN KEY (`issued_by_staff_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 8. TABLE: quotation_items
-- Line items belonging to a formal quotation (Hardware, Reagents, or Calibration SLA)
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quotation_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `quotation_id` CHAR(36) NOT NULL,
  `line_number` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `sku_code` VARCHAR(80) NOT NULL,
  `item_description` VARCHAR(255) NOT NULL,
  `oem_brand` VARCHAR(120) DEFAULT 'Samstrust / OEM Partner',
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `unit_price_usd` DECIMAL(15,2) NOT NULL,
  `line_total_usd` DECIMAL(15,2) NOT NULL,
  `estimated_lead_time` VARCHAR(80) DEFAULT 'Ex-Stock Lagos / 2-3 Weeks',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_quotation_items_quote` (`quotation_id`),
  KEY `idx_quotation_items_sku` (`sku_code`),
  CONSTRAINT `fk_quotation_items_quotation`
    FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 9. TABLE: invoices
-- Proforma & Commercial Tax Invoices linked to approved quotations
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` CHAR(36) NOT NULL,
  `proforma_invoice_ref` VARCHAR(40) NOT NULL COMMENT 'e.g. PFI-STL-2025-0412',
  `quotation_id` CHAR(36) NOT NULL,
  `customer_user_id` CHAR(36) DEFAULT NULL,
  `billing_currency` ENUM('NGN', 'USD') NOT NULL DEFAULT 'NGN',
  `subtotal_amount` DECIMAL(18,2) NOT NULL,
  `vat_amount` DECIMAL(18,2) NOT NULL COMMENT '7.5% statutory VAT',
  `freight_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `grand_total_amount` DECIMAL(18,2) NOT NULL,
  `withholding_tax_applicable` TINYINT(1) NOT NULL DEFAULT 1,
  `payment_status` ENUM(
    'Unpaid',
    'Awaiting Verification',
    'Partially Paid (70% Deposit)',
    'Paid & Verified'
  ) NOT NULL DEFAULT 'Unpaid',
  `payment_method` ENUM(
    'Bank Wire Transfer (NGN)',
    'DOM Account Wire (USD)',
    'Corporate PO (Net-30)'
  ) NOT NULL DEFAULT 'Bank Wire Transfer (NGN)',
  `payment_bank_reference` VARCHAR(120) DEFAULT NULL,
  `remittance_verified_by_user_id` CHAR(36) DEFAULT NULL,
  `remittance_verified_at` DATETIME DEFAULT NULL,
  `due_date` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_invoices_proforma_ref` (`proforma_invoice_ref`),
  KEY `idx_invoices_quotation` (`quotation_id`),
  KEY `idx_invoices_customer` (`customer_user_id`),
  KEY `idx_invoices_payment_status` (`payment_status`),
  CONSTRAINT `fk_invoices_quotation`
    FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_invoices_customer`
    FOREIGN KEY (`customer_user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_invoices_verifier`
    FOREIGN KEY (`remittance_verified_by_user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 10. TABLE: notifications
-- Multi-channel in-app, Email, and WhatsApp notification dispatch queue
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` CHAR(36) NOT NULL,
  `recipient_user_id` CHAR(36) DEFAULT NULL,
  `target_role_slug` VARCHAR(50) DEFAULT NULL,
  `notification_category` ENUM('Calibration', 'Service Ticket', 'Quotation', 'Security') NOT NULL,
  `severity` ENUM('info', 'warning', 'urgent', 'success') NOT NULL DEFAULT 'info',
  `title` VARCHAR(180) NOT NULL,
  `message` TEXT NOT NULL,
  `linked_entity_ref` VARCHAR(80) DEFAULT NULL COMMENT 'Serial number, Ticket ID, or Quote Ref',
  `delivery_channels` SET('IN_APP', 'EMAIL', 'WHATSAPP') NOT NULL DEFAULT 'IN_APP,EMAIL',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `read_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_recipient_unread` (`recipient_user_id`, `is_read`),
  KEY `idx_notifications_role` (`target_role_slug`),
  CONSTRAINT `fk_notifications_recipient`
    FOREIGN KEY (`recipient_user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 11. TABLE: audit_trail
-- Immutable cryptographic security & compliance audit log (Anti-IDOR, Auth, Certificates)
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_trail` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_uuid` CHAR(36) NOT NULL,
  `actor_user_id` CHAR(36) DEFAULT NULL,
  `actor_name` VARCHAR(150) NOT NULL,
  `actor_email` VARCHAR(191) NOT NULL,
  `actor_role_slug` VARCHAR(50) NOT NULL,
  `event_category` ENUM(
    'Authentication',
    'Document Download',
    'Privilege & RBAC',
    'IDOR Access Control',
    'Calibration Sign-Off',
    'Commercial & Payment'
  ) NOT NULL,
  `action_code` VARCHAR(100) NOT NULL COMMENT 'e.g. AUTH_LOGIN_SUCCESS, CERT_PDF_DOWNLOAD, PO_UPLOAD_VERIFIED',
  `target_resource_ref` VARCHAR(120) NOT NULL,
  `severity` ENUM('Normal', 'Elevated', 'Critical') NOT NULL DEFAULT 'Normal',
  `client_ip_address` VARCHAR(45) NOT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `immutable_sha256_hash` CHAR(64) NOT NULL COMMENT 'Chained SHA-256 tamper-evident log hash',
  `metadata_json` JSON DEFAULT NULL,
  `occurred_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_audit_event_uuid` (`event_uuid`),
  KEY `idx_audit_actor_email` (`actor_email`),
  KEY `idx_audit_category_severity` (`event_category`, `severity`),
  KEY `idx_audit_target_resource` (`target_resource_ref`),
  KEY `idx_audit_occurred_at` (`occurred_at`),
  CONSTRAINT `fk_audit_actor_user`
    FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
