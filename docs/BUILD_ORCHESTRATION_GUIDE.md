# 🚀 TRAINU BUILD ORCHESTRATION GUIDE: Frontend + Backend + Research (Complete)

**Generated:** November 30, 2025  

**Status:** Ready for build execution  

**Deliverables:** 3 complete prompts + evidence pack + architecture docs

---

## 📚 WHAT YOU HAVE

### 1. **Lovable.dev UI Prompt** (`lovable_prompt_ui_redesign.md`)

**Purpose:** Design + build the next-gen TrainU interface  

**What it includes:**

- Home/Dashboard redesign (metrics + compliance chart)

- Queue refinements (AI insights + editable action lists)

- New Clients detail page (Programs + Data tabs with integration status)

- New Programs page (template management + AI customization)

- New Integrations page (sync status dashboard)

- Component specifications (Insight Card, Metric Card, Data Source Panel)

- Color system + Shadcn/UI patterns

**Your action:** Copy the **entire** Lovable prompt into Lovable Chat. It will auto-generate the UI components and pages.

**Timeline:** 2–3 weeks (assuming existing codebase)

---

### 2. **Cursor.dev Backend Prompt** (`cursor_prompt_backend_build.md`)

**Purpose:** Architecture + build Mindbody integration + AI insights engine  

**What it includes:**

- Full backend architecture diagram (integrations → insights → orchestration)

- Complete Mindbody OAuth flow (4 edge functions)

- Database schema (10 new tables for multi-source data, integrations, insights, actions)

- Insight generation engine (Gemini tool-calling + churn scoring)

- Agent workflow (editable actions + approval/execution)

- Metrics calculation engine

- Error handling + rate limiting strategy

- Testing templates + deployment checklist

**Your action:** Copy the **entire** Cursor prompt into Cursor Chat (or your IDE with Cursor extension). It will generate:

- Database migrations (SQL)

- Edge functions (TypeScript/Deno)

- Type definitions

- Error handling utilities

**Timeline:** 3–4 weeks (Phase 1 MVP)

---

### 3. **Evidence Pack** (`trainu_evidence_pack_nov2025.md`)

**Purpose:** Data-backed competitive analysis + ROI validation  

**What it includes:**

- Retention baselines (6–8%/mo in Chicago)

- Pricing/unit economics ($70–120/hr trainer rates, $79–149/mo software spend)

- Software satisfaction audit (TrueCoach, Trainerize, Exercise.com gaps)

- Exercise.com AI depth check (marketing > reality assessment)

- GHL ecosystem proof (integration constraints)

- Gamification impact research (20–35% retention lift possible)

- Marketplace sequencing (Phase 2 not MVP)

- **TrainU ROI recomputed:** 2,000–11,000% depending on tier; breakeven in hours/days

- Chicago market competitive landscape

**Your action:** Use this in investor pitches, sales calls, and internal strategy meetings. Reference specific numbers.

---

## 🔧 BUILD SEQUENCE (RECOMMENDED)

### Week 1–2: Foundation (Parallel Tracks)

**Frontend Track (Lovable):**

- [ ] Paste UI prompt into Lovable

- [ ] Review generated components

- [ ] Connect to existing GHL integration

- [ ] Set up Recharts for compliance chart

**Backend Track (Cursor):**

- [ ] Paste backend prompt into Cursor

- [ ] Generate database migrations

- [ ] Create Mindbody OAuth functions

- [ ] Set up Supabase schema

**Research Track:**

- [ ] Share evidence pack with stakeholders

- [ ] Identify first 5 beta trainers (Chicago)

- [ ] Prepare integration onboarding flow

---

### Week 3–4: Mindbody Integration MVP

**Backend:**

- [ ] Deploy `mindbody-oauth-init` + `oauth-callback`

- [ ] Deploy `mindbody-sync` function (test with sandbox)

- [ ] Deploy `mindbody-webhook` handler

- [ ] Verify data flow: Mindbody → DB → Frontend

**Frontend:**

- [ ] Build Integrations page (showing connection status)

- [ ] Test OAuth flow end-to-end

- [ ] Display sync status in dashboard

**QA:**

- [ ] End-to-end test with Mindbody sandbox

- [ ] Verify Realtime updates via webhook

- [ ] Load test with 20–30 mock clients

---

### Week 5–6: Insight Engine

**Backend:**

- [ ] Deploy `ai-agent` function (Gemini + tool-calling)

- [ ] Implement churn risk calculator

- [ ] Test with real client data

- [ ] Build `insight-actions-approve` function

**Frontend:**

- [ ] Build Insight Card component (editable actions)

- [ ] Implement Queue page with insights

- [ ] Test action editing workflow

**QA:**

- [ ] Validate Gemini responses

- [ ] Test action execution (GHL SMS sending)

- [ ] Verify audit trail logging

---

### Week 7–8: Polish + Beta Launch

**All Tracks:**

- [ ] Error handling + retry logic

- [ ] Performance optimization

- [ ] Security review (OAuth, encryption, RLS)

- [ ] Documentation + trainer onboarding flow

**Beta Launch:**

- [ ] Onboard 5 Chicago trainers

- [ ] Collect feedback on UX + insights quality

- [ ] Measure actual time saved + churn prevented

- [ ] Iterate on AI insights (refine Gemini prompts)

---

## 📊 VALIDATION METRICS (BETA PHASE)

### Primary KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Trainer adoption** | 5 trainers signed up | Closed beta users |
| **Time saved** | 3–4 hrs/week per trainer | Trainer interviews + usage logs |
| **Churn prevented** | 1+ client per trainer over 8 weeks | Mindbody attendance data |
| **Insight quality** | 70%+ trainer satisfaction | NPS survey |
| **System uptime** | 99.5% | Monitoring + error logs |

### Secondary KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Sync speed** | <5 min Mindbody → UI | Edge function duration |
| **AI latency** | <10 sec insight generation | API response time |
| **Error rate** | <1% failed syncs | Edge function logs |
| **Webhook delivery** | 99%+ real-time | Mindbody webhook audit |

---

## 💰 ROI SUMMARY (From Evidence Pack)

### TrainU Core ($79/mo, 20 clients)

- **Hours Saved:** $2,800/mo

- **Churn Prevention:** $432/mo (20% lift)

- **Total Benefit:** $3,232/mo

- **Cost:** $80.50/mo

- **ROI:** **3,900%** ✅

- **Breakeven:** <1 day

### TrainU Pro ($99/mo, 50 clients)

- **Hours Saved:** $7,000/mo

- **Churn Prevention:** $1,080/mo (20% lift)

- **Total Benefit:** $8,080/mo

- **Cost:** $102.75/mo

- **ROI:** **7,750%** ✅

- **Breakeven:** <1 day

### TrainU Elite ($149/mo, 100+ clients)

- **Hours Saved:** $14,000/mo

- **Churn Prevention:** $3,780/mo (35% lift)

- **Total Benefit:** $17,780/mo

- **Cost:** $156.50/mo

- **ROI:** **11,250%** ✅

- **Breakeven:** <1.6 days

**Marketing Message:** "TrainU pays for itself in less than 1 day by saving 4 hours/week on client reviews. Churn prevention is the bonus."

---

## 🎯 COMPETITIVE POSITIONING (From Evidence Pack)

### vs Exercise.com

- **Exercise.com:** "AI-powered assessments + recommendations"

- **Reality:** Rule-based template matching (not ML, not personalized)

- **TrainU:** Real Gemini-driven root-cause analysis + multi-source data

- **Edge:** TrainU is genuinely intelligent; Exercise.com is marketed AI

### vs Trainerize

- **Trainerize:** Habit tracking + compliance scoring

- **Gap:** Doesn't explain WHY compliance dropped; can't prevent churn

- **TrainU:** Analyzes root causes (sleep, stress, payment issues, etc.); recommends actions

- **Edge:** TrainU = churn prevention engine; Trainerize = engagement tracker

### vs Mindbody

- **Mindbody:** Studio management + CRM (industry standard)

- **Gap:** Blind to external training data (Trainerize, wearables, etc.); no AI insights

- **TrainU:** Integrates multi-source data; generates personalized retention actions

- **Edge:** TrainU extends Mindbody with retention intelligence

### Unique Positioning

**"TrainU is the retention intelligence layer for fitness trainers. While Exercise.com sells "AI" and Mindbody manages operations, TrainU prevents churn by aggregating client data from all platforms (Mindbody, Trainerize, wearables) and generating personalized, actionable insights via real ML."**

---

## 📋 ROLLOUT CHECKLIST

### Pre-Launch (Before Beta)

- [ ] Evidence pack shared with all stakeholders

- [ ] UI design reviewed + approved

- [ ] Backend architecture reviewed + approved

- [ ] Mindbody sandbox account provisioned

- [ ] Gemini API configured + quota set

- [ ] Beta trainer candidates identified (5+)

- [ ] NDA/terms for beta participants ready

- [ ] Monitoring/logging infrastructure ready

### Launch Week (Beta)

- [ ] Trainers complete onboarding call

- [ ] OAuth flow tested 1:1 with each trainer

- [ ] First Mindbody sync completed

- [ ] Insights generated and reviewed

- [ ] Trainer feedback collected

### Post-Launch (Weeks 2–8)

- [ ] Weekly check-ins with beta trainers

- [ ] Monitor system health (errors, latency)

- [ ] Collect metrics (time saved, churn prevented)

- [ ] Iterate on AI insights (Gemini prompts)

- [ ] Fix bugs discovered in beta

- [ ] Prepare for Phase 2 (Trainerize integration)

### Phase 2 Readiness (Week 9+)

- [ ] Finalize Phase 1 learnings

- [ ] Plan Trainerize adapter (reuse Mindbody pattern)

- [ ] Plan wearables integration (ROOK)

- [ ] Prepare launch roadmap for public beta

---

## 🗺️ INTEGRATION MAP (Multi-Platform Data Flow)

```
┌─────────────────┐
│    Trainers     │
└────────┬────────┘
         │
    ┌────┴────────────────────────────────┐
    │                                 │
┌───┴──────┐  ┌────────────┐  ┌──────┴──────┐
│  Mindbody │  │ GoHighLevel│  │ Trainerize │
│  (gym)    │  │   (CRM)    │  │  (programs)│
└────┬─────┘  └────────────┘  └──────┬──────┘
    │                                 │
    └─────────────────────────────────┘
                 │
         ┌───────┴────────┐
         │ TrainU Backend  │
         │  (Integrations) │
         └───────┬────────┘
                 │
         ┌───────┴──────────────┐
         │ Insight Engine     │
         │ (Gemini + Churn)   │
         └───────┬──────────────┘
                 │
         ┌───────┴──────────────┐
         │ Action Queue       │
         │ (Trainer-editable) │
         └───────┬──────────────┘
                 │
         ┌───────┴──────────────┐
         │ Execution          │
         │ (GHL SMS + Tags)   │
         └─────────────────────┘
```

---

## 📝 NEXT STEPS

1. **Share Evidence Pack** with investors/stakeholders

   - Emphasize 2,000–11,000% ROI

   - Highlight Exercise.com differentiation

   - Present Chicago market TAM (550–800 trainers)

2. **Kick Off Frontend Build** (Lovable)

   - Paste UI prompt today

   - Review components this week

   - Integrate with existing GHL by week 2

3. **Kick Off Backend Build** (Cursor)

   - Paste backend prompt today

   - Generate migrations + functions

   - Deploy to Supabase edge functions by end of week 1

4. **Identify Beta Trainers**

   - Reach out to 5+ Chicago trainers

   - Schedule onboarding calls for week 7

   - Prepare for go-live

5. **Prepare for Phase 2** (Trainerize Integration)

   - Plan Trainerize adapter using same pattern

   - Estimate dev effort (2–3 weeks, reusable code)

   - Prepare roadmap for public launch

---

## 📁 FILES TO REFERENCE

- **`lovable_prompt_ui_redesign.md`** → UI/UX specifications for Lovable

- **`cursor_prompt_backend_build.md`** → Backend architecture for Cursor

- **`trainu_evidence_pack_nov2025.md`** → Data + ROI for stakeholders

- **`trainu_integration_strategy.md`** (existing) → Integration roadmap (beyond MVP)

---

**You are ready to build. Go! 🚀**

