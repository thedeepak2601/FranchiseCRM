# Franchise CRM - Database Schema

> Complete database schema for enterprise-grade lead lifecycle management

---

## 📊 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LEAD LIFECYCLE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌───────────┐ │
│  │   Lead   │────▶│ Interaction  │────▶│ Follow-up   │────▶│ Timeline  │ │
│  │          │     │     Log      │     │    Task     │     │  Event    │ │
│  └──────────┘     └──────────────┘     └─────────────┘     └───────────┘ │
│       │                   │                    │                   │       │
│       │                   │                    │                   │       │
│       ▼                   ▼                    ▼                   ▼       │
│  ┌──────────┐     ┌──────────────┐     ┌─────────────┐                   │
│  │ Opportunity│    │ Lead Metrics │     │   Lead      │                   │
│  │           │    │               │     │  Qualification│                  │
│  └──────────┘     └──────────────┘     └─────────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Table Definitions

### 1. leads

```sql
CREATE TABLE `tabLead` (
  -- Identification
  `name` VARCHAR(255) PRIMARY KEY,
  `owner` VARCHAR(255) DEFAULT NULL,
  `creation` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `modified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` VARCHAR(255) DEFAULT NULL,
  `docstatus` INT DEFAULT 0,
  `idx` INT DEFAULT 0,
  
  -- Core Fields
  `lead_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(255) DEFAULT NULL,
  `company` VARCHAR(255) DEFAULT NULL,
  
  -- Source & Capture
  `source` VARCHAR(50) NOT NULL,
  `campaign` VARCHAR(255) DEFAULT NULL,
  `utm_source` VARCHAR(100) DEFAULT NULL,
  `utm_medium` VARCHAR(100) DEFAULT NULL,
  `utm_campaign` VARCHAR(100) DEFAULT NULL,
  `captured_at` DATETIME DEFAULT NULL,
  `captured_by` VARCHAR(255) DEFAULT NULL,
  
  -- Assignment
  `assigned_at` DATETIME DEFAULT NULL,
  `assigned_by` VARCHAR(255) DEFAULT NULL,
  
  -- Business Info
  `investment` DECIMAL(15,2) DEFAULT 0,
  `location` VARCHAR(255) DEFAULT NULL,
  `preferred_locations` TEXT DEFAULT NULL, -- JSON array
  `territory` VARCHAR(100) DEFAULT NULL,
  
  -- Qualification
  `budget_range` VARCHAR(50) DEFAULT NULL,
  `business_experience` TEXT DEFAULT NULL,
  `timeline_to_invest` VARCHAR(50) DEFAULT NULL,
  `is_decision_maker` INT DEFAULT 0,
  `qualification_score` INT DEFAULT 0,
  
  -- State Management
  `stage` VARCHAR(50) NOT NULL DEFAULT 'lead_capture',
  `status` VARCHAR(50) NOT NULL DEFAULT 'new',
  `lead_score` INT DEFAULT 0,
  
  -- Links
  `opportunity` VARCHAR(255) DEFAULT NULL,
  `brand` VARCHAR(255) DEFAULT NULL,
  
  -- Indexes
  INDEX `idx_phone` (`phone`),
  INDEX `idx_email` (`email`),
  INDEX `idx_stage` (`stage`),
  INDEX `idx_status` (`status`),
  INDEX `idx_owner` (`owner`),
  INDEX `idx_source` (`source`),
  INDEX `idx_created` (`creation`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2. Interaction Log

```sql
CREATE TABLE `tabInteraction Log` (
  -- Identification
  `name` VARCHAR(255) PRIMARY KEY,
  `owner` VARCHAR(255) DEFAULT NULL,
  `creation` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `modified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` VARCHAR(255) DEFAULT NULL,
  `docstatus` INT DEFAULT 0,
  `idx` INT DEFAULT 0,
  
  -- Core Fields
  `lead` VARCHAR(255) NOT NULL,
  `sales_rep` VARCHAR(255) NOT NULL,
  `timestamp` DATETIME NOT NULL,
  
  -- Channel & Type
  `channel` VARCHAR(50) NOT NULL,
  `attempt_type` VARCHAR(50) NOT NULL DEFAULT 'outbound',
  `outcome` VARCHAR(50) NOT NULL,
  
  -- Details
  `notes` TEXT DEFAULT NULL,
  `duration` INT DEFAULT NULL,
  `recording_url` VARCHAR(500) DEFAULT NULL,
  
  -- Next Action
  `next_action` VARCHAR(50) DEFAULT NULL,
  `next_action_notes` TEXT DEFAULT NULL,
  `follow_up_task` VARCHAR(255) DEFAULT NULL,
  
  -- Foreign Keys
  FOREIGN KEY (`lead`) REFERENCES `tabLead`(`name`) ON DELETE CASCADE,
  FOREIGN KEY (`sales_rep`) REFERENCES `tabUser`(`name`) ON DELETE SET NULL,
  FOREIGN KEY (`follow_up_task`) REFERENCES `tabFollow-up Task`(`name`) ON DELETE SET NULL,
  
  -- Indexes
  INDEX `idx_lead` (`lead`),
  INDEX `idx_sales_rep` (`sales_rep`),
  INDEX `idx_timestamp` (`timestamp`),
  INDEX `idx_outcome` (`outcome`),
  INDEX `idx_channel` (`channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3. Follow-up Task

```sql
CREATE TABLE `tabFollow-up Task` (
  -- Identification
  `name` VARCHAR(255) PRIMARY KEY,
  `owner` VARCHAR(255) DEFAULT NULL,
  `creation` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `modified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` VARCHAR(255) DEFAULT NULL,
  `docstatus` INT DEFAULT 0,
  `idx` INT DEFAULT 0,
  
  -- Core Fields
  `lead` VARCHAR(255) NOT NULL,
  `interaction` VARCHAR(255) DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `task_type` VARCHAR(50) NOT NULL,
  
  -- Scheduling
  `scheduled_at` DATETIME NOT NULL,
  `completed_at` DATETIME DEFAULT NULL,
  
  -- Status
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `priority` VARCHAR(50) NOT NULL DEFAULT 'medium',
  
  -- Assignment
  `owner` VARCHAR(255) NOT NULL,
  `created_by` VARCHAR(255) NOT NULL,
  
  -- Foreign Keys
  FOREIGN KEY (`lead`) REFERENCES `tabLead`(`name`) ON DELETE CASCADE,
  FOREIGN KEY (`interaction`) REFERENCES `tabInteraction Log`(`name`) ON DELETE SET NULL,
  FOREIGN KEY (`owner`) REFERENCES `tabUser`(`name`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `tabUser`(`name`) ON DELETE SET NULL,
  
  -- Indexes
  INDEX `idx_lead` (`lead`),
  INDEX `idx_status` (`status`),
  INDEX `idx_scheduled_at` (`scheduled_at`),
  INDEX `idx_owner` (`owner`),
  INDEX `idx_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4. Activity Timeline

```sql
CREATE TABLE `tabActivity Timeline` (
  -- Identification
  `name` VARCHAR(255) PRIMARY KEY,
  `owner` VARCHAR(255) DEFAULT NULL,
  `creation` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `modified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` VARCHAR(255) DEFAULT NULL,
  `docstatus` INT DEFAULT 0,
  `idx` INT DEFAULT 0,
  
  -- Core Fields
  `lead` VARCHAR(255) NOT NULL,
  `event_type` VARCHAR(50) NOT NULL,
  `timestamp` DATETIME NOT NULL,
  `user` VARCHAR(255) NOT NULL,
  `description` VARCHAR(500) NOT NULL,
  
  -- Metadata
  `metadata` JSON DEFAULT NULL,
  
  -- Relations
  `interaction` VARCHAR(255) DEFAULT NULL,
  `task` VARCHAR(255) DEFAULT NULL,
  
  -- Values
  `previous_value` TEXT DEFAULT NULL,
  `new_value` TEXT DEFAULT NULL,
  
  -- Foreign Keys
  FOREIGN KEY (`lead`) REFERENCES `tabLead`(`name`) ON DELETE CASCADE,
  FOREIGN KEY (`user`) REFERENCES `tabUser`(`name`) ON DELETE SET NULL,
  FOREIGN KEY (`interaction`) REFERENCES `tabInteraction Log`(`name`) ON DELETE SET NULL,
  FOREIGN KEY (`task`) REFERENCES `tabFollow-up Task`(`name`) ON DELETE SET NULL,
  
  -- Indexes
  INDEX `idx_lead` (`lead`),
  INDEX `idx_event_type` (`event_type`),
  INDEX `idx_timestamp` (`timestamp`),
  INDEX `idx_user` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 5. Lead Metrics

```sql
CREATE TABLE `tabLead Metrics` (
  -- Identification
  `name` VARCHAR(255) PRIMARY KEY,
  `owner` VARCHAR(255) DEFAULT NULL,
  `creation` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `modified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` VARCHAR(255) DEFAULT NULL,
  `docstatus` INT DEFAULT 0,
  `idx` INT DEFAULT 0,
  
  -- Core Fields
  `lead` VARCHAR(255) NOT NULL UNIQUE,
  
  -- Interaction Stats
  `total_attempts` INT DEFAULT 0,
  `total_connects` INT DEFAULT 0,
  `connect_rate` DECIMAL(5,2) DEFAULT 0,
  
  -- Timing
  `first_contact_at` DATETIME DEFAULT NULL,
  `last_contact_at` DATETIME DEFAULT NULL,
  `avg_response_hours` DECIMAL(10,2) DEFAULT 0,
  
  -- Channel Stats (JSON)
  `channel_stats` JSON DEFAULT NULL,
  `best_channel` VARCHAR(50) DEFAULT NULL,
  
  -- SLA
  `sla_breached` INT DEFAULT 0,
  `sla_breach_at` DATETIME DEFAULT NULL,
  
  -- Foreign Keys
  FOREIGN KEY (`lead`) REFERENCES `tabLead`(`name`) ON DELETE CASCADE,
  
  -- Indexes
  INDEX `idx_lead` (`lead`),
  INDEX `idx_sla_breached` (`sla_breached`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 6. Opportunity

```sql
CREATE TABLE `tabOpportunity` (
  -- Identification
  `name` VARCHAR(255) PRIMARY KEY,
  `owner` VARCHAR(255) DEFAULT NULL,
  `creation` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `modified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` VARCHAR(255) DEFAULT NULL,
  `docstatus` INT DEFAULT 0,
  `idx` INT DEFAULT 0,
  
  -- Core Fields
  `lead` VARCHAR(255) NOT NULL,
  `customer` VARCHAR(255) DEFAULT NULL,
  
  -- Business
  `expected_investment` DECIMAL(15,2) DEFAULT 0,
  `territory` VARCHAR(100) DEFAULT NULL,
  `probability` INT DEFAULT 0,
  `expected_close_date` DATE DEFAULT NULL,
  
  -- Stage
  `opportunity_stage` VARCHAR(50) NOT NULL DEFAULT 'discovery',
  `brand` VARCHAR(255) DEFAULT NULL,
  
  -- Documents
  `nda_document` VARCHAR(500) DEFAULT NULL,
  `proposal_document` VARCHAR(500) DEFAULT NULL,
  `agreement_document` VARCHAR(500) DEFAULT NULL,
  
  -- Close
  `won` INT DEFAULT 0,
  `closed_at` DATETIME DEFAULT NULL,
  
  -- Foreign Keys
  FOREIGN KEY (`lead`) REFERENCES `tabLead`(`name`) ON DELETE SET NULL,
  FOREIGN KEY (`brand`) REFERENCES `tabBrand`(`name`) ON DELETE SET NULL,
  
  -- Indexes
  INDEX `idx_lead` (`lead`),
  INDEX `idx_opportunity_stage` (`opportunity_stage`),
  INDEX `idx_won` (`won`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 7. Lead Qualification

```sql
CREATE TABLE `tabLead Qualification` (
  -- Identification
  `name` VARCHAR(255) PRIMARY KEY,
  `owner` VARCHAR(255) DEFAULT NULL,
  `creation` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `modified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` VARCHAR(255) DEFAULT NULL,
  `docstatus` INT DEFAULT 0,
  `idx` INT DEFAULT 0,
  
  -- Core Fields
  `lead` VARCHAR(255) NOT NULL UNIQUE,
  
  -- Budget
  `budget_min` DECIMAL(15,2) DEFAULT 0,
  `budget_max` DECIMAL(15,2) DEFAULT 0,
  `budget_fit` VARCHAR(50) DEFAULT NULL,
  
  -- Timeline
  `timeline` VARCHAR(50) DEFAULT NULL,
  `urgency` VARCHAR(50) DEFAULT NULL,
  
  -- Authority
  `is_decision_maker` INT DEFAULT 0,
  `can_influence_budget` INT DEFAULT 0,
  `has_final_approval` INT DEFAULT 0,
  
  -- Experience
  `has_franchise_experience` INT DEFAULT 0,
  `related_industry_experience` TEXT DEFAULT NULL, -- JSON array
  `capital_available` INT DEFAULT 0,
  
  -- Notes
  `qualification_notes` TEXT DEFAULT NULL,
  `qualified_by` VARCHAR(255) DEFAULT NULL,
  `qualified_at` DATETIME DEFAULT NULL,
  
  -- Foreign Keys
  FOREIGN KEY (`lead`) REFERENCES `tabLead`(`name`) ON DELETE CASCADE,
  FOREIGN KEY (`qualified_by`) REFERENCES `tabUser`(`name`) ON DELETE SET NULL,
  
  -- Indexes
  INDEX `idx_lead` (`lead`),
  INDEX `idx_budget_fit` (`budget_fit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 🔍 Sample Queries

### Get Lead with Full Timeline

```sql
SELECT 
    l.name,
    l.lead_name,
    l.phone,
    l.email,
    l.stage,
    l.status,
    l.lead_score,
    l.investment,
    l.location,
    l.source,
    l.owner,
    l.creation as lead_created_at,
    l.modified as last_activity
FROM tabLead l
WHERE l.name = 'LD-001';
```

### Get Lead Interactions

```sql
SELECT 
    i.name,
    i.timestamp,
    i.channel,
    i.attempt_type,
    i.outcome,
    i.notes,
    i.duration,
    i.next_action,
    i.sales_rep
FROM `tabInteraction Log` i
WHERE i.lead = 'LD-001'
ORDER BY i.timestamp DESC;
```

### Get Lead Timeline

```sql
SELECT 
    t.name,
    t.event_type,
    t.timestamp,
    t.user,
    t.description,
    t.previous_value,
    t.new_value
FROM `tabActivity Timeline` t
WHERE t.lead = 'LD-001'
ORDER BY t.timestamp DESC;
```

### Get Pending Follow-up Tasks

```sql
SELECT 
    f.name,
    f.title,
    f.description,
    f.scheduled_at,
    f.status,
    f.priority,
    f.owner,
    f.lead
FROM `tabFollow-up Task` f
WHERE f.status IN ('pending', 'overdue')
AND f.scheduled_at <= NOW()
ORDER BY f.scheduled_at ASC;
```

### Get Lead Metrics

```sql
SELECT 
    m.name,
    m.total_attempts,
    m.total_connects,
    m.connect_rate,
    m.first_contact_at,
    m.last_contact_at,
    m.avg_response_hours,
    m.best_channel,
    m.sla_breached
FROM `tabLead Metrics` m
WHERE m.lead = 'LD-001';
```

### Get Dashboard Metrics

```sql
SELECT 
    COUNT(*) as total_leads,
    SUM(CASE WHEN DATE(creation) = CURDATE() THEN 1 ELSE 0 END) as new_today,
    SUM(CASE WHEN stage = 'pipeline' AND status = 'qualified' THEN 1 ELSE 0 END) as qualified_pipeline,
    SUM(CASE WHEN status = 'converted' AND MONTH(creation) = MONTH(CURDATE()) THEN 1 ELSE 0 END) as converted_this_month,
    AVG(lead_score) as avg_score
FROM tabLead;
```

### Get SLA Breached Leads

```sql
SELECT 
    l.name,
    l.lead_name,
    l.stage,
    l.status,
    TIMESTAMPDIFF(HOUR, l.modified, NOW()) as hours_since_update,
    m.sla_breach_at
FROM tabLead l
LEFT JOIN `tabLead Metrics` m ON l.name = m.lead
WHERE m.sla_breached = 1
ORDER BY m.sla_breach_at ASC;
```

---

## 📈 Indexing Strategy

### Primary Indexes (Auto-created)
- `name` - Primary key

### Secondary Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| Lead | idx_phone | phone | Deduplication |
| Lead | idx_email | email | Deduplication |
| Lead | idx_stage | stage | Stage filtering |
| Lead | idx_status | status | Status filtering |
| Lead | idx_owner | owner | Assignment |
| Lead | idx_source | source | Source reporting |
| Interaction Log | idx_lead | lead | Lead interactions |
| Interaction Log | idx_timestamp | timestamp | Timeline |
| Interaction Log | idx_outcome | outcome | Outcome reporting |
| Follow-up Task | idx_lead | lead | Lead tasks |
| Follow-up Task | idx_status | status | Task filtering |
| Follow-up Task | idx_scheduled_at | scheduled_at | Scheduling |
| Follow-up Task | idx_owner | owner | My tasks |
| Activity Timeline | idx_lead | lead | Lead timeline |
| Activity Timeline | idx_timestamp | timestamp | Chronological |

---

## 🔒 Data Integrity Rules

### Lead Validation

```sql
-- Phone format validation
ALTER TABLE `tabLead`
ADD CONSTRAINT chk_phone_format 
CHECK (phone REGEXP '^\\+?[0-9]{10,12}$');

-- Stage values
ALTER TABLE `tabLead`
ADD CONSTRAINT chk_stage 
CHECK (stage IN ('lead_capture', 'first_contact', 'qualification', 'pipeline', 
                 'approvals', 'agreement', 'onboarding', 'post_sale'));

-- Status values
ALTER TABLE `tabLead`
ADD CONSTRAINT chk_status 
CHECK (status IN ('new', 'in_progress', 'qualified', 'nurture', 'disqualified', 
                  'converted', 'pending', 'approved', 'active', 'cold'));
```

### Interaction Validation

```sql
-- Channel values
ALTER TABLE `tabInteraction Log`
ADD CONSTRAINT chk_channel 
CHECK (channel IN ('call', 'whatsapp', 'email', 'sms', 'meeting', 'video_call'));

-- Outcome values
ALTER TABLE `tabInteraction Log`
ADD CONSTRAINT chk_outcome 
CHECK (outcome IN ('connected', 'not_reachable', 'busy', 'wrong_number', 
                   'not_interested', 'no_response', 'scheduled_callback'));
```

---

## 📊 Partitioning Strategy

### By Stage (Optional)

```sql
-- Monthly partitioning for large datasets
ALTER TABLE `tabInteraction Log` 
PARTITION BY RANGE (TO_DAYS(timestamp)) (
    PARTITION p202601 VALUES LESS THAN (TO_DAYS('2026-02-01')),
    PARTITION p202602 VALUES LESS THAN (TO_DAYS('2026-03-01')),
    PARTITION p202603 VALUES LESS THAN (TO_DAYS('2026-04-01')),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

---

## 🗑️ Data Retention

| Data Type | Retention | Policy |
|-----------|-----------|--------|
| Active Leads | Indefinite | Keep while active |
| Disqualified Leads | 2 years | Archive then delete |
| Converted Leads | Indefinite | Keep linked to opportunity |
| Interactions | 5 years | Audit trail |
| Timeline Events | 5 years | Audit trail |
| Completed Tasks | 1 year | Archive then delete |

---

## ✅ Summary

| Entity | Fields | Relationships | Key Features |
|--------|--------|---------------|---------------|
| Lead | 30+ | → Interaction, Task, Timeline, Metrics, Opportunity | Full lifecycle tracking |
| Interaction Log | 15+ | → Lead, User, Task | Every touchpoint logged |
| Follow-up Task | 15+ | → Lead, Interaction, User | Actionable tasks |
| Activity Timeline | 15+ | → Lead, Interaction, Task, User | Complete audit trail |
| Lead Metrics | 15+ | → Lead | Auto-calculated analytics |
| Opportunity | 20+ | → Lead, Brand | Pipeline management |
| Lead Qualification | 20+ | → Lead | Structured qualification |