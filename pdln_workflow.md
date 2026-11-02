# BUILD REQUEST — INTERNAL PDLN PNJ SYSTEM

## ROLE

Act as a senior product engineer, system architect, UX designer, security engineer, and business-process analyst.

You are NOT simply building a form.

You are building an **internal PDLN (Perjalanan Dinas Luar Negeri) management system for Politeknik Negeri Jakarta (PNJ)** that will initially be used internally by KUI PNJ before the official PDLN process.

The system must be designed as a serious internal institutional application, not as a generic CRUD dashboard and not as a clone of Google Forms.

---

# 1. REFERENCE SYSTEM

The existing process/form that must be studied as the business-process reference is:

https://script.google.com/macros/u/3/s/AKfycbzG44MNH-JrztRyCu5RJGNGv8BCgLQU-IwrJcF6-MPwN-pzOzbWVCsOdrayHg0aUAny/exec

FIRST:

Try to access and inspect the reference application.

Analyze:

* every page
* every section
* every form field
* field labels
* field types
* required vs optional fields
* conditional questions
* upload requirements
* sequence of questions
* branching logic
* repeated questions
* confirmation steps
* submission flow
* generated documents
* status logic
* administrative information
* information that appears only after certain answers
* information that should NOT be visible to public users

Do NOT blindly copy the UI.

Instead:

> Understand the business process and rebuild it as a structured internal workflow.

If the reference application cannot be accessed from the development environment, do not invent its exact fields.

Instead, create the architecture so the reference fields can be mapped into the system later through a configurable form/workflow schema.

---

# 2. CORE PRODUCT CONCEPT

The system is:

> INTERNAL PDLN PNJ — Pre-Submission & Verification System

Purpose:

1. Student/dosen submits PDLN information internally.
2. User profile automatically supplies information already known by the institution.
3. User only fills information that is actually new or required.
4. The system prevents duplicate questions/data entry.
5. The system guides the user through the process conversationally.
6. KUI can review, correct, request revisions, verify documents, and prepare the submission.
7. Sensitive/internal PDLN documents and information must never become publicly accessible.
8. The system creates a clean internal record that can later be transferred into the official PDLN process.

This is NOT the official PDLN submission system.

It is an internal preparation, validation, and administration layer.

---

# 3. VERY IMPORTANT UX PRINCIPLE

DO NOT DESIGN THIS AS:

"User opens a giant form and fills 50 questions."

Instead:

PROFILE → EXISTING DATA → CONTEXT → ONLY MISSING DATA → DOCUMENTS → REVIEW → KUI VERIFICATION → READY FOR OFFICIAL PDLN

The user should feel:

> "The system already knows most of my information. I only need to complete what is missing."

---

# 4. NO REDUNDANT QUESTIONS

This is one of the most important requirements.

Implement a centralized user profile/data model.

Example:

USER PROFILE already contains:

* NIM / NIP
* full name
* email
* phone
* faculty/jurusan
* program study
* academic status
* employee/student status
* department
* institutional affiliation
* other verified institutional data

Therefore:

If a later PDLN form requires:

"Nama Lengkap"

DO NOT ask the user again.

Display:

Nama Lengkap
[already filled from profile]

with a small indicator:

✓ Diambil dari Profil

If the user needs to change it:

[Edit Profile]

Do not create a second independent copy of the same information.

---

# 5. SINGLE SOURCE OF TRUTH

Every repeated piece of information must have one canonical source.

Example:

User name → Profile

NIM → Profile

Program studi → Profile

Department → Profile

Email institutional → Profile

Phone → Profile

The PDLN application should reference profile data.

Do NOT duplicate the same value in multiple database tables unless there is a deliberate historical snapshot requirement.

For submitted applications, however, store a snapshot/version of the relevant profile data at submission time so historical records remain stable.

Example:

profile.name
↓
application.profile_snapshot.name

This prevents a later profile change from corrupting historical applications.

---

# 6. ROLE SYSTEM

Implement proper role-based access control.

Roles:

## A. MAHASISWA

Can:

* view own profile
* complete own profile
* create PDLN application
* continue incomplete application
* upload own documents
* interact with chatbot
* see application status
* respond to revision requests
* see only their own applications
* see their own documents
* see their own messages

Cannot:

* see other students
* see dosen data
* see KUI internal notes
* see administrative review
* see confidential documents belonging to others
* access database/API directly
* access internal SP documents unless explicitly authorized

---

## B. DOSEN

Can:

* view own profile
* update allowed profile fields
* create PDLN application
* upload required documents
* use chatbot
* view own application
* respond to revision requests
* track application status

Cannot:

* access other users' applications
* access KUI notes
* access admin-only documents
* modify workflow configuration

---

## C. KUI / ADMIN

KUI is the internal operator.

Can:

* view submitted applications
* search applications
* filter applications
* verify profiles
* verify documents
* request revision
* add internal notes
* communicate with applicant
* modify application status
* manage required documents
* manage workflow
* view audit logs
* manage users
* manage programs
* manage destination countries
* manage institutions
* export approved application data
* prepare official PDLN submission

KUI must have access to information that applicants must never see.

---

## D. SUPER ADMIN

Only if necessary.

Can:

* manage roles
* manage permissions
* manage system configuration
* manage workflow rules
* manage admin accounts
* inspect audit logs

Avoid creating unnecessary super-admin functionality.

---

# 7. PUBLIC ACCESS MUST BE MINIMAL

The system must NOT expose PDLN records publicly.

No public application list.

No public document URLs.

No public student profiles.

No public search.

No indexed application pages.

No sensitive information in HTML metadata.

No confidential documents in public storage.

Do not expose database IDs in predictable URLs.

Do not rely only on frontend hiding.

Authorization must be enforced server-side.

---

# 8. AUTHENTICATION

Implement authenticated accounts.

Preferred architecture:

Institutional account / controlled account.

The exact authentication provider can be chosen based on the current project architecture.

If Google Workspace authentication is practical:

Use institutional Google account authentication.

Otherwise provide secure email/password authentication with:

* hashed passwords
* secure sessions
* password reset
* account verification
* rate limiting
* logout
* session expiration

Never store plaintext passwords.

---

# 9. PROFILE-FIRST SYSTEM

After first login:

DO NOT immediately show the PDLN form.

Show:

## "Lengkapi Profil"

The system determines which data is already available.

Example:

PROFILE COMPLETENESS

Personal Information
✓ 100%

Academic Information
✓ 100%

Contact Information
✓ 100%

Emergency Contact
70%

Travel Information
0%

Documents
40%

Then:

"Profil kamu sudah 82% lengkap."

CTA:

[Lanjutkan]

---

# 10. PROFILE DATA SOURCES

The profile should distinguish:

### VERIFIED DATA

Data supplied by institutional/admin source.

Example:

NIM
Name
Program Study
Department
Institutional Email

Display:

✓ Terverifikasi Institusi

User should not freely modify verified fields.

---

### USER-MANAGED DATA

Data user can update.

Example:

Phone number
Personal email
Emergency contact
Passport information
etc.

Display:

"Data yang dapat kamu ubah"

---

### ADMIN-VERIFIED DATA

Data requiring KUI confirmation.

Example:

passport validity
official travel details
supporting documents
etc.

---

# 11. SMART FORM GENERATION

The PDLN form must be generated based on:

1. user role
2. profile data
3. application type
4. destination
5. travel purpose
6. program type
7. previous answers
8. document requirements

Do not show irrelevant fields.

Example:

If destination = South Korea

Only show fields relevant to that destination when applicable.

If travel purpose = Student Exchange

show relevant exchange fields.

If travel purpose = Conference

show conference-related fields.

If travel purpose = Research

show research-related fields.

If travel purpose = Training

show training-related fields.

The workflow must be rule-based.

---

# 12. CONDITIONAL LOGIC

Implement proper conditional questions.

Example:

Question:

"Apakah perjalanan ini merupakan bagian dari program kerja sama?"

If:

YES

→ show:

* partner institution
* cooperation/program name
* agreement/reference
* program period

If:

NO

→ hide those fields.

Another example:

"Apakah biaya perjalanan ditanggung oleh pihak eksternal?"

YES:

→ funding organization
→ funding type
→ amount if required
→ supporting document

NO:

→ hide external funding fields.

Never ask questions that do not apply.

---

# 13. CONVERSATIONAL FORM

Implement an internal chatbot/form assistant.

This is NOT a generic ChatGPT clone.

It is a structured workflow assistant.

Example:

BOT:

"Hai, data profil kamu sudah terisi sebagian.

Tujuan perjalananmu apa?"

[Student Exchange]
[Conference]
[Research]
[Training]
[Other]

User selects:

Student Exchange

BOT:

"Untuk program Student Exchange, saya menemukan data Program Studi dari profil kamu:

Teknik Informatika

Apakah data ini benar?"

[Ya, benar]
[Ubah profil]

Then continue.

---

# 14. CHATBOT RULE

The chatbot must NEVER invent institutional requirements.

The chatbot can only answer based on:

* configured workflow
* official internal knowledge
* application data
* profile data
* KUI-configured instructions
* uploaded documents where explicitly supported

If information is unavailable:

"I don't have enough information for this question. Please contact KUI."

Do not hallucinate policies.

---

# 15. CHATBOT + FORM HYBRID

Do not force every question into chat.

Use the right UI for each input.

Examples:

Simple choice:

Chat buttons.

Date:

Date picker.

Country:

Searchable dropdown.

Institution:

Searchable dropdown.

Long explanation:

Textarea.

Documents:

Upload component.

Multiple items:

Repeater component.

Sensitive information:

Dedicated secure field.

Therefore:

CHATBOT = guidance/orchestration

FORM COMPONENTS = actual data collection

---

# 16. BOT SHOULD UNDERSTAND PROGRESS

Example:

"Progress PDLN kamu: 64%"

Sections:

✓ Identitas
✓ Akademik
✓ Perjalanan
✓ Program
◌ Dokumen
◌ Review

Bot:

"Data perjalanan sudah lengkap. Sekarang tinggal 3 dokumen yang perlu diunggah."

---

# 17. DOCUMENT MANAGEMENT

Documents must be private.

Never expose:

/uploads/student123/passport.pdf

through a public URL.

Use protected document access.

When user requests document:

server verifies:

currentUser owns document

OR

currentUser is authorized KUI/admin.

Only then return the file.

Documents should include metadata:

* document type
* owner
* application ID
* upload date
* version
* status
* verified by
* verification date
* rejection reason

---

# 18. DOCUMENT STATUS

Every document can have:

UPLOADED

UNDER_REVIEW

VERIFIED

REVISION_REQUIRED

REJECTED

EXPIRED

NOT_REQUIRED

Example:

Passport
✓ Verified

Letter of Invitation
⚠ Revision Required

KUI note:

"Dokumen kurang jelas, silakan upload ulang."

---

# 19. APPLICATION STATUS

Use a clear state machine.

Suggested statuses:

DRAFT

PROFILE_INCOMPLETE

FORM_IN_PROGRESS

SUBMITTED

KUI_REVIEW

REVISION_REQUIRED

RESUBMITTED

DOCUMENT_VERIFICATION

KUI_APPROVED

READY_FOR_OFFICIAL_PDLN

OFFICIAL_PROCESS

COMPLETED

REJECTED

CANCELLED

Do not allow arbitrary status changes from frontend.

Use backend transitions.

---

# 20. KUI DASHBOARD

Design dashboard around workload, not decorative statistics.

Example:

## PDLN Internal

Today's overview:

12
Menunggu Review

7
Perlu Revisi

5
Verifikasi Dokumen

18
Siap Diproses

---

Applications table:

Applicant
Role
Destination
Purpose
Submission Date
Progress
Status
Last Updated
Action

Actions:

[Review]

---

# 21. KUI REVIEW PAGE

Split layout:

LEFT:

Applicant information

Application progress

Travel details

Program details

Documents

RIGHT:

Review panel

Status

Internal notes

Revision request

Verification

Communication

Timeline

Example:

IDENTITY
✓ Verified

TRAVEL
✓ Complete

DOCUMENTS
⚠ 2 documents require attention

REVIEW

[Approve]

[Request Revision]

[Add Internal Note]

---

# 22. INTERNAL NOTES

VERY IMPORTANT:

KUI internal notes must be completely invisible to applicants.

Example:

INTERNAL NOTE:

"Need confirmation from department before forwarding."

Applicant must never receive this note.

Separate:

PUBLIC/APPLICANT MESSAGE

and

INTERNAL KUI NOTE

at database and UI level.

---

# 23. COMMUNICATION SYSTEM

Create application-specific conversation.

Participants:

Applicant ↔ KUI

Messages have types:

USER_MESSAGE

KUI_MESSAGE

SYSTEM_MESSAGE

INTERNAL_NOTE

Only the first three are visible to applicant.

INTERNAL_NOTE is KUI-only.

---

# 24. REVISION FLOW

KUI clicks:

Request Revision

Then selects specific fields/documents.

Example:

☑ Passport

☑ Travel dates

☐ Destination

KUI writes:

"Passport scan perlu diperbarui karena bagian nomor paspor tidak terbaca."

Applicant sees:

"2 item perlu diperbaiki."

Applicant fixes only those items.

Do NOT force the applicant to fill the entire form again.

---

# 25. CHANGE TRACKING

Every important change should have an audit trail.

Example:

21 Sep 2026 — 09:31
Student submitted application.

21 Sep 2026 — 10:04
KUI requested passport revision.

21 Sep 2026 — 11:12
Student uploaded new passport.

21 Sep 2026 — 11:30
KUI verified passport.

Audit logs should include:

* actor
* action
* timestamp
* object
* previous state
* new state where appropriate

---

# 26. DATA MODEL

Create a normalized schema.

At minimum:

users

roles

permissions

profiles

applications

application_profile_snapshots

application_answers

workflow_definitions

workflow_steps

workflow_rules

documents

document_types

document_reviews

messages

internal_notes

notifications

audit_logs

programs

partner_institutions

countries

destinations

funding_sources

application_status_history

Do NOT create a giant table containing every possible field.

Use structured entities.

---

# 27. ANSWER STORAGE

Avoid hardcoding every question into the frontend.

Create a configurable question schema.

Example concept:

question_id
section
label
type
required
visibility_rule
validation_rule
data_source
profile_binding
options
help_text

This allows KUI to modify workflow requirements without rewriting the entire frontend.

---

# 28. PROFILE BINDING

Questions should support:

profile binding.

Example:

Question:

"Nama lengkap"

profile_binding:

profile.full_name

The UI should automatically populate it.

If profile data exists:

do not ask again.

If profile data is missing:

ask user to complete profile.

This is the central mechanism for eliminating redundancy.

---

# 29. APPLICATION SNAPSHOT

When submitting:

freeze relevant profile information into an application snapshot.

Example:

Profile:
Name = Ahmad

Application snapshot:
Name = Ahmad

Later profile:
Name = Ahmad F.

Old application remains:

Name = Ahmad

This is important for institutional records.

---

# 30. VALIDATION ENGINE

Validation must exist at backend level.

Examples:

Required fields

Date validity

Travel end date > start date

Passport expiry

File type

File size

Country selection

Duplicate application detection

Invalid combinations

Conditional requirements

Do not rely solely on HTML validation.

---

# 31. DUPLICATE APPLICATION DETECTION

Before creating an application:

check whether the user already has:

* active application
* same program
* same destination
* overlapping travel dates

If suspicious duplicate:

show warning.

Example:

"Kamu sudah memiliki pengajuan dengan tujuan Jepang pada periode yang sama."

[View Existing Application]

[Continue Anyway]

If business rules prohibit duplicate applications, prevent creation and explain why.

---

# 32. NOTIFICATION SYSTEM

Notify users when:

* application submitted
* KUI starts review
* revision requested
* document rejected
* document verified
* application approved
* application status changes
* KUI sends a message

Use in-app notifications first.

Email notifications can be added as secondary.

---

# 33. SECURITY REQUIREMENTS

Treat this as an internal institutional system.

Implement:

RBAC

server-side authorization

secure sessions

CSRF protection where applicable

XSS protection

input validation

file validation

file access authorization

rate limiting

audit logging

secure password hashing

security headers

no sensitive information in logs

no sensitive information in client-side environment variables

no service credentials in frontend

no public document storage

no public application API

no predictable authorization bypass

---

# 34. SP / CONFIDENTIAL DOCUMENT PROTECTION

Anything classified as:

SP

internal administrative document

KUI-only document

internal verification

administrative note

internal decision

must NEVER be publicly accessible.

Create visibility levels:

PUBLIC

APPLICANT

KUI

ADMIN

SUPER_ADMIN

Every document and sensitive record must have an access level.

Frontend hiding is NOT enough.

Backend must enforce it.

Also:

Do not put confidential document URLs in public HTML.

Do not put them into robots.txt as the primary protection.

Do not rely on obscured URLs.

Authorization is mandatory.

---

# 35. NO PUBLIC INDEXING

For the entire internal application:

* authentication required
* noindex
* no public sitemap
* no public application pages
* no public document URLs
* robots configuration
* security headers
* authenticated routes

If deployed publicly for testing, treat it as a private application.

---

# 36. UI STYLE

Do not make it look like:

* generic AI dashboard
* generic SaaS template
* random purple gradient
* excessive glassmorphism
* unnecessary cards
* giant statistics
* fake AI branding

Design it like a serious university internal system.

Visual direction:

clean

institutional

modern

quiet

professional

accessible

high information density without feeling cluttered.

Use PNJ identity subtly.

---

# 37. APPLICANT EXPERIENCE

Applicant homepage:

"Selamat datang, [Nama]"

PDLN Application

Current status:

"Menunggu kelengkapan dokumen"

Progress:

72%

Next action:

"Upload Surat Undangan"

CTA:

[Lanjutkan Pengajuan]

Below:

Application timeline.

---

# 38. CHAT ASSISTANT UI

Create a small persistent assistant.

Desktop:

right-side assistant panel.

Mobile:

bottom-sheet/chat interface.

Example:

"PDLN Assistant"

"Data kamu sudah 78% lengkap."

"Masih ada 2 hal yang perlu diselesaikan."

[Periksa sekarang]

The assistant should be context-aware of the current application.

---

# 39. BOT CONVERSATION EXAMPLE

BOT:

"Halo! Saya akan membantu menyiapkan pengajuan PDLN kamu."

"Sebagian data sudah diambil dari profil PNJ kamu."

"Tujuan perjalanan kamu?"

USER:

Japan

BOT:

"Baik. Saya menemukan program Student Exchange."

"Periode perjalanan?"

USER:

10 October – 25 October

BOT:

"Data profil kamu menunjukkan Program Studi Teknik Informatika."

"Data ini akan digunakan untuk pengajuan."

"✓ Tidak perlu diisi ulang."

Then:

"Untuk program ini, saya membutuhkan dokumen berikut:

✓ Passport
✓ Invitation Letter
○ Proof of Funding

Masih kurang 1 dokumen."

[Upload]

This should feel intelligent without actually requiring an LLM for every interaction.

---

# 40. AI / CHATBOT ARCHITECTURE

Do NOT make the core workflow dependent on AI.

The workflow engine must work without AI.

AI/chatbot is an assistant layer.

Architecture:

USER
↓
CHAT ASSISTANT
↓
WORKFLOW ENGINE
↓
PROFILE / APPLICATION DATA
↓
VALIDATION
↓
KUI REVIEW

The chatbot can explain and guide.

The workflow engine decides what is required.

Never let an LLM independently decide whether a user is officially eligible.

---

# 41. KUI CONFIGURATION

Create a configuration area where KUI can manage:

Program types

Countries

Partner universities

Travel purposes

Document requirements

Question requirements

Conditional rules

Application status

Notification templates

Revision reasons

FAQ / chatbot knowledge

This allows the system to evolve.

---

# 42. WORKFLOW BUILDER

If reasonable for the project, provide an internal workflow editor.

Example:

Step 1
Profile

↓

Step 2
Travel Information

↓

Step 3
Program Information

↓

Condition:
Student Exchange?

YES → Exchange details

NO → Continue

↓

Documents

↓

Review

↓

Submit

The workflow should be represented as data, not hardcoded UI logic.

---

# 43. DATABASE RELATIONSHIP PRINCIPLE

Avoid redundancy.

Bad:

application.name

application.nim

application.prodi

application.department

user.name

user.nim

user.prodi

user.department

unless there is an explicit historical snapshot.

Good:

user/profile = canonical current data

application_profile_snapshot = immutable submitted snapshot

application_answers = only application-specific answers

---

# 44. SEARCH

KUI search should support:

name

NIM

NIP

application ID

destination

country

program

status

date range

role

department

Do not expose these searches to normal users.

---

# 45. EXPORT

KUI should be able to export verified applications.

Formats:

CSV

Excel

PDF where needed

But exports must be permission-protected.

Record export events in audit logs.

---

# 46. APPLICATION ID

Generate human-readable application IDs.

Example:

PDLN-2026-000124

Do not use sequential IDs as the only authorization identifier.

Internally use secure IDs/UUIDs.

---

# 47. ERROR STATES

Design real error states.

Examples:

Session expired

Unauthorized

Document upload failed

File too large

Invalid file

Application no longer editable

Workflow configuration unavailable

Server error

Network error

Do not just show:

"Something went wrong."

Tell the user what they can do next.

---

# 48. EMPTY STATES

Examples:

No applications yet

No revision requests

No documents

No notifications

No messages

KUI:

"No applications require your attention."

---

# 49. RESPONSIVE

Must work properly on:

desktop

tablet

mobile

Applicants may use phones.

KUI may primarily use desktop.

Do not sacrifice mobile UX for the admin dashboard.

---

# 50. ACCESSIBILITY

Use:

proper labels

keyboard navigation

visible focus

sufficient contrast

semantic HTML

accessible dialogs

accessible file upload

clear validation errors

---

# 51. PERFORMANCE

Avoid unnecessary API requests.

Cache profile data appropriately.

Do not reload entire application after every field.

Use optimistic UI only where safe.

Upload documents with progress.

Use pagination for KUI application lists.

Use server-side filtering/searching for large datasets.

---

# 52. SECURITY TESTING

Before considering the system complete, test:

Student A attempting to access Student B application.

Student attempting KUI route.

Student attempting admin API.

Student attempting another user's document.

User modifying application ID in URL.

User modifying document ID.

User accessing internal notes endpoint.

User accessing confidential SP.

Unauthenticated access.

Expired session.

Role escalation.

File upload bypass.

Malicious file names.

Oversized uploads.

XSS payloads.

SQL/NoSQL injection depending on stack.

IDOR.

---

# 53. DEMO DATA

Create realistic dummy data.

Do NOT use real student personal information.

Example:

Andi Pratama
NIM: 20260001
Program Studi: Teknik Informatika
Destination: South Korea
Program: Student Exchange

Create several applications with different statuses.

---

# 54. SEED USERS

Create development accounts:

[student@example.test](mailto:student@example.test)

[dosen@example.test](mailto:dosen@example.test)

[kui@example.test](mailto:kui@example.test)

[admin@example.test](mailto:admin@example.test)

Clearly mark these as development accounts.

Do not hardcode production passwords.

---

# 55. AUDIT LOG

Important actions:

LOGIN

LOGOUT

CREATE_APPLICATION

UPDATE_PROFILE

SUBMIT_APPLICATION

UPLOAD_DOCUMENT

DELETE_DOCUMENT

REQUEST_REVISION

RESUBMIT

VERIFY_DOCUMENT

REJECT_DOCUMENT

APPROVE_APPLICATION

CHANGE_STATUS

SEND_MESSAGE

ADD_INTERNAL_NOTE

EXPORT_DATA

CHANGE_WORKFLOW

CHANGE_PERMISSION

---

# 56. IMPORTANT: DO NOT BUILD A FAKE BACKEND

Do not create a UI that only pretends to save data.

Implement real:

database persistence

authentication

authorization

file storage

workflow state

validation

audit trail

messages

notifications

If some infrastructure cannot be implemented in the current environment, clearly isolate it behind a service layer and document what is missing.

---

# 57. DEVELOPMENT STRATEGY

Before writing a large amount of code:

PHASE 1

Inspect current project.

Run:

* ls
* package manager inspection
* existing source inspection
* database inspection
* environment inspection
* routing inspection

Do not overwrite an existing project blindly.

---

PHASE 2

Create a written internal architecture:

/docs/architecture.md

Include:

system architecture

database model

roles

permissions

workflow

security model

document visibility

chatbot architecture

---

PHASE 3

Build database/schema.

---

PHASE 4

Build authentication and RBAC.

---

PHASE 5

Build profile system.

---

PHASE 6

Build application/workflow engine.

---

PHASE 7

Build chatbot assistant.

---

PHASE 8

Build document management.

---

PHASE 9

Build KUI dashboard.

---

PHASE 10

Build review/revision workflow.

---

PHASE 11

Security testing.

---

PHASE 12

UI polish.

---

# 58. DO NOT OVERENGINEER THE AI

The application must remain usable if the AI API is unavailable.

Fallback:

structured assistant.

Example:

"Data profil kamu belum lengkap."

"Lengkapi nomor telepon terlebih dahulu."

The chatbot should not become the only way to operate the system.

---

# 59. FINAL USER FLOW

## MAHASISWA / DOSEN

LOGIN

↓

PROFILE CHECK

↓

"Data kamu sudah terisi 76%"

↓

COMPLETE PROFILE

↓

START PDLN

↓

SYSTEM IDENTIFIES EXISTING DATA

↓

SHOW ONLY REQUIRED NEW INFORMATION

↓

CHAT ASSISTANT GUIDES USER

↓

CONDITIONAL QUESTIONS

↓

DOCUMENT UPLOAD

↓

AUTOMATIC VALIDATION

↓

REVIEW SUMMARY

↓

USER CONFIRMS

↓

SUBMIT

↓

KUI REVIEW

↓

IF REVISION:

USER RECEIVES SPECIFIC REVISION REQUEST

↓

FIX ONLY REQUESTED ITEMS

↓

RESUBMIT

↓

KUI VERIFICATION

↓

KUI APPROVED

↓

READY FOR OFFICIAL PDLN

---

# 60. KUI FLOW

LOGIN

↓

KUI DASHBOARD

↓

PENDING APPLICATIONS

↓

OPEN APPLICATION

↓

REVIEW PROFILE SNAPSHOT

↓

REVIEW APPLICATION ANSWERS

↓

REVIEW DOCUMENTS

↓

CHECK VALIDATION

↓

ADD INTERNAL NOTE IF NEEDED

↓

MESSAGE APPLICANT OR REQUEST REVISION

↓

VERIFY

↓

APPROVE

↓

READY FOR OFFICIAL PDLN

↓

EXPORT / PREPARE DATA

---

# 61. CRITICAL BUSINESS RULE

The system must clearly distinguish:

INTERNAL PREPARATION

vs

OFFICIAL PDLN PROCESS.

The application status:

READY_FOR_OFFICIAL_PDLN

means:

"Internal KUI verification is complete."

It must NOT imply:

"Official PDLN approval has been issued."

The system must never falsely represent an internal approval as an official institutional/government approval.

---

# 62. IMPORTANT CONFIDENTIALITY MODEL

Create explicit visibility levels for every sensitive object:

PUBLIC

AUTHENTICATED_USER

OWNER_ONLY

KUI_ONLY

ADMIN_ONLY

SUPER_ADMIN_ONLY

For example:

Applicant profile → OWNER + authorized KUI

Application → OWNER + KUI

Application documents → OWNER + KUI

Internal notes → KUI ONLY

SP / confidential administrative documents → KUI/authorized ADMIN ONLY

Audit logs → ADMIN/KUI depending on sensitivity

---

# 63. DESIGN THE SYSTEM AROUND "PROGRESSIVE DISCLOSURE"

Do not overwhelm the applicant.

Only show:

WHAT IS RELEVANT NOW.

Example:

Instead of showing 60 fields:

"Tell us about your trip."

Then dynamically reveal:

Destination

↓

Travel dates

↓

Purpose

↓

Program

↓

Funding

↓

Documents

Only reveal fields required by previous answers.

---

# 64. REVIEW SUMMARY BEFORE SUBMISSION

Before submit:

show:

## Ringkasan Pengajuan

Identitas
✓

Program
✓

Tujuan
✓

Perjalanan
✓

Pendanaan
✓

Dokumen
✓

Then:

"Pastikan informasi berikut benar sebelum dikirim ke KUI."

[Edit]

[Submit Pengajuan]

This is the final user confirmation.

---

# 65. DO NOT MAKE THE UI LOOK LIKE A GOOGLE FORM

The reference application is only a business-process reference.

The new application should feel like:

INSTITUTIONAL WORKFLOW APPLICATION

not:

ONLINE FORM.

Use:

progressive steps

profile integration

chat guidance

status timeline

document verification

KUI review

audit trail

role-based access.

---

# 66. DELIVERABLES

When implementation is complete, provide:

1. Working application

2. Database schema

3. Authentication

4. RBAC

5. Applicant dashboard

6. Dosen dashboard

7. KUI dashboard

8. Profile system

9. Smart PDLN form

10. Conditional workflow

11. Chat assistant

12. Document management

13. Revision system

14. Notification system

15. Audit log

16. Security controls

17. Seed/demo data

18. Architecture documentation

19. Setup instructions

20. Deployment instructions

---

# 67. BEFORE CODING

First produce:

## A. Existing system analysis

What the reference system appears to do.

## B. New system workflow

Detailed flow from login → profile → application → KUI.

## C. Role permission matrix

Student vs Dosen vs KUI vs Admin.

## D. Data model

Entities and relationships.

## E. Question dependency map

Which question depends on which answer.

## F. Redundancy elimination map

For every form field:

SOURCE:
Profile / Application / New Input / KUI

## G. Security model

What each role can access.

## H. Document visibility model

Who can access every document category.

## I. Chatbot architecture

What the bot can and cannot answer.

Only after those are defined:

START IMPLEMENTATION.

---

# 68. QUALITY BAR

Do not stop at:

"the page looks good."

The system is successful only when:

A student can login,

the system already knows their institutional information,

the student does not repeatedly enter the same information,

irrelevant questions disappear,

the chatbot guides the process,

documents remain private,

KUI can review everything required,

KUI can request specific revisions,

students only see information they are authorized to see,

internal SP/admin information never leaks,

and the resulting application can be prepared for the official PDLN process.

Build this as if it will eventually become the internal production system of KUI PNJ, while keeping the current implementation clearly labeled as an INTERNAL / PRE-SUBMISSION system.
# BUILD REQUEST — INTERNAL PDLN PNJ SYSTEM

## ROLE

Act as a senior product engineer, system architect, UX designer, security engineer, and business-process analyst.

You are NOT simply building a form.

You are building an **internal PDLN (Perjalanan Dinas Luar Negeri) management system for Politeknik Negeri Jakarta (PNJ)** that will initially be used internally by KUI PNJ before the official PDLN process.

The system must be designed as a serious internal institutional application, not as a generic CRUD dashboard and not as a clone of Google Forms.

---

# 1. REFERENCE SYSTEM

The existing process/form that must be studied as the business-process reference is:

https://script.google.com/macros/u/3/s/AKfycbzG44MNH-JrztRyCu5RJGNGv8BCgLQU-IwrJcF6-MPwN-pzOzbWVCsOdrayHg0aUAny/exec

FIRST:

Try to access and inspect the reference application.

Analyze:

* every page
* every section
* every form field
* field labels
* field types
* required vs optional fields
* conditional questions
* upload requirements
* sequence of questions
* branching logic
* repeated questions
* confirmation steps
* submission flow
* generated documents
* status logic
* administrative information
* information that appears only after certain answers
* information that should NOT be visible to public users

Do NOT blindly copy the UI.

Instead:

> Understand the business process and rebuild it as a structured internal workflow.

If the reference application cannot be accessed from the development environment, do not invent its exact fields.

Instead, create the architecture so the reference fields can be mapped into the system later through a configurable form/workflow schema.

---

# 2. CORE PRODUCT CONCEPT

The system is:

> INTERNAL PDLN PNJ — Pre-Submission & Verification System

Purpose:

1. Student/dosen submits PDLN information internally.
2. User profile automatically supplies information already known by the institution.
3. User only fills information that is actually new or required.
4. The system prevents duplicate questions/data entry.
5. The system guides the user through the process conversationally.
6. KUI can review, correct, request revisions, verify documents, and prepare the submission.
7. Sensitive/internal PDLN documents and information must never become publicly accessible.
8. The system creates a clean internal record that can later be transferred into the official PDLN process.

This is NOT the official PDLN submission system.

It is an internal preparation, validation, and administration layer.

---

# 3. VERY IMPORTANT UX PRINCIPLE

DO NOT DESIGN THIS AS:

"User opens a giant form and fills 50 questions."

Instead:

PROFILE → EXISTING DATA → CONTEXT → ONLY MISSING DATA → DOCUMENTS → REVIEW → KUI VERIFICATION → READY FOR OFFICIAL PDLN

The user should feel:

> "The system already knows most of my information. I only need to complete what is missing."

---

# 4. NO REDUNDANT QUESTIONS

This is one of the most important requirements.

Implement a centralized user profile/data model.

Example:

USER PROFILE already contains:

* NIM / NIP
* full name
* email
* phone
* faculty/jurusan
* program study
* academic status
* employee/student status
* department
* institutional affiliation
* other verified institutional data

Therefore:

If a later PDLN form requires:

"Nama Lengkap"

DO NOT ask the user again.

Display:

Nama Lengkap
[already filled from profile]

with a small indicator:

✓ Diambil dari Profil

If the user needs to change it:

[Edit Profile]

Do not create a second independent copy of the same information.

---

# 5. SINGLE SOURCE OF TRUTH

Every repeated piece of information must have one canonical source.

Example:

User name → Profile

NIM → Profile

Program studi → Profile

Department → Profile

Email institutional → Profile

Phone → Profile

The PDLN application should reference profile data.

Do NOT duplicate the same value in multiple database tables unless there is a deliberate historical snapshot requirement.

For submitted applications, however, store a snapshot/version of the relevant profile data at submission time so historical records remain stable.

Example:

profile.name
↓
application.profile_snapshot.name

This prevents a later profile change from corrupting historical applications.

---

# 6. ROLE SYSTEM

Implement proper role-based access control.

Roles:

## A. MAHASISWA

Can:

* view own profile
* complete own profile
* create PDLN application
* continue incomplete application
* upload own documents
* interact with chatbot
* see application status
* respond to revision requests
* see only their own applications
* see their own documents
* see their own messages

Cannot:

* see other students
* see dosen data
* see KUI internal notes
* see administrative review
* see confidential documents belonging to others
* access database/API directly
* access internal SP documents unless explicitly authorized

---

## B. DOSEN

Can:

* view own profile
* update allowed profile fields
* create PDLN application
* upload required documents
* use chatbot
* view own application
* respond to revision requests
* track application status

Cannot:

* access other users' applications
* access KUI notes
* access admin-only documents
* modify workflow configuration

---

## C. KUI / ADMIN

KUI is the internal operator.

Can:

* view submitted applications
* search applications
* filter applications
* verify profiles
* verify documents
* request revision
* add internal notes
* communicate with applicant
* modify application status
* manage required documents
* manage workflow
* view audit logs
* manage users
* manage programs
* manage destination countries
* manage institutions
* export approved application data
* prepare official PDLN submission

KUI must have access to information that applicants must never see.

---

## D. SUPER ADMIN

Only if necessary.

Can:

* manage roles
* manage permissions
* manage system configuration
* manage workflow rules
* manage admin accounts
* inspect audit logs

Avoid creating unnecessary super-admin functionality.

---

# 7. PUBLIC ACCESS MUST BE MINIMAL

The system must NOT expose PDLN records publicly.

No public application list.

No public document URLs.

No public student profiles.

No public search.

No indexed application pages.

No sensitive information in HTML metadata.

No confidential documents in public storage.

Do not expose database IDs in predictable URLs.

Do not rely only on frontend hiding.

Authorization must be enforced server-side.

---

# 8. AUTHENTICATION

Implement authenticated accounts.

Preferred architecture:

Institutional account / controlled account.

The exact authentication provider can be chosen based on the current project architecture.

If Google Workspace authentication is practical:

Use institutional Google account authentication.

Otherwise provide secure email/password authentication with:

* hashed passwords
* secure sessions
* password reset
* account verification
* rate limiting
* logout
* session expiration

Never store plaintext passwords.

---

# 9. PROFILE-FIRST SYSTEM

After first login:

DO NOT immediately show the PDLN form.

Show:

## "Lengkapi Profil"

The system determines which data is already available.

Example:

PROFILE COMPLETENESS

Personal Information
✓ 100%

Academic Information
✓ 100%

Contact Information
✓ 100%

Emergency Contact
70%

Travel Information
0%

Documents
40%

Then:

"Profil kamu sudah 82% lengkap."

CTA:

[Lanjutkan]

---

# 10. PROFILE DATA SOURCES

The profile should distinguish:

### VERIFIED DATA

Data supplied by institutional/admin source.

Example:

NIM
Name
Program Study
Department
Institutional Email

Display:

✓ Terverifikasi Institusi

User should not freely modify verified fields.

---

### USER-MANAGED DATA

Data user can update.

Example:

Phone number
Personal email
Emergency contact
Passport information
etc.

Display:

"Data yang dapat kamu ubah"

---

### ADMIN-VERIFIED DATA

Data requiring KUI confirmation.

Example:

passport validity
official travel details
supporting documents
etc.

---

# 11. SMART FORM GENERATION

The PDLN form must be generated based on:

1. user role
2. profile data
3. application type
4. destination
5. travel purpose
6. program type
7. previous answers
8. document requirements

Do not show irrelevant fields.

Example:

If destination = South Korea

Only show fields relevant to that destination when applicable.

If travel purpose = Student Exchange

show relevant exchange fields.

If travel purpose = Conference

show conference-related fields.

If travel purpose = Research

show research-related fields.

If travel purpose = Training

show training-related fields.

The workflow must be rule-based.

---

# 12. CONDITIONAL LOGIC

Implement proper conditional questions.

Example:

Question:

"Apakah perjalanan ini merupakan bagian dari program kerja sama?"

If:

YES

→ show:

* partner institution
* cooperation/program name
* agreement/reference
* program period

If:

NO

→ hide those fields.

Another example:

"Apakah biaya perjalanan ditanggung oleh pihak eksternal?"

YES:

→ funding organization
→ funding type
→ amount if required
→ supporting document

NO:

→ hide external funding fields.

Never ask questions that do not apply.

---

# 13. CONVERSATIONAL FORM

Implement an internal chatbot/form assistant.

This is NOT a generic ChatGPT clone.

It is a structured workflow assistant.

Example:

BOT:

"Hai, data profil kamu sudah terisi sebagian.

Tujuan perjalananmu apa?"

[Student Exchange]
[Conference]
[Research]
[Training]
[Other]

User selects:

Student Exchange

BOT:

"Untuk program Student Exchange, saya menemukan data Program Studi dari profil kamu:

Teknik Informatika

Apakah data ini benar?"

[Ya, benar]
[Ubah profil]

Then continue.

---

# 14. CHATBOT RULE

The chatbot must NEVER invent institutional requirements.

The chatbot can only answer based on:

* configured workflow
* official internal knowledge
* application data
* profile data
* KUI-configured instructions
* uploaded documents where explicitly supported

If information is unavailable:

"I don't have enough information for this question. Please contact KUI."

Do not hallucinate policies.

---

# 15. CHATBOT + FORM HYBRID

Do not force every question into chat.

Use the right UI for each input.

Examples:

Simple choice:

Chat buttons.

Date:

Date picker.

Country:

Searchable dropdown.

Institution:

Searchable dropdown.

Long explanation:

Textarea.

Documents:

Upload component.

Multiple items:

Repeater component.

Sensitive information:

Dedicated secure field.

Therefore:

CHATBOT = guidance/orchestration

FORM COMPONENTS = actual data collection

---

# 16. BOT SHOULD UNDERSTAND PROGRESS

Example:

"Progress PDLN kamu: 64%"

Sections:

✓ Identitas
✓ Akademik
✓ Perjalanan
✓ Program
◌ Dokumen
◌ Review

Bot:

"Data perjalanan sudah lengkap. Sekarang tinggal 3 dokumen yang perlu diunggah."

---

# 17. DOCUMENT MANAGEMENT

Documents must be private.

Never expose:

/uploads/student123/passport.pdf

through a public URL.

Use protected document access.

When user requests document:

server verifies:

currentUser owns document

OR

currentUser is authorized KUI/admin.

Only then return the file.

Documents should include metadata:

* document type
* owner
* application ID
* upload date
* version
* status
* verified by
* verification date
* rejection reason

---

# 18. DOCUMENT STATUS

Every document can have:

UPLOADED

UNDER_REVIEW

VERIFIED

REVISION_REQUIRED

REJECTED

EXPIRED

NOT_REQUIRED

Example:

Passport
✓ Verified

Letter of Invitation
⚠ Revision Required

KUI note:

"Dokumen kurang jelas, silakan upload ulang."

---

# 19. APPLICATION STATUS

Use a clear state machine.

Suggested statuses:

DRAFT

PROFILE_INCOMPLETE

FORM_IN_PROGRESS

SUBMITTED

KUI_REVIEW

REVISION_REQUIRED

RESUBMITTED

DOCUMENT_VERIFICATION

KUI_APPROVED

READY_FOR_OFFICIAL_PDLN

OFFICIAL_PROCESS

COMPLETED

REJECTED

CANCELLED

Do not allow arbitrary status changes from frontend.

Use backend transitions.

---

# 20. KUI DASHBOARD

Design dashboard around workload, not decorative statistics.

Example:

## PDLN Internal

Today's overview:

12
Menunggu Review

7
Perlu Revisi

5
Verifikasi Dokumen

18
Siap Diproses

---

Applications table:

Applicant
Role
Destination
Purpose
Submission Date
Progress
Status
Last Updated
Action

Actions:

[Review]

---

# 21. KUI REVIEW PAGE

Split layout:

LEFT:

Applicant information

Application progress

Travel details

Program details

Documents

RIGHT:

Review panel

Status

Internal notes

Revision request

Verification

Communication

Timeline

Example:

IDENTITY
✓ Verified

TRAVEL
✓ Complete

DOCUMENTS
⚠ 2 documents require attention

REVIEW

[Approve]

[Request Revision]

[Add Internal Note]

---

# 22. INTERNAL NOTES

VERY IMPORTANT:

KUI internal notes must be completely invisible to applicants.

Example:

INTERNAL NOTE:

"Need confirmation from department before forwarding."

Applicant must never receive this note.

Separate:

PUBLIC/APPLICANT MESSAGE

and

INTERNAL KUI NOTE

at database and UI level.

---

# 23. COMMUNICATION SYSTEM

Create application-specific conversation.

Participants:

Applicant ↔ KUI

Messages have types:

USER_MESSAGE

KUI_MESSAGE

SYSTEM_MESSAGE

INTERNAL_NOTE

Only the first three are visible to applicant.

INTERNAL_NOTE is KUI-only.

---

# 24. REVISION FLOW

KUI clicks:

Request Revision

Then selects specific fields/documents.

Example:

☑ Passport

☑ Travel dates

☐ Destination

KUI writes:

"Passport scan perlu diperbarui karena bagian nomor paspor tidak terbaca."

Applicant sees:

"2 item perlu diperbaiki."

Applicant fixes only those items.

Do NOT force the applicant to fill the entire form again.

---

# 25. CHANGE TRACKING

Every important change should have an audit trail.

Example:

21 Sep 2026 — 09:31
Student submitted application.

21 Sep 2026 — 10:04
KUI requested passport revision.

21 Sep 2026 — 11:12
Student uploaded new passport.

21 Sep 2026 — 11:30
KUI verified passport.

Audit logs should include:

* actor
* action
* timestamp
* object
* previous state
* new state where appropriate

---

# 26. DATA MODEL

Create a normalized schema.

At minimum:

users

roles

permissions

profiles

applications

application_profile_snapshots

application_answers

workflow_definitions

workflow_steps

workflow_rules

documents

document_types

document_reviews

messages

internal_notes

notifications

audit_logs

programs

partner_institutions

countries

destinations

funding_sources

application_status_history

Do NOT create a giant table containing every possible field.

Use structured entities.

---

# 27. ANSWER STORAGE

Avoid hardcoding every question into the frontend.

Create a configurable question schema.

Example concept:

question_id
section
label
type
required
visibility_rule
validation_rule
data_source
profile_binding
options
help_text

This allows KUI to modify workflow requirements without rewriting the entire frontend.

---

# 28. PROFILE BINDING

Questions should support:

profile binding.

Example:

Question:

"Nama lengkap"

profile_binding:

profile.full_name

The UI should automatically populate it.

If profile data exists:

do not ask again.

If profile data is missing:

ask user to complete profile.

This is the central mechanism for eliminating redundancy.

---

# 29. APPLICATION SNAPSHOT

When submitting:

freeze relevant profile information into an application snapshot.

Example:

Profile:
Name = Ahmad

Application snapshot:
Name = Ahmad

Later profile:
Name = Ahmad F.

Old application remains:

Name = Ahmad

This is important for institutional records.

---

# 30. VALIDATION ENGINE

Validation must exist at backend level.

Examples:

Required fields

Date validity

Travel end date > start date

Passport expiry

File type

File size

Country selection

Duplicate application detection

Invalid combinations

Conditional requirements

Do not rely solely on HTML validation.

---

# 31. DUPLICATE APPLICATION DETECTION

Before creating an application:

check whether the user already has:

* active application
* same program
* same destination
* overlapping travel dates

If suspicious duplicate:

show warning.

Example:

"Kamu sudah memiliki pengajuan dengan tujuan Jepang pada periode yang sama."

[View Existing Application]

[Continue Anyway]

If business rules prohibit duplicate applications, prevent creation and explain why.

---

# 32. NOTIFICATION SYSTEM

Notify users when:

* application submitted
* KUI starts review
* revision requested
* document rejected
* document verified
* application approved
* application status changes
* KUI sends a message

Use in-app notifications first.

Email notifications can be added as secondary.

---

# 33. SECURITY REQUIREMENTS

Treat this as an internal institutional system.

Implement:

RBAC

server-side authorization

secure sessions

CSRF protection where applicable

XSS protection

input validation

file validation

file access authorization

rate limiting

audit logging

secure password hashing

security headers

no sensitive information in logs

no sensitive information in client-side environment variables

no service credentials in frontend

no public document storage

no public application API

no predictable authorization bypass

---

# 34. SP / CONFIDENTIAL DOCUMENT PROTECTION

Anything classified as:

SP

internal administrative document

KUI-only document

internal verification

administrative note

internal decision

must NEVER be publicly accessible.

Create visibility levels:

PUBLIC

APPLICANT

KUI

ADMIN

SUPER_ADMIN

Every document and sensitive record must have an access level.

Frontend hiding is NOT enough.

Backend must enforce it.

Also:

Do not put confidential document URLs in public HTML.

Do not put them into robots.txt as the primary protection.

Do not rely on obscured URLs.

Authorization is mandatory.

---

# 35. NO PUBLIC INDEXING

For the entire internal application:

* authentication required
* noindex
* no public sitemap
* no public application pages
* no public document URLs
* robots configuration
* security headers
* authenticated routes

If deployed publicly for testing, treat it as a private application.

---

# 36. UI STYLE

Do not make it look like:

* generic AI dashboard
* generic SaaS template
* random purple gradient
* excessive glassmorphism
* unnecessary cards
* giant statistics
* fake AI branding

Design it like a serious university internal system.

Visual direction:

clean

institutional

modern

quiet

professional

accessible

high information density without feeling cluttered.

Use PNJ identity subtly.

---

# 37. APPLICANT EXPERIENCE

Applicant homepage:

"Selamat datang, [Nama]"

PDLN Application

Current status:

"Menunggu kelengkapan dokumen"

Progress:

72%

Next action:

"Upload Surat Undangan"

CTA:

[Lanjutkan Pengajuan]

Below:

Application timeline.

---

# 38. CHAT ASSISTANT UI

Create a small persistent assistant.

Desktop:

right-side assistant panel.

Mobile:

bottom-sheet/chat interface.

Example:

"PDLN Assistant"

"Data kamu sudah 78% lengkap."

"Masih ada 2 hal yang perlu diselesaikan."

[Periksa sekarang]

The assistant should be context-aware of the current application.

---

# 39. BOT CONVERSATION EXAMPLE

BOT:

"Halo! Saya akan membantu menyiapkan pengajuan PDLN kamu."

"Sebagian data sudah diambil dari profil PNJ kamu."

"Tujuan perjalanan kamu?"

USER:

Japan

BOT:

"Baik. Saya menemukan program Student Exchange."

"Periode perjalanan?"

USER:

10 October – 25 October

BOT:

"Data profil kamu menunjukkan Program Studi Teknik Informatika."

"Data ini akan digunakan untuk pengajuan."

"✓ Tidak perlu diisi ulang."

Then:

"Untuk program ini, saya membutuhkan dokumen berikut:

✓ Passport
✓ Invitation Letter
○ Proof of Funding

Masih kurang 1 dokumen."

[Upload]

This should feel intelligent without actually requiring an LLM for every interaction.

---

# 40. AI / CHATBOT ARCHITECTURE

Do NOT make the core workflow dependent on AI.

The workflow engine must work without AI.

AI/chatbot is an assistant layer.

Architecture:

USER
↓
CHAT ASSISTANT
↓
WORKFLOW ENGINE
↓
PROFILE / APPLICATION DATA
↓
VALIDATION
↓
KUI REVIEW

The chatbot can explain and guide.

The workflow engine decides what is required.

Never let an LLM independently decide whether a user is officially eligible.

---

# 41. KUI CONFIGURATION

Create a configuration area where KUI can manage:

Program types

Countries

Partner universities

Travel purposes

Document requirements

Question requirements

Conditional rules

Application status

Notification templates

Revision reasons

FAQ / chatbot knowledge

This allows the system to evolve.

---

# 42. WORKFLOW BUILDER

If reasonable for the project, provide an internal workflow editor.

Example:

Step 1
Profile

↓

Step 2
Travel Information

↓

Step 3
Program Information

↓

Condition:
Student Exchange?

YES → Exchange details

NO → Continue

↓

Documents

↓

Review

↓

Submit

The workflow should be represented as data, not hardcoded UI logic.

---

# 43. DATABASE RELATIONSHIP PRINCIPLE

Avoid redundancy.

Bad:

application.name

application.nim

application.prodi

application.department

user.name

user.nim

user.prodi

user.department

unless there is an explicit historical snapshot.

Good:

user/profile = canonical current data

application_profile_snapshot = immutable submitted snapshot

application_answers = only application-specific answers

---

# 44. SEARCH

KUI search should support:

name

NIM

NIP

application ID

destination

country

program

status

date range

role

department

Do not expose these searches to normal users.

---

# 45. EXPORT

KUI should be able to export verified applications.

Formats:

CSV

Excel

PDF where needed

But exports must be permission-protected.

Record export events in audit logs.

---

# 46. APPLICATION ID

Generate human-readable application IDs.

Example:

PDLN-2026-000124

Do not use sequential IDs as the only authorization identifier.

Internally use secure IDs/UUIDs.

---

# 47. ERROR STATES

Design real error states.

Examples:

Session expired

Unauthorized

Document upload failed

File too large

Invalid file

Application no longer editable

Workflow configuration unavailable

Server error

Network error

Do not just show:

"Something went wrong."

Tell the user what they can do next.

---

# 48. EMPTY STATES

Examples:

No applications yet

No revision requests

No documents

No notifications

No messages

KUI:

"No applications require your attention."

---

# 49. RESPONSIVE

Must work properly on:

desktop

tablet

mobile

Applicants may use phones.

KUI may primarily use desktop.

Do not sacrifice mobile UX for the admin dashboard.

---

# 50. ACCESSIBILITY

Use:

proper labels

keyboard navigation

visible focus

sufficient contrast

semantic HTML

accessible dialogs

accessible file upload

clear validation errors

---

# 51. PERFORMANCE

Avoid unnecessary API requests.

Cache profile data appropriately.

Do not reload entire application after every field.

Use optimistic UI only where safe.

Upload documents with progress.

Use pagination for KUI application lists.

Use server-side filtering/searching for large datasets.

---

# 52. SECURITY TESTING

Before considering the system complete, test:

Student A attempting to access Student B application.

Student attempting KUI route.

Student attempting admin API.

Student attempting another user's document.

User modifying application ID in URL.

User modifying document ID.

User accessing internal notes endpoint.

User accessing confidential SP.

Unauthenticated access.

Expired session.

Role escalation.

File upload bypass.

Malicious file names.

Oversized uploads.

XSS payloads.

SQL/NoSQL injection depending on stack.

IDOR.

---

# 53. DEMO DATA

Create realistic dummy data.

Do NOT use real student personal information.

Example:

Andi Pratama
NIM: 20260001
Program Studi: Teknik Informatika
Destination: South Korea
Program: Student Exchange

Create several applications with different statuses.

---

# 54. SEED USERS

Create development accounts:

[student@example.test](mailto:student@example.test)

[dosen@example.test](mailto:dosen@example.test)

[kui@example.test](mailto:kui@example.test)

[admin@example.test](mailto:admin@example.test)

Clearly mark these as development accounts.

Do not hardcode production passwords.

---

# 55. AUDIT LOG

Important actions:

LOGIN

LOGOUT

CREATE_APPLICATION

UPDATE_PROFILE

SUBMIT_APPLICATION

UPLOAD_DOCUMENT

DELETE_DOCUMENT

REQUEST_REVISION

RESUBMIT

VERIFY_DOCUMENT

REJECT_DOCUMENT

APPROVE_APPLICATION

CHANGE_STATUS

SEND_MESSAGE

ADD_INTERNAL_NOTE

EXPORT_DATA

CHANGE_WORKFLOW

CHANGE_PERMISSION

---

# 56. IMPORTANT: DO NOT BUILD A FAKE BACKEND

Do not create a UI that only pretends to save data.

Implement real:

database persistence

authentication

authorization

file storage

workflow state

validation

audit trail

messages

notifications

If some infrastructure cannot be implemented in the current environment, clearly isolate it behind a service layer and document what is missing.

---

# 57. DEVELOPMENT STRATEGY

Before writing a large amount of code:

PHASE 1

Inspect current project.

Run:

* ls
* package manager inspection
* existing source inspection
* database inspection
* environment inspection
* routing inspection

Do not overwrite an existing project blindly.

---

PHASE 2

Create a written internal architecture:

/docs/architecture.md

Include:

system architecture

database model

roles

permissions

workflow

security model

document visibility

chatbot architecture

---

PHASE 3

Build database/schema.

---

PHASE 4

Build authentication and RBAC.

---

PHASE 5

Build profile system.

---

PHASE 6

Build application/workflow engine.

---

PHASE 7

Build chatbot assistant.

---

PHASE 8

Build document management.

---

PHASE 9

Build KUI dashboard.

---

PHASE 10

Build review/revision workflow.

---

PHASE 11

Security testing.

---

PHASE 12

UI polish.

---

# 58. DO NOT OVERENGINEER THE AI

The application must remain usable if the AI API is unavailable.

Fallback:

structured assistant.

Example:

"Data profil kamu belum lengkap."

"Lengkapi nomor telepon terlebih dahulu."

The chatbot should not become the only way to operate the system.

---

# 59. FINAL USER FLOW

## MAHASISWA / DOSEN

LOGIN

↓

PROFILE CHECK

↓

"Data kamu sudah terisi 76%"

↓

COMPLETE PROFILE

↓

START PDLN

↓

SYSTEM IDENTIFIES EXISTING DATA

↓

SHOW ONLY REQUIRED NEW INFORMATION

↓

CHAT ASSISTANT GUIDES USER

↓

CONDITIONAL QUESTIONS

↓

DOCUMENT UPLOAD

↓

AUTOMATIC VALIDATION

↓

REVIEW SUMMARY

↓

USER CONFIRMS

↓

SUBMIT

↓

KUI REVIEW

↓

IF REVISION:

USER RECEIVES SPECIFIC REVISION REQUEST

↓

FIX ONLY REQUESTED ITEMS

↓

RESUBMIT

↓

KUI VERIFICATION

↓

KUI APPROVED

↓

READY FOR OFFICIAL PDLN

---

# 60. KUI FLOW

LOGIN

↓

KUI DASHBOARD

↓

PENDING APPLICATIONS

↓

OPEN APPLICATION

↓

REVIEW PROFILE SNAPSHOT

↓

REVIEW APPLICATION ANSWERS

↓

REVIEW DOCUMENTS

↓

CHECK VALIDATION

↓

ADD INTERNAL NOTE IF NEEDED

↓

MESSAGE APPLICANT OR REQUEST REVISION

↓

VERIFY

↓

APPROVE

↓

READY FOR OFFICIAL PDLN

↓

EXPORT / PREPARE DATA

---

# 61. CRITICAL BUSINESS RULE

The system must clearly distinguish:

INTERNAL PREPARATION

vs

OFFICIAL PDLN PROCESS.

The application status:

READY_FOR_OFFICIAL_PDLN

means:

"Internal KUI verification is complete."

It must NOT imply:

"Official PDLN approval has been issued."

The system must never falsely represent an internal approval as an official institutional/government approval.

---

# 62. IMPORTANT CONFIDENTIALITY MODEL

Create explicit visibility levels for every sensitive object:

PUBLIC

AUTHENTICATED_USER

OWNER_ONLY

KUI_ONLY

ADMIN_ONLY

SUPER_ADMIN_ONLY

For example:

Applicant profile → OWNER + authorized KUI

Application → OWNER + KUI

Application documents → OWNER + KUI

Internal notes → KUI ONLY

SP / confidential administrative documents → KUI/authorized ADMIN ONLY

Audit logs → ADMIN/KUI depending on sensitivity

---

# 63. DESIGN THE SYSTEM AROUND "PROGRESSIVE DISCLOSURE"

Do not overwhelm the applicant.

Only show:

WHAT IS RELEVANT NOW.

Example:

Instead of showing 60 fields:

"Tell us about your trip."

Then dynamically reveal:

Destination

↓

Travel dates

↓

Purpose

↓

Program

↓

Funding

↓

Documents

Only reveal fields required by previous answers.

---

# 64. REVIEW SUMMARY BEFORE SUBMISSION

Before submit:

show:

## Ringkasan Pengajuan

Identitas
✓

Program
✓

Tujuan
✓

Perjalanan
✓

Pendanaan
✓

Dokumen
✓

Then:

"Pastikan informasi berikut benar sebelum dikirim ke KUI."

[Edit]

[Submit Pengajuan]

This is the final user confirmation.

---

# 65. DO NOT MAKE THE UI LOOK LIKE A GOOGLE FORM

The reference application is only a business-process reference.

The new application should feel like:

INSTITUTIONAL WORKFLOW APPLICATION

not:

ONLINE FORM.

Use:

progressive steps

profile integration

chat guidance

status timeline

document verification

KUI review

audit trail

role-based access.

---

# 66. DELIVERABLES

When implementation is complete, provide:

1. Working application

2. Database schema

3. Authentication

4. RBAC

5. Applicant dashboard

6. Dosen dashboard

7. KUI dashboard

8. Profile system

9. Smart PDLN form

10. Conditional workflow

11. Chat assistant

12. Document management

13. Revision system

14. Notification system

15. Audit log

16. Security controls

17. Seed/demo data

18. Architecture documentation

19. Setup instructions

20. Deployment instructions

---

# 67. BEFORE CODING

First produce:

## A. Existing system analysis

What the reference system appears to do.

## B. New system workflow

Detailed flow from login → profile → application → KUI.

## C. Role permission matrix

Student vs Dosen vs KUI vs Admin.

## D. Data model

Entities and relationships.

## E. Question dependency map

Which question depends on which answer.

## F. Redundancy elimination map

For every form field:

SOURCE:
Profile / Application / New Input / KUI

## G. Security model

What each role can access.

## H. Document visibility model

Who can access every document category.

## I. Chatbot architecture

What the bot can and cannot answer.

Only after those are defined:

START IMPLEMENTATION.

---

# 68. QUALITY BAR

Do not stop at:

"the page looks good."

The system is successful only when:

A student can login,

the system already knows their institutional information,

the student does not repeatedly enter the same information,

irrelevant questions disappear,

the chatbot guides the process,

documents remain private,

KUI can review everything required,

KUI can request specific revisions,

students only see information they are authorized to see,

internal SP/admin information never leaks,

and the resulting application can be prepared for the official PDLN process.

Build this as if it will eventually become the internal production system of KUI PNJ, while keeping the current implementation clearly labeled as an INTERNAL / PRE-SUBMISSION system.
