# Franchise CRM - Lead Lifecycle DocType Schema

> Complete ERPNext implementation guide for enterprise-grade lead management

---

## 📋 DocType 1: Lead (Extended)

### Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | Data | Yes | Lead name |
| `phone` | Data | Yes | Primary phone (unique) |
| `email` | Data | No | Email address |
| `lead_name` | Data | Yes | Full name (for search) |
| `company` | Data | No | Company name |

### Source & Capture

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `source` | Select | Yes | Lead source |
| `campaign` | Link | No | Campaign DocType |
| `utm_source` | Data | No | UTM source |
| `utm_medium` | Data | No | UTM medium |
| `utm_campaign` | Data | No | UTM campaign |
| `captured_at` | Datetime | Yes | Capture timestamp |
| `captured_by` | Link | Yes | User/Bot |

### Assignment

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `owner` | Link | Yes | Sales rep (User) |
| `assigned_at` | Datetime | No | Assignment timestamp |
| `assigned_by` | Link | No | Assigned by user |

### Business Info

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `investment` | Currency | Yes | Investment in Lakhs |
| `location` | Data | Yes | Current location |
| `preferred_locations` | Table | No | Multi-select locations |
| `territory` | Select | No | Territory assignment |

### Qualification

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `budget_range` | Select | No | Budget range |
| `business_experience` | Small Text | No | Experience details |
| `timeline_to_invest` | Select | No | Investment timeline |
| `is_decision_maker` | Check | No | Is decision maker? |
| `qualification_score` | Int | No | Auto-calculated score |

### State Management

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `stage` | Select | Yes | Current stage |
| `status` | Select | Yes | Lead status |
| `lead_score` | Int | No | 0-100 score |

### Links

| Field | Type | Description |
|-------|------|-------------|
| `opportunity` | Link | Linked Opportunity |
| `brand` | Link | Brand interest |

### Custom Script (Client)

```javascript
// Lead Client Script
frappe.ui.form.on('Lead', {
    validate: function(frm) {
        // Stage validation
        if (frm.doc.stage === 'qualification' && frm.doc.status === 'new') {
            frappe.msgprint('Lead must have at least 2 interactions before qualification');
            frappe.validated = false;
        }
    },
    
    onload: function(frm) {
        // Auto-assignment based on workload
        if (!frm.doc.owner) {
            frappe.call({
                method: 'franchise_crm.api.get_available_rep',
                callback: function(r) {
                    if (r.message) {
                        frm.set_value('owner', r.message);
                    }
                }
            });
        }
    }
});
```

---

## 📋 DocType 2: Interaction Log (CORE)

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `lead` | Link | Yes | Lead DocType |
| `sales_rep` | Link | Yes | User (Sales rep) |
| `timestamp` | Datetime | Yes | Interaction time |
| `channel` | Select | Yes | Call/WhatsApp/Email/SMS/Meeting |
| `attempt_type` | Select | Yes | Outbound/Inbound |
| `outcome` | Select | Yes | Connected/Not reachable/Busy/etc |
| `notes` | Text | No | Interaction notes |
| `duration` | Int | No | Duration in minutes |
| `recording_url` | Attach | No | Call recording |

### Next Action Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `next_action` | Select | No | Next action type |
| `next_action_notes` | Small Text | No | Next action details |
| `follow_up_task` | Link | No | Follow-up Task |

### Automation

```python
# Interaction Log Automation
def after_insert(doc):
    # 1. Update lead metrics
    update_lead_metrics(doc.lead)
    
    # 2. Create follow-up task if not connected
    if doc.outcome in ['not_reachable', 'no_response', 'busy']:
        create_follow_up_task(doc)
    
    # 3. Log timeline event
    create_timeline_event(doc)
    
    # 4. Check SLA
    check_sla_breach(doc.lead)
```

---

## 📋 DocType 3: Follow-up Task

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `lead` | Link | Yes | Lead DocType |
| `interaction` | Link | No | Source interaction |
| `title` | Data | Yes | Task title |
| `description` | Text | No | Task description |
| `task_type` | Select | Yes | Task type |
| `scheduled_at` | Datetime | Yes | Due datetime |
| `completed_at` | Datetime | No | Completion time |
| `status` | Select | Yes | Pending/Completed/Overdue/Cancelled |
| `priority` | Select | Yes | Low/Medium/High/Urgent |
| `owner` | Link | Yes | Assigned to (User) |
| `created_by` | Link | Yes | Created by (User) |

### Automation

```python
# Follow-up Task Automation
def validate(doc):
    # Check for overdue
    if doc.status == 'Pending' and doc.scheduled_at < now_datetime():
        doc.status = 'Overdue'

def after_insert(doc):
    # Send notification to owner
    send_notification(
        recipient=doc.owner,
        subject=f"Follow-up Task: {doc.title}",
        message=f"Lead: {doc.lead}<br>Due: {doc.scheduled_at}"
    )
```

---

## 📋 DocType 4: Activity Timeline (Auto-Generated)

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `lead` | Link | Yes | Lead DocType |
| `event_type` | Select | Yes | Event type |
| `timestamp` | Datetime | Yes | Event time |
| `user` | Link | Yes | User who performed action |
| `description` | Data | Yes | Event description |
| `metadata` | JSON | No | Additional data |
| `interaction` | Link | No | Related interaction |
| `task` | Link | No | Related task |
| `previous_value` | Small Text | No | Previous value |
| `new_value` | Small Text | No | New value |

### Event Types

```python
EVENT_TYPES = [
    'lead_created',
    'lead_assigned',
    'interaction_logged',
    'stage_changed',
    'status_changed',
    'score_updated',
    'qualification_completed',
    'lead_converted',
    'follow_up_created',
    'follow_up_completed',
    'lead_disqualified',
    'note_added',
    'document_uploaded',
]
```

---

## 📋 DocType 5: Lead Metrics (Auto-Calculated)

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `lead` | Link | Lead DocType |
| `total_attempts` | Int | Total interaction attempts |
| `total_connects` | Int | Total successful connects |
| `connect_rate` | Float | Connection rate % |
| `first_contact_at` | Datetime | First contact timestamp |
| `last_contact_at` | Datetime | Last contact timestamp |
| `avg_response_hours` | Float | Average response time |
| `channel_stats` | JSON | Channel-wise stats |
| `best_channel` | Select | Most effective channel |
| `sla_breached` | Check | SLA breach flag |
| `sla_breach_at` | Datetime | SLA breach time |

### Calculation Method

```python
def update_lead_metrics(lead_name):
    lead = frappe.get_doc('Lead', lead_name)
    interactions = frappe.get_all(
        'Interaction Log',
        filters={'lead': lead_name},
        fields=['outcome', 'channel', 'creation']
    )
    
    metrics = {
        'total_attempts': len(interactions),
        'total_connects': len([i for i in interactions if i.outcome == 'connected']),
        'connect_rate': calculate_rate(),
        'first_contact_at': get_first_contact(interactions),
        'last_contact_at': get_last_contact(interactions),
        'channel_stats': calculate_channel_stats(interactions),
        'best_channel': get_best_channel(interactions),
    }
    
    # Update or create metrics doc
    frappe.get_doc({
        'doctype': 'Lead Metrics',
        'lead': lead_name,
        **metrics
    }).insert()
```

---

## 📋 DocType 6: Opportunity (Converted Lead)

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `lead` | Link | Yes | Original lead |
| `customer` | Link | No | Customer (if created) |
| `expected_investment` | Currency | Yes | Expected deal value |
| `territory` | Data | Yes | Territory |
| `probability` | Int | Yes | Win probability % |
| `expected_close_date` | Date | No | Expected close |
| `opportunity_stage` | Select | Yes | NDA/Discovery/Proposal/Negotiation/Closing |
| `brand` | Link | No | Brand |
| `nda_document` | Attach | No | NDA |
| `proposal_document` | Attach | No | Proposal |
| `agreement_document` | Attach | No | Agreement |
| `won` | Check | No | Won flag |
| `closed_at` | Datetime | No | Close timestamp |

---

## 🔧 Server Methods (API)

### 1. Assign Lead

```python
@frappe.whitelist()
def assign_lead(lead_name, user):
    lead = frappe.get_doc('Lead', lead_name)
    lead.owner = user
    lead.assigned_at = now_datetime()
    lead.assigned_by = frappe.session.user
    lead.save()
    
    # Log timeline event
    create_timeline_event(lead_name, 'lead_assigned', {
        'user': user,
        'previous_owner': frappe.db.get_value('Lead', lead_name, 'owner')
    })
    
    return lead
```

### 2. Update Stage with Validation

```python
@frappe.whitelist()
def update_lead_stage(lead_name, new_stage, reason=None, notes=None):
    lead = frappe.get_doc('Lead', lead_name)
    old_stage = lead.stage
    
    # Validation: Cannot skip stages
    stage_order = ['lead_capture', 'first_contact', 'qualification', 
                   'pipeline', 'approvals', 'agreement', 'onboarding', 'post_sale']
    
    if stage_order.index(new_stage) > stage_order.index(old_stage) + 1:
        frappe.throw(f"Cannot skip from {old_stage} to {new_stage}")
    
    # Validation: Qualification required before pipeline
    if new_stage == 'pipeline' and lead.status != 'Qualified':
        frappe.throw("Lead must be qualified before moving to pipeline")
    
    lead.stage = new_stage
    lead.save()
    
    # Log timeline
    create_timeline_event(lead_name, 'stage_changed', {
        'previous_value': old_stage,
        'new_value': new_stage,
        'reason': reason,
        'notes': notes
    })
    
    return lead
```

### 3. Qualify Lead

```python
@frappe.whitelist()
def qualify_lead(lead_name, budget_range, timeline_to_invest, 
                 is_decision_maker, business_experience):
    lead = frappe.get_doc('Lead', lead_name)
    
    # Validation: Minimum interactions
    interaction_count = frappe.count('Interaction Log', {'lead': lead_name})
    if interaction_count < 2:
        frappe.throw("Minimum 2 interactions required for qualification")
    
    lead.budget_range = budget_range
    lead.timeline_to_invest = timeline_to_invest
    lead.is_decision_maker = is_decision_maker
    lead.business_experience = business_experience
    lead.status = 'Qualified'
    lead.stage = 'pipeline'
    lead.lead_score = calculate_qualification_score(lead)
    lead.save()
    
    # Log timeline
    create_timeline_event(lead_name, 'qualification_completed', {
        'budget_range': budget_range,
        'timeline': timeline_to_invest,
        'score': lead.lead_score
    })
    
    return lead
```

### 4. Convert to Opportunity

```python
@frappe.whitelist()
def convert_lead_to_opportunity(lead_name, expected_investment, territory, brand=None):
    lead = frappe.get_doc('Lead', lead_name)
    
    # Validation: Must be qualified
    if lead.status != 'Qualified':
        frappe.throw("Only qualified leads can be converted")
    
    # Create opportunity
    opportunity = frappe.get_doc({
        'doctype': 'Opportunity',
        'lead': lead_name,
        'expected_investment': expected_investment,
        'territory': territory,
        'brand': brand,
        'opportunity_stage': 'discovery',
        'probability': 50,
    })
    opportunity.insert()
    
    # Update lead
    lead.status = 'Converted'
    lead.opportunity = opportunity.name
    lead.save()
    
    # Log timeline
    create_timeline_event(lead_name, 'lead_converted', {
        'opportunity': opportunity.name,
        'investment': expected_investment
    })
    
    return {'opportunity': opportunity.name, 'lead': lead_name}
```

### 5. Disqualify Lead

```python
@frappe.whitelist()
def disqualify_lead(lead_name, reason, notes=None):
    lead = frappe.get_doc('Lead', lead_name)
    old_status = lead.status
    
    lead.status = 'Disqualified'
    lead.stage = 'lead_capture'
    lead.save()
    
    # Log timeline (even for disqualification!)
    create_timeline_event(lead_name, 'lead_disqualified', {
        'reason': reason,
        'notes': notes,
        'previous_status': old_status
    })
    
    return lead
```

---

## ⚡ Automation Rules

### 1. SLA Monitoring

```python
# Background Job: Check SLA
def check_sla_breaches():
    leads = frappe.get_all('Lead', 
        filters={'status': ['in', ['New', 'In Progress']]},
        fields=['name', 'stage', 'modified']
    )
    
    sla_config = {
        'first_contact': 0.5,  # 30 minutes
        'qualification': 24,   # 24 hours
        'pipeline': 72,        # 3 days
        'approvals': 48,       # 2 days
        'agreement': 24,       # 1 day
    }
    
    for lead in leads:
        stage = lead.stage
        if stage in sla_config:
            hours_since_update = get_hours_since(lead.modified)
            if hours_since_update > sla_config[stage]:
                # Mark as SLA breached
                notify_sales_manager(lead.name)
```

### 2. Auto Assignment

```python
# Round-robin assignment
def get_available_rep():
    reps = frappe.get_all(
        'User',
        filters={'enabled': 1, 'user_type': 'Website User'},
        fields=['name']
    )
    
    # Get current workload
    current_leads = frappe.get_all('Lead', 
        filters={'owner': ['in', [r.name for r in reps]]},
        fields=['owner', 'count(name) as count'],
        group_by='owner'
    )
    
    # Return rep with least workload
    return min(current_leads, key=lambda x: x.count) if current_leads else reps[0]
```

### 3. Score Calculation

```python
def calculate_qualification_score(lead):
    score = 0
    
    # Budget fit (0-25)
    if lead.budget_range:
        budget_scores = {
            '10-20L': 15,
            '20-30L': 20,
            '30-50L': 25,
            '50L+': 25
        }
        score += budget_scores.get(lead.budget_range, 0)
    
    # Timeline (0-25)
    timeline_scores = {
        'immediate': 25,
        '1_month': 20,
        '3_months': 15,
        '6_months': 10,
        'exploring': 5
    }
    score += timeline_scores.get(lead.timeline_to_invest, 0)
    
    # Decision maker (0-25)
    if lead.is_decision_maker:
        score += 25
    
    # Engagement (0-25)
    interactions = frappe.get_all('Interaction Log', 
        filters={'lead': lead.name, 'outcome': 'connected'})
    score += min(len(interactions) * 5, 25)
    
    return score
```

---

## 📱 REST API Endpoints

### Leads

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/resource/Lead` | List leads |
| GET | `/api/v2/resource/Lead/{name}` | Get lead details |
| POST | `/api/v2/resource/Lead` | Create lead |
| PUT | `/api/v2/resource/Lead/{name}` | Update lead |
| DELETE | `/api/v2/resource/Lead/{name}` | Delete lead |

### Interactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/resource/Interaction Log` | List interactions |
| POST | `/api/v2/resource/Interaction Log` | Create interaction |

### Follow-up Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/resource/Follow-up Task` | List tasks |
| POST | `/api/v2/resource/Follow-up Task` | Create task |
| POST | `/api/method/complete_follow_up_task` | Complete task |

### RPC Methods

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/method/assign_lead` | Assign lead |
| POST | `/api/method/update_lead_stage` | Update stage |
| POST | `/api/method/qualify_lead` | Qualify lead |
| POST | `/api/method/convert_lead_to_opportunity` | Convert lead |
| POST | `/api/method/disqualify_lead` | Disqualify lead |
| POST | `/api/method/get_lead_dashboard_metrics` | Dashboard metrics |

---

## ✅ Critical Controls Summary

| Control | Implementation |
|---------|----------------|
| Cannot move stage without interaction | Server method validation |
| Cannot qualify without min 2 attempts | Server method validation |
| Cannot convert without qualification | Server method validation |
| Every action is timestamped | Activity Timeline DocType |
| Full audit trail | Timeline + lead history |
| SLA monitoring | Background job |
| Auto follow-up creation | Interaction automation |