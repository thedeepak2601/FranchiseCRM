# Franchise CRM - Lead Lifecycle PRD

> Product Requirements Document for Enterprise-Grade Lead Management System

---

## 📋 Document Overview

| Property | Value |
|----------|-------|
| **Version** | 1.0 |
| **Date** | May 1, 2026 |
| **Status** | Production Ready |
| **Target** | ERPNext v14+ |

---

## 🎯 Executive Summary

### Problem Statement

Current CRM tracks leads by **stage only** — missing critical **event-driven intelligence** that top CRMs (Salesforce, HubSpot) use to drive conversions.

### Solution

**Event-driven + audit-driven lead lifecycle** where every interaction, decision, and state change is:
- Structured as a timeline event
- Linked to the lead
- Timestamp + user tracked
- Actionable with follow-up tasks

### Key Outcomes

| Metric | Current | Target |
|--------|---------|--------|
| First contact time | Unknown | <30 mins |
| Lead visibility | Stage only | Full timeline |
| Follow-up compliance | Manual | Auto-tracked |
| Conversion rate | ~15% | 25%+ |
| Audit readiness | Partial | Complete |

---

## 🧠 Core Principle

> A lead is NOT just moving across stages.
> 
> A lead is a **timeline of interactions + decisions + state changes**.

### What We Track

| Dimension | Data |
|-----------|------|
| **WHO** | Sales rep, captured by, assigned to |
| **WHEN** | Every timestamp (capture, contact, follow-up, stage change) |
| **HOW** | Channel (Call, WhatsApp, Email, SMS, Meeting) |
| **WHAT** | Notes, outcome, documents |
| **RESULT** | Status, score, stage |
| **NEXT ACTION** | Follow-up task with reminder |

---

## 🏗️ System Architecture

### Data Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LEAD LIFECYCLE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Lead ──────▶ Interaction Log ──────▶ Follow-up Task                       │
│     │                │                      │                               │
│     │                │                      │                               │
│     ▼                ▼                      ▼                               │
│  Timeline      Lead Metrics            Timeline Event                      │
│  Events        (Auto-calc)             (Auto-create)                       │
│                                                                             │
│     │                                                            │           │
│     ▼                                                            ▼           │
│  Opportunity (on conversion)                              Notification      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript + Tailwind |
| State | React Query |
| Backend | ERPNext v14 |
| API | REST API v2 |
| Auth | API Key + Secret |

---

## 📋 Feature Requirements

### FR-1: Lead Capture

#### FR-1.1: Create Lead

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | String | Yes | Min 2 chars |
| phone | String | Yes | Unique, valid format |
| email | String | No | Valid email format |
| source | Select | Yes | From predefined list |
| investment | Number | Yes | Min 1L |
| location | String | Yes | - |
| campaignId | String | No | - |
| utmSource | String | No | - |
| utmMedium | String | No | - |
| utmCampaign | String | No | - |

**Source Options:**
- Website
- Ads (Google, Facebook)
- WhatsApp
- Referral
- Portal
- Other

#### FR-1.2: De-duplication

| Match Field | Action |
|-------------|--------|
| Phone (exact) | Block + show existing |
| Email (exact) | Block + show existing |

#### FR-1.3: Auto-assignment

| Rule | Implementation |
|------|----------------|
| Geography | Assign to territory rep |
| Workload | Round-robin to least busy |
| Source | Specialist assignment |

---

### FR-2: First Contact (SLA Stage)

#### FR-2.1: SLA Rules

| Stage | SLA | Action |
|-------|-----|--------|
| Lead Capture → First Contact | 30 mins | Alert if breached |
| First Contact → Qualification | 24 hours | Alert if breached |

#### FR-2.2: Interaction Logging

**Required Fields:**
- lead (Link)
- sales_rep (Link)
- timestamp (DateTime)
- channel (Select)
- attempt_type (Select)
- outcome (Select)

**Optional Fields:**
- notes (Text)
- duration (Number)
- recording_url (Attach)

**Channel Options:**
- Call
- WhatsApp
- Email
- SMS
- Meeting
- Video Call

**Attempt Type:**
- Outbound
- Inbound

**Outcome Options:**
- Connected
- Not reachable
- Busy
- Wrong number
- Not interested
- No response
- Callback scheduled

#### FR-2.3: Auto Follow-up Creation

| Outcome | Action |
|---------|--------|
| Not reachable | Create task: Retry in 2 hours |
| Busy | Create task: Callback in 1 hour |
| No response | Create task: Follow-up tomorrow |
| Callback scheduled | Create task: Scheduled callback |

---

### FR-3: Multi-Touch Follow-up

#### FR-3.1: Interaction Metrics

| Metric | Calculation |
|--------|-------------|
| totalAttempts | COUNT of interactions |
| totalConnects | COUNT where outcome = connected |
| connectRate | (connects / attempts) * 100 |
| lastContactAt | MAX of timestamps |
| avgResponseHours | AVG time between attempts |
| bestChannel | Channel with highest connect rate |

#### FR-3.2: Follow-up Logic

| Attempt | Recommended Action |
|---------|-------------------|
| 1 | Call |
| 2 | Call + WhatsApp |
| 3 | Email |
| 4 | Call |
| 5 | Mark cold / nurture |

#### FR-3.3: Next Action

Every interaction MUST end with:

| Action | Description |
|--------|-------------|
| call_again | Schedule another call |
| send_brochure | Send franchise details |
| schedule_meeting | Book a meeting |
| wait_response | Wait for lead response |
| send_proposal | Send formal proposal |
| follow_up_email | Send follow-up email |

---

### FR-4: Qualification

#### FR-4.1: Qualification Form

| Field | Type | Required |
|-------|------|----------|
| budgetRange | Select | Yes |
| preferredLocation | String | No |
| businessExperience | Text | No |
| timelineToInvest | Select | Yes |
| isDecisionMaker | Checkbox | Yes |

**Budget Options:**
- 5-10L
- 10-20L
- 20-30L
- 30-50L
- 50L+

**Timeline Options:**
- Immediate
- 1 month
- 3 months
- 6 months
- Exploring

#### FR-4.2: Lead Scoring

| Factor | Weight | Score |
|--------|--------|-------|
| Budget fit | 25% | Match budget to investment |
| Timeline | 25% | Immediate = 25, Exploring = 5 |
| Decision maker | 25% | Yes = 25, No = 0 |
| Engagement | 25% | 5 pts per connect, max 25 |

**Score Ranges:**
- 0-40: Cold
- 41-60: Warm
- 61-80: Hot
- 81-100: Very Hot

#### FR-4.3: Validation Rules

| Rule | Description |
|------|-------------|
| Min interactions | Cannot qualify with <2 attempts |
| Min attempts | Cannot qualify with 0 connects |
| Form complete | All required fields must be filled |

---

### FR-5: Opportunity Creation

#### FR-5.1: Conversion

| Field | Type | Required |
|-------|------|----------|
| expectedInvestment | Number | Yes |
| territory | String | Yes |
| brand | Link | No |

#### FR-5.2: Data Preservation

- All interactions carry forward
- Timeline preserved
- Metrics preserved
- New opportunity linked to original lead

---

### FR-6: Pipeline Tracking

#### FR-6.1: Opportunity Stages

| Stage | Description | Documents |
|-------|-------------|-----------|
| NDA | Non-disclosure agreement | NDA signed |
| Discovery | Discovery call/meeting | Meeting notes |
| Proposal | Formal proposal sent | Proposal document |
| Negotiation | Terms negotiation | Revised proposal |
| Closing | Final agreement | Signed agreement |

#### FR-6.2: Stage Metrics

| Metric | Description |
|--------|-------------|
| probability | Win probability % |
| expectedCloseDate | Expected close |
| daysInStage | Time in current stage |

---

### FR-7: Timeline & Audit

#### FR-7.1: Timeline Events

| Event Type | Trigger | Data |
|------------|---------|------|
| lead_created | Lead creation | source, captured_by |
| lead_assigned | Assignment | from_user, to_user |
| interaction_logged | Interaction create | channel, outcome |
| stage_changed | Stage update | from_stage, to_stage |
| status_changed | Status update | from_status, to_status |
| score_updated | Score recalculation | old_score, new_score |
| qualification_completed | Qualification form | budget, timeline |
| lead_converted | Conversion | opportunity_id |
| follow_up_created | Task creation | task_id, due_date |
| follow_up_completed | Task completion | task_id |
| lead_disqualified | Disqualification | reason, notes |
| note_added | Manual note | note_text |
| document_uploaded | File upload | file_url, file_type |

#### FR-7.2: Audit Trail

Every event stores:
- timestamp (exact time)
- user (who performed)
- description (what happened)
- previous_value (before)
- new_value (after)
- metadata (additional data)

---

### FR-8: Controls & Validation

#### FR-8.1: Stage Movement Rules

| From | To | Allowed? |
|------|-----|-----------|
| lead_capture | first_contact | ✓ |
| lead_capture | qualification | ✗ (must go through first_contact) |
| first_contact | qualification | ✓ |
| qualification | pipeline | ✓ (if qualified) |
| pipeline | approvals | ✓ |
| approvals | agreement | ✓ |
| agreement | onboarding | ✓ |
| onboarding | post_sale | ✓ |

#### FR-8.2: Required Interactions

| Stage | Min Interactions |
|-------|-------------------|
| lead_capture | 0 |
| first_contact | 1 |
| qualification | 2 |
| pipeline | 3 |
| approvals | 1 |
| agreement | 2 |
| onboarding | 5 |
| post_sale | 0 |

#### FR-8.3: Business Rules

| Rule | Description |
|------|-------------|
| No stage skip | Cannot skip stages |
| No qualify without attempts | Min 2 interactions |
| No convert without qualify | Must be qualified |
| All actions timestamped | Every change logged |
| Full audit trail | Who did what, when |

---

## 📱 API Specification

### Endpoints

#### Leads

```
GET    /api/v2/resource/Lead
GET    /api/v2/resource/Lead/{name}
POST   /api/v2/resource/Lead
PUT    /api/v2/resource/Lead/{name}
DELETE /api/v2/resource/Lead/{name}
```

#### Interactions

```
GET    /api/v2/resource/Interaction Log?filters={"lead":"LD-001"}
POST   /api/v2/resource/Interaction Log
```

#### Follow-up Tasks

```
GET    /api/v2/resource/Follow-up Task?filters={"lead":"LD-001"}
POST   /api/v2/resource/Follow-up Task
POST   /api/method/complete_follow_up_task
```

#### Timeline

```
GET    /api/v2/resource/Activity Timeline?filters={"lead":"LD-001"}
```

#### RPC Methods

```
POST   /api/method/assign_lead
POST   /api/method/update_lead_stage
POST   /api/method/qualify_lead
POST   /api/method/convert_lead_to_opportunity
POST   /api/method/disqualify_lead
POST   /api/method/get_lead_dashboard_metrics
```

---

## 🎨 UI/UX Requirements

### Lead List View

| Component | Description |
|-----------|-------------|
| Pipeline stages | Visual funnel showing counts |
| Search | By name, phone, email, ID |
| Filter | By stage, status, source, owner |
| Sort | By score, created, last activity |
| Bulk actions | Assign, update stage, export |

### Lead Detail View

| Tab | Content |
|-----|---------|
| Timeline | Full chronological event list |
| Interactions | All interaction records |
| Tasks | Pending/completed follow-ups |
| Details | Contact, business, metrics info |

### Interaction Logger

| Component | Description |
|-----------|-------------|
| Channel selector | Visual icons for each channel |
| Outcome selector | Color-coded outcomes |
| Duration field | Auto-populate for calls |
| Next action | Required toggle with scheduler |
| Submit | Creates interaction + task if needed |

### Dashboard

| Widget | Data |
|--------|------|
| New leads today | COUNT |
| Qualified this week | COUNT |
| Converted this month | COUNT |
| Avg response time | HOURS |
| Connect rate | PERCENTAGE |
| SLA breaches | COUNT |

---

## 📊 Success Metrics

### KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| First contact SLA | >90% within 30 mins | Lead metrics |
| Interaction logging | 100% of contacts logged | Interaction count |
| Follow-up completion | >85% on time | Task status |
| Qualification rate | >40% of contacted | Stage distribution |
| Conversion rate | >25% qualified→won | Opportunity close |
| Lead score accuracy | >80% accurate | Score vs outcome |

### Dashboards

| Dashboard | Refresh | Data |
|-----------|---------|------|
| Lead pipeline | Real-time | Stage distribution |
| Sales rep performance | Daily | Interactions, conversions |
| SLA compliance | Hourly | Breached count |
| Source effectiveness | Daily | Conversion by source |

---

## 🚀 Implementation Phases

### Phase 1: Core (Week 1-2)

- [x] Lead DocType with all fields
- [x] Interaction Log DocType
- [x] Follow-up Task DocType
- [x] Activity Timeline DocType
- [x] Lead Metrics DocType

### Phase 2: Automation (Week 3)

- [ ] Auto follow-up creation
- [ ] SLA monitoring
- [ ] Score calculation
- [ ] Stage validation

### Phase 3: API (Week 4)

- [ ] REST endpoints
- [ ] RPC methods
- [ ] Authentication

### Phase 4: UI (Week 5-6)

- [ ] Lead list with pipeline
- [ ] Lead detail with timeline
- [ ] Interaction logger
- [ ] Dashboard widgets

### Phase 5: Testing (Week 7)

- [ ] Unit tests
- [ ] Integration tests
- [ ] User acceptance testing
- [ ] Performance testing

---

## ⚠️ Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data migration | High | Parallel run, validation scripts |
| User adoption | Medium | Training, documentation |
| Performance at scale | Medium | Indexing, caching, pagination |
| API rate limits | Low | Batch operations, caching |

---

## 📝 Appendix

### A. Field Definitions

See [Database Schema](database-schema.md)

### B. ERPNext Configuration

See [Lead Lifecycle Schema](lead-lifecycle-schema.md)

### C. API Examples

See [Lead API Client](../../src/lib/lead-api.ts)

---

## ✅ Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Tech Lead | | | |
| QA Lead | | | |
| VP Sales | | | |