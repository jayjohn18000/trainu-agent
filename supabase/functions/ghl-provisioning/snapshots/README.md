# GHL Snapshot Definitions

This directory contains JSON snapshot definitions for each subscription tier. These snapshots define the GHL assets (workflows, automations, tags, custom fields, calendars, pipelines, funnels) that should be provisioned for each tier.

## File Structure

- `starter.json` - Starter tier snapshot (basic CRM features)
- `professional.json` - Professional tier snapshot (unlimited scale, advanced automations)
- `growth.json` - Growth tier snapshot (full GHL suite, all features)

## Snapshot Structure

Each snapshot JSON file contains:

### Top-Level Fields

- `tier` - Tier identifier ("starter", "professional", "growth")
- `description` - Human-readable description
- `snapshotId` - Reference to GHL snapshot ID (if applicable)

### Tags

- `tags.additional` - Additional tags to create beyond base tags
- `tags.workflowTags` - Tags used by workflows for identification

### Custom Fields

- `customFields.additional` - Custom fields to create for contacts
  - `name` - Display name
  - `key` - Internal key (snake_case)
  - `fieldType` - Type: "text", "textarea", "select", "checkbox", "number"
  - `options` - Array of options (for select fields)

### Workflows

- `workflows.definitions` - Workflow definitions to create
  - `name` - Workflow name
  - `trigger` - Trigger event (e.g., "missed_call", "appointment_scheduled")
  - `conditions` - Array of conditions to check
  - `actions` - Array of actions to execute
    - `type` - Action type (e.g., "send_sms", "send_email", "add_tag")
    - `template` - Template reference (optional)
    - `delay` - Delay in seconds
    - Additional action-specific fields

- `workflows.references` - References to existing workflow IDs (if importing)

### Automations

- `automations.definitions` - Automation definitions (drip campaigns, sequences)
  - `name` - Automation name
  - `type` - Type: "drip_campaign", "lead_nurture", "onboarding", etc.
  - `trigger` - Trigger event
  - `conditions` - Conditions to check
  - `steps` - Array of automation steps
    - `step` - Step number
    - `action` - Action to perform
    - `delay` - Delay in seconds
    - Additional action-specific fields

- `automations.references` - References to existing automation IDs (if importing)

### Calendars

- `calendars.additional` - Additional calendars to create beyond base calendars
  - `name` - Calendar name
  - `slug` - URL-friendly identifier
  - `description` - Description
  - `duration` - Duration in minutes
  - `slotInterval` - Interval between slots
  - `minNotice` - Minimum notice in hours
  - `bufferBefore` - Buffer before in minutes
  - `bufferAfter` - Buffer after in minutes
  - `timezoneMode` - "user" or "location"

### Pipelines

- `pipelines.definitions` - Pipeline definitions (Growth tier only)
  - `name` - Pipeline name
  - `stages` - Array of pipeline stages
    - `name` - Stage name
    - `order` - Stage order
    - `probability` - Win probability (0-100)

### Funnels

- `funnels.definitions` - Funnel definitions (Growth tier only)
  - `name` - Funnel name
  - `steps` - Array of funnel steps
    - `name` - Step name
    - `type` - Step type (e.g., "landing_page", "form", "appointment")
    - `order` - Step order

### Features

- `features` - Feature flags and limits
  - `unlimitedContacts` - Boolean
  - `unlimitedUsers` - Boolean
  - `advancedAutomations` - Boolean
  - `pipelines` - Boolean
  - `funnels` - Boolean
  - `websites` - Boolean
  - `reviewManagement` - Boolean
  - `socialPlanner` - Boolean
  - `affiliatePortal` - Boolean
  - `whitelabel` - Boolean
  - `campaignManagement` - Boolean
  - `monthlyCredits` - Number
  - `creditRolloverMonths` - Number
  - `oneOnOneDemo` - Boolean (Growth only)
  - `campaignAdManagement` - Boolean (Growth only)

## How Snapshots Are Applied

During provisioning (`ghl-provisioning/index.ts`):

1. Base assets are created first (tags, custom fields, calendars from existing code)
2. Snapshot JSON is loaded based on `planTier`
3. Additional assets from snapshot are created:
   - Additional tags
   - Additional custom fields
   - Workflow definitions
   - Automation definitions
   - Additional calendars
   - Pipelines (Growth only)
   - Funnels (Growth only)
4. Feature flags are stored in `ghl_config` or `trainer_profiles` for reference

## Updating Snapshots

To update a snapshot:

1. Edit the appropriate JSON file
2. Test provisioning with the updated snapshot
3. Verify assets are created correctly in GHL
4. Commit changes

## GHL API Endpoints Used

- Tags: `POST /v1/locations/{locationId}/tags`
- Custom Fields: `POST /v1/locations/{locationId}/customFields`
- Workflows: `POST /v1/workflows` (or workflow-specific endpoint)
- Automations: `POST /v1/automations` (or automation-specific endpoint)
- Calendars: `POST /v1/locations/{locationId}/calendars`
- Pipelines: `POST /v1/pipelines`
- Funnels: `POST /v1/funnels`

Note: Exact endpoint structure may vary. Refer to GHL API documentation for current endpoints.

