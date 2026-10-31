-- =====================================================================================
-- SAMSTRUST TECHNOLOGIES LIMITED (RC 9898142) - www.samstrusttech.com
-- Complete All-in-One Database Setup Script (Schema + Seed Data)
-- Target: MySQL 8.0+ / MariaDB 10.11+ / cPanel phpMyAdmin / Hostinger
-- File: /database/samstrust_complete_setup.sql
-- =====================================================================================
-- INSTRUCTIONS FOR CPANEL / PHPMYADMIN:
-- 1. In cPanel -> "MySQL Databases", create a new database (e.g. cpaneluser_samstrustdb).
-- 2. Open phpMyAdmin, click on your newly created database in the left sidebar.
-- 3. Click the "Import" tab on the top menu.
-- 4. Click "Choose File" and select THIS file (samstrust_complete_setup.sql).
-- 5. Click "Import" / "Go" at the bottom.
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
-- Physical testing laboratory sites, factory QA units, and receiving docks
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `customer_facilities` (
  `id` CHAR(36) NOT NULL,
  `customer_user_id` CHAR(36) NOT NULL,
  `facility_name` VARCHAR(150) NOT NULL,
  `facility_type` ENUM(
    'Central Testing Lab',
    'Satellite QA Unit',
    'Factory Production Bay',
    'Warehouse Receiving Dock',
    'Research & Development Wing',
    'Clinical / Medical Diagnostic Unit'
  ) NOT NULL DEFAULT 'Central Testing Lab',
  `facility_address` TEXT NOT NULL,
  `city` VARCHAR(80) NOT NULL,
  `state_province` VARCHAR(80) NOT NULL DEFAULT 'Lagos State',
  `postal_code` VARCHAR(20) DEFAULT NULL,
  `primary_site_contact_name` VARCHAR(120) NOT NULL,
  `primary_site_contact_phone` VARCHAR(40) NOT NULL,
  `access_restrictions_notes` TEXT DEFAULT NULL,
  `is_headquarters` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_facilities_customer_user_id` (`customer_user_id`),
  KEY `idx_facilities_state` (`state_province`),
  CONSTRAINT `fk_facilities_customer_user`
    FOREIGN KEY (`customer_user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 4. TABLE: equipment_registry
-- Digital Equipment Passport: Scientific instruments, analytical balances, ovens, etc.
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `equipment_registry` (
  `id` CHAR(36) NOT NULL,
  `customer_user_id` CHAR(36) NOT NULL,
  `facility_id` CHAR(36) NOT NULL,
  `equipment_name` VARCHAR(150) NOT NULL,
  `oem_brand` VARCHAR(100) NOT NULL,
  `model_number` VARCHAR(100) NOT NULL,
  `serial_number` VARCHAR(100) NOT NULL,
  `internal_asset_tag` VARCHAR(80) DEFAULT NULL,
  `equipment_category` ENUM(
    'Mass & Analytical Balances',
    'Thermal & Climate (Ovens/Incubators)',
    'Pressure & Vacuum Gauges',
    'Electrochemical (pH/Conductivity)',
    'Optical & Spectrophotometry',
    'Dimensional Metrology Tools',
    'Petroleum & Viscometry',
    'General Laboratory Hardware'
  ) NOT NULL,
  `commissioning_date` DATE NOT NULL,
  `calibration_interval_months` SMALLINT UNSIGNED NOT NULL DEFAULT 12,
  `last_calibration_date` DATE DEFAULT NULL,
  `next_calibration_due` DATE NOT NULL,
  `calibration_status` ENUM('Valid', 'Expiring Soon', 'Expired', 'Under Maintenance', 'Out of Service') NOT NULL DEFAULT 'Valid',
  `measurement_range` VARCHAR(120) DEFAULT NULL,
  `nominal_accuracy` VARCHAR(80) DEFAULT NULL,
  `room_location` VARCHAR(100) DEFAULT 'Main Testing Bay',
  `qr_passport_code` VARCHAR(120) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_equipment_serial` (`serial_number`),
  UNIQUE KEY `uk_equipment_qr_passport` (`qr_passport_code`),
  KEY `idx_equipment_customer_user` (`customer_user_id`),
  KEY `idx_equipment_facility` (`facility_id`),
  KEY `idx_equipment_status_due` (`calibration_status`, `next_calibration_due`),
  KEY `idx_equipment_category` (`equipment_category`),
  CONSTRAINT `fk_equipment_customer`
    FOREIGN KEY (`customer_user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_equipment_facility`
    FOREIGN KEY (`facility_id`) REFERENCES `customer_facilities` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 5. TABLE: service_tickets
-- Field service orders, calibrations, preventive maintenance, and emergency jobs
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `service_tickets` (
  `id` CHAR(36) NOT NULL,
  `ticket_reference` VARCHAR(40) NOT NULL COMMENT 'e.g. SR-2026-0842',
  `customer_user_id` CHAR(36) NOT NULL,
  `facility_id` CHAR(36) NOT NULL,
  `equipment_id` CHAR(36) DEFAULT NULL COMMENT 'NULL for unlisted / new device intake',
  `assigned_technician_id` CHAR(36) DEFAULT NULL,
  `coordinator_user_id` CHAR(36) DEFAULT NULL,
  `service_type` ENUM(
    'On-site ISO Calibration',
    'Preventive Maintenance',
    'Emergency Breakdown',
    'Installation & Commissioning',
    'Metrology User Training'
  ) NOT NULL,
  `urgency_rating` ENUM('Routine', 'Urgent', 'Critical Production Stoppage') NOT NULL DEFAULT 'Routine',
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
  `problem_summary` VARCHAR(255) NOT NULL,
  `detailed_description` TEXT NOT NULL,
  `fault_codes_observed` VARCHAR(255) DEFAULT NULL,
  `scheduled_visit_date` DATETIME DEFAULT NULL,
  `target_sla_resolution_date` DATETIME NOT NULL,
  `actual_completion_date` DATETIME DEFAULT NULL,
  `customer_signature_data` MEDIUMTEXT DEFAULT NULL COMMENT 'Base64 captured signature data',
  `customer_signer_name` VARCHAR(120) DEFAULT NULL,
  `customer_signer_designation` VARCHAR(100) DEFAULT NULL,
  `customer_signed_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_service_tickets_ref` (`ticket_reference`),
  KEY `idx_tickets_customer_user` (`customer_user_id`),
  KEY `idx_tickets_facility` (`facility_id`),
  KEY `idx_tickets_equipment` (`equipment_id`),
  KEY `idx_tickets_technician` (`assigned_technician_id`),
  KEY `idx_tickets_status_urgency` (`ticket_status`, `urgency_rating`),
  KEY `idx_tickets_scheduled_date` (`scheduled_visit_date`),
  CONSTRAINT `fk_tickets_customer`
    FOREIGN KEY (`customer_user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
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
    ON UPDATE CASCADE,
  CONSTRAINT `fk_tickets_coordinator`
    FOREIGN KEY (`coordinator_user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 6. TABLE: calibration_readings
-- As-Found and As-Left metrological verification test points
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `calibration_readings` (
  `id` CHAR(36) NOT NULL,
  `ticket_id` CHAR(36) NOT NULL,
  `equipment_id` CHAR(36) NOT NULL,
  `technician_id` CHAR(36) NOT NULL,
  `ambient_temperature_celsius` DECIMAL(4, 2) NOT NULL,
  `relative_humidity_percentage` DECIMAL(4, 2) NOT NULL,
  `barometric_pressure_kpa` DECIMAL(6, 2) DEFAULT '101.32',
  `primary_standard_used` VARCHAR(150) NOT NULL COMMENT 'e.g. Class F1 EIM Calibration Mass Set',
  `standard_cert_number` VARCHAR(80) NOT NULL,
  `standard_calibration_due` DATE NOT NULL,
  `nominal_test_point` VARCHAR(80) NOT NULL COMMENT 'e.g. 50.000 g, 200.0 °C',
  `tolerance_permitted_plus_minus` DECIMAL(10, 4) NOT NULL,
  `as_found_reading` DECIMAL(10, 4) NOT NULL,
  `as_found_error` DECIMAL(10, 4) NOT NULL,
  `as_found_status` ENUM('Pass', 'Fail', 'Marginal') NOT NULL,
  `as_left_reading` DECIMAL(10, 4) NOT NULL,
  `as_left_error` DECIMAL(10, 4) NOT NULL,
  `as_left_status` ENUM('Pass', 'Fail') NOT NULL DEFAULT 'Pass',
  `expanded_uncertainty_k2` DECIMAL(10, 4) DEFAULT NULL,
  `parts_replaced_log` TEXT DEFAULT NULL,
  `technician_remarks` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_readings_ticket` (`ticket_id`),
  KEY `idx_readings_equipment` (`equipment_id`),
  KEY `idx_readings_technician` (`technician_id`),
  CONSTRAINT `fk_readings_ticket`
    FOREIGN KEY (`ticket_id`) REFERENCES `service_tickets` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_readings_equipment`
    FOREIGN KEY (`equipment_id`) REFERENCES `equipment_registry` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_readings_technician`
    FOREIGN KEY (`technician_id`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 7. TABLE: quotations
-- Formal commercial quotations and proforma agreements
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quotations` (
  `id` CHAR(36) NOT NULL,
  `quote_number` VARCHAR(40) NOT NULL COMMENT 'e.g. QT-2026-0419',
  `customer_user_id` CHAR(36) NOT NULL,
  `prepared_by_user_id` CHAR(36) NOT NULL,
  `ticket_id` CHAR(36) DEFAULT NULL,
  `currency` ENUM('NGN', 'USD') NOT NULL DEFAULT 'NGN',
  `subtotal_amount` DECIMAL(14, 2) NOT NULL DEFAULT '0.00',
  `vat_rate_percentage` DECIMAL(4, 2) NOT NULL DEFAULT '7.50',
  `vat_amount` DECIMAL(14, 2) NOT NULL DEFAULT '0.00',
  `freight_logistics_charge` DECIMAL(14, 2) NOT NULL DEFAULT '0.00',
  `grand_total_amount` DECIMAL(14, 2) NOT NULL DEFAULT '0.00',
  `payment_terms_days` SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  `quote_validity_date` DATE NOT NULL,
  `quote_status` ENUM('Draft', 'Sent to Client', 'Approved by Client', 'Rejected', 'PO Received', 'Converted to Invoice', 'Expired') NOT NULL DEFAULT 'Sent to Client',
  `customer_purchase_order_number` VARCHAR(80) DEFAULT NULL,
  `customer_po_document_url` VARCHAR(255) DEFAULT NULL,
  `client_rejection_reason` TEXT DEFAULT NULL,
  `internal_commercial_notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_quotations_quote_number` (`quote_number`),
  KEY `idx_quotations_customer` (`customer_user_id`),
  KEY `idx_quotations_status` (`quote_status`),
  KEY `idx_quotations_validity` (`quote_validity_date`),
  CONSTRAINT `fk_quotations_customer`
    FOREIGN KEY (`customer_user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_quotations_preparer`
    FOREIGN KEY (`prepared_by_user_id`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_quotations_ticket`
    FOREIGN KEY (`ticket_id`) REFERENCES `service_tickets` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 8. TABLE: quotation_items
-- Individual line items in commercial quotes
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quotation_items` (
  `id` CHAR(36) NOT NULL,
  `quotation_id` CHAR(36) NOT NULL,
  `item_order_sequence` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `item_type` ENUM('Equipment Supply', 'Metrology Calibration', 'Spare Part / Consumable', 'Preventive Maintenance Service', 'Logistics / Mobilization') NOT NULL,
  `item_description` VARCHAR(255) NOT NULL,
  `oem_part_number` VARCHAR(80) DEFAULT NULL,
  `quantity` DECIMAL(10, 2) NOT NULL DEFAULT '1.00',
  `unit_of_measure` VARCHAR(20) NOT NULL DEFAULT 'Unit',
  `unit_price` DECIMAL(14, 2) NOT NULL DEFAULT '0.00',
  `extended_amount` DECIMAL(14, 2) NOT NULL DEFAULT '0.00',
  `warranty_coverage_months` SMALLINT UNSIGNED NOT NULL DEFAULT 12,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_quote_items_quotation` (`quotation_id`),
  CONSTRAINT `fk_quote_items_quotation`
    FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 9. TABLE: invoices
-- Final tax invoices, proformas, payment tracking
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` CHAR(36) NOT NULL,
  `invoice_number` VARCHAR(40) NOT NULL COMMENT 'e.g. INV-2026-0318',
  `quotation_id` CHAR(36) NOT NULL,
  `customer_user_id` CHAR(36) NOT NULL,
  `currency` ENUM('NGN', 'USD') NOT NULL DEFAULT 'NGN',
  `subtotal_amount` DECIMAL(14, 2) NOT NULL,
  `vat_amount` DECIMAL(14, 2) NOT NULL,
  `freight_amount` DECIMAL(14, 2) NOT NULL DEFAULT '0.00',
  `grand_total_amount` DECIMAL(14, 2) NOT NULL,
  `amount_paid` DECIMAL(14, 2) NOT NULL DEFAULT '0.00',
  `payment_status` ENUM('Unpaid', 'Partially Paid', 'Paid in Full', 'Overdue', 'Cancelled') NOT NULL DEFAULT 'Unpaid',
  `due_date` DATE NOT NULL,
  `paid_at` DATETIME DEFAULT NULL,
  `payment_reference` VARCHAR(100) DEFAULT NULL,
  `bank_name` VARCHAR(80) DEFAULT 'Access Bank / Zenith Bank Nigeria',
  `official_receipt_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_invoices_number` (`invoice_number`),
  KEY `idx_invoices_customer` (`customer_user_id`),
  KEY `idx_invoices_quotation` (`quotation_id`),
  KEY `idx_invoices_payment_status` (`payment_status`),
  CONSTRAINT `fk_invoices_quotation`
    FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_invoices_customer`
    FOREIGN KEY (`customer_user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 10. TABLE: notifications
-- Notification dispatch log (Email & WhatsApp alert tracking)
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` CHAR(36) NOT NULL,
  `recipient_user_id` CHAR(36) NOT NULL,
  `channel` ENUM('In-App', 'Email', 'WhatsApp') NOT NULL DEFAULT 'In-App',
  `category` ENUM(
    'Calibration Due Notice',
    'Quote Ready for Review',
    'Technician Dispatched',
    'Service Ticket Resolved',
    'Payment Received Confirmation',
    'Security Alert'
  ) NOT NULL,
  `subject_title` VARCHAR(200) NOT NULL,
  `message_body` TEXT NOT NULL,
  `target_action_url` VARCHAR(255) DEFAULT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `delivered_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notif_recipient_read` (`recipient_user_id`, `is_read`),
  KEY `idx_notif_created_at` (`created_at`),
  CONSTRAINT `fk_notif_recipient_user`
    FOREIGN KEY (`recipient_user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 11. TABLE: audit_trail
-- Immutable chained audit log for security compliance and metrology accreditation
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_trail` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_uuid` CHAR(36) NOT NULL,
  `actor_user_id` CHAR(36) DEFAULT NULL,
  `actor_email` VARCHAR(191) NOT NULL,
  `actor_role` VARCHAR(50) NOT NULL,
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

-- =====================================================================================
-- SEED DATA: 5 Enterprise RBAC Roles & Initial Accounts
-- =====================================================================================

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
-- Initial Portal Super Admin & Staff Accounts
-- -------------------------------------------------------------------------------------
INSERT INTO `users` (
  `id`, `role_id`, `email`, `password_hash`, `password_salt`, `full_name`, `job_title`,
  `company_name`, `cac_registration_number`, `phone_number`, `assigned_region`,
  `two_factor_enabled`, `account_status`, `password_must_change`
)
VALUES
(
  'usr-admin-0001', 5, 'admin@samstrusttech.com',
  '$2b$10$Iyy6bmU9TlDVenolA3dbGuyKsZWWKT6jRYrFuQNcUvBoh5kXCb5ty',
  'SALT_ADM_2026', 'Engr. Samuel O. Trust', 'Managing Director & Chief Metrologist',
  'Samstrust Technologies Limited', 'RC 9898142', '+2348029844356', 'Headquarters (Lagos)',
  1, 'Active', 1
),
(
  'usr-tech-0001', 2, 'tech.okoye@samstrusttech.com',
  '$2b$10$Iyy6bmU9TlDVenolA3dbGuyKsZWWKT6jRYrFuQNcUvBoh5kXCb5ty',
  'SALT_TCH_2026', 'Engr. Nnamdi Okoye', 'Senior COREN Metrology Specialist',
  'Samstrust Technologies Limited', 'RC 9898142', '+2348029844356', 'Lagos & South-West',
  1, 'Active', 1
),
(
  'usr-coord-0001', 3, 'dispatch@samstrusttech.com',
  '$2b$10$Iyy6bmU9TlDVenolA3dbGuyKsZWWKT6jRYrFuQNcUvBoh5kXCb5ty',
  'SALT_CRD_2026', 'Engr. Amina Suleiman', 'National Service Operations Lead',
  'Samstrust Technologies Limited', 'RC 9898142', '+2348029844356', 'National Operations',
  1, 'Active', 1
),
(
  'usr-sales-0001', 4, 'commercial@samstrusttech.com',
  '$2b$10$Iyy6bmU9TlDVenolA3dbGuyKsZWWKT6jRYrFuQNcUvBoh5kXCb5ty',
  'SALT_SLS_2026', 'Femi Adebayo', 'Senior Commercial Accounts Specialist',
  'Samstrust Technologies Limited', 'RC 9898142', '+2348029844356', 'Commercial Desk',
  1, 'Active', 1
),
(
  'usr-cust-0001', 1, 'c.nwachukwu@biozenith.com',
  '$2b$10$Iyy6bmU9TlDVenolA3dbGuyKsZWWKT6jRYrFuQNcUvBoh5kXCb5ty',
  'SALT_BZ_2026', 'Dr. Chioma Nwachukwu', 'Director of Quality Assurance',
  'BioZenith Pharmaceuticals Ltd', 'RC 1489201', '+2348023341188', 'Lagos & South-West',
  0, 'Active', 0
)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`), `password_hash` = VALUES(`password_hash`);

-- -------------------------------------------------------------------------------------
-- Initial Customer Facility
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
-- Initial Digital Equipment Passport Asset
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
-- Initial Service Request Ticket
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

