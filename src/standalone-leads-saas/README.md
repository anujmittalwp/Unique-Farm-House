# Multi-Tenant Standalone Leads SaaS Module

A 100% self-contained, enterprise-grade Leads Management CRM module built for Luxury Resorts, Villas, and Multi-Client SaaS platforms.

---

## 🌟 Architecture & Features

1. **Multi-Tenant Architecture**:
   - `saas_companies`: Each client/resort has its own tenant record, settings, and branding.
   - `saas_users`: Distinct roles (`owner`, `admin`, `manager`, `agent`).
   - `saas_leads`: Strictly isolated per `company_id`.
   - `saas_lead_activities`: Audit log of every phone call, WhatsApp chat, email, site visit, and status change.

2. **Database & Persistence**:
   - **Primary**: Supabase (PostgreSQL) with Row-Level Security (RLS) support.
   - **Zero-Config Sandbox Mode**: Automatically runs with full offline/localStorage persistence if Supabase credentials are not provided yet.
   - **In-App Configurator**: You can connect or change your live Supabase URL & Anon Key directly inside the app without rebuilding.

3. **Luxury Leads Dashboard UI**:
   - **KPI Metric Cards**: Total Pipeline, Hot & High Priority Leads, Today's Follow-ups (with pulse indicator), Overdue Follow-ups (with alert ping), Won Bookings & Revenue, Conversion Rate %.
   - **Dual Views**: 
     - **Table View**: 3-row compact luxury lead rows with inline editing, tags, direct phone/WhatsApp actions.
     - **Pipeline / Kanban View**: Interactive visual stages (`New`, `Contacted`, `Quotation Sent`, `Hot / Negotiation`, `Won`, `Lost`).
   - **Follow-up Reminders**: Schedule date, time, channel (Call, WhatsApp, Email, Site Visit), with overdue detection.
   - **Audit Timeline**: View chronological history of interactions with outcomes (`positive`, `neutral`, `negative`).
   - **CSV Export**: Filtered leads download in one click.

---

## 🚀 How to Copy This to Another Project

To use this module in any other React / Vite project:

1. Copy the entire folder `src/standalone-leads-saas` into your other project's `src/` directory.
2. Install the lightweight dependencies:
   ```bash
   npm install @supabase/supabase-js lucide-react papaparse
   npm install -D @types/papaparse
   ```
3. Set your Supabase environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Run the SQL schema in `schema.sql` inside your Supabase Project's SQL Editor:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click **SQL Editor** -> **New Query**
   - Paste the contents of `src/standalone-leads-saas/schema.sql` and run.
5. Import and mount the standalone component in your router:
   ```tsx
   import StandaloneSaaSLeadsApp from './standalone-leads-saas/StandaloneSaaSLeadsApp';

   <Route path="/saas-leads/*" element={<StandaloneSaaSLeadsApp />} />
   ```

---

## 📁 File Structure

```
src/standalone-leads-saas/
├── AuthContext.tsx                   # Multi-tenant state, role switching & company switcher
├── StandaloneSaaSLeadsApp.tsx        # Master dashboard application
├── dataService.ts                    # Supabase + local offline dual-mode data service
├── mockData.ts                       # Initial seed data for instant sandbox testing
├── schema.sql                        # Production PostgreSQL SQL schema for Supabase
├── supabaseClient.ts                 # Supabase client connector with runtime overrides
├── types.ts                          # Complete TypeScript interfaces
├── README.md                         # This guide
└── components/
    ├── SaaSAddLeadModal.tsx          # Capture new customer inquiry modal
    ├── SaaSFilterBar.tsx             # Multi-criteria filter & view switcher
    ├── SaaSFollowUpModal.tsx         # Schedule next follow-up with channel selector
    ├── SaaSHistoryModal.tsx          # Interaction history timeline & quick logger
    ├── SaaSMetricsHeader.tsx         # Top KPI metrics cards
    ├── SaaSPipelineView.tsx          # Visual Kanban pipeline stages
    ├── SaaSSupabaseSettingsModal.tsx # Supabase connection manager & SQL viewer
    ├── SaaSTableView.tsx             # Luxury table view with inline edits & bulk actions
    └── SaaSTeamModal.tsx             # Team members & tenant company management
```
