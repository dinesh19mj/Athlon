from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

OUT=r'C:\Dinesh\Projects\Athlon-Sport\test-reports\athlon-wireframe-comparison-2026-11-03\ATHLON_WIREFRAME_VS_LIVE_ANALYSIS.pdf'
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleX',parent=styles['Title'],fontName='Helvetica-Bold',fontSize=20,leading=24,textColor=colors.HexColor('#10243E'),spaceAfter=8))
styles.add(ParagraphStyle(name='H1X',parent=styles['Heading1'],fontName='Helvetica-Bold',fontSize=14,leading=17,textColor=colors.HexColor('#10243E'),spaceBefore=13,spaceAfter=6))
styles.add(ParagraphStyle(name='H2X',parent=styles['Heading2'],fontName='Helvetica-Bold',fontSize=10.5,leading=13,textColor=colors.HexColor('#1F5E9D'),spaceBefore=8,spaceAfter=4))
styles.add(ParagraphStyle(name='BodyX',parent=styles['BodyText'],fontName='Helvetica',fontSize=8.8,leading=12.5,textColor=colors.HexColor('#17212B'),spaceAfter=5))
styles.add(ParagraphStyle(name='TableX',parent=styles['BodyText'],fontName='Helvetica',fontSize=7.2,leading=9,textColor=colors.HexColor('#17212B')))
styles.add(ParagraphStyle(name='TableHead',parent=styles['BodyText'],fontName='Helvetica-Bold',fontSize=7.2,leading=9,textColor=colors.white))
def P(x, s='BodyX'): return Paragraph(x,styles[s])
def table(rows,widths):
    cells=[[P(x,'TableHead' if i==0 else 'TableX') for x in row] for i,row in enumerate(rows)]
    t=Table(cells,colWidths=widths,repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#10243E')),('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#D5DCE5')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),4),('RIGHTPADDING',(0,0),(-1,-1),4),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)]))
    return t
def footer(c,d):
    c.saveState(); c.setStrokeColor(colors.HexColor('#D5DCE5')); c.line(18*mm,14*mm,192*mm,14*mm); c.setFont('Helvetica',7); c.setFillColor(colors.HexColor('#5B6571')); c.drawString(18*mm,9*mm,'ATHLON - Wireframe vs Live Application Analysis'); c.drawRightString(192*mm,9*mm,f'Page {d.page}'); c.restoreState()
doc=SimpleDocTemplate(OUT,pagesize=A4,leftMargin=18*mm,rightMargin=18*mm,topMargin=17*mm,bottomMargin=20*mm)
story=[P('ATHLON Wireframe vs Live Application Analysis','TitleX'),P('3 November 2026 | Wireframe/PRD structural review + authenticated, read-only live inspection','BodyX')]
story += [P('Executive conclusion','H1X'),P('The wireframe is the stronger product blueprint. The live app is the stronger working foundation where real data and operating flows already exist. Use the PRD as the staged product backlog, not as a mandate to reproduce all mock screens. The immediate work is to close trust, state-management and shared-business-core gaps before broadening surface area.','BodyX')]
story += [P('Evidence boundary','H1X'),P('Observed live: public and authenticated player home, Organizer, Academy, Club and Venue dashboards. No record, payment, configuration or account change was made. Coach, Gym and Super Admin were unavailable to the supplied account. The local wireframe HTML was structurally reviewed from the supplied archive; browser policy prevented direct visual rendering of local file pages.','BodyX')]
story += [P('Headline comparison','H1X'),table([
['Area','Wireframe/PRD','Live application','Assessment'],
['Product framing','Complete consumer + five business suites + Admin and reusable core','Player marketplace and working organization workspaces','Wireframe provides stronger operating model'],
['Venue','Full ERP with policies, workflow states, finance and channel intent','Calendar, bookings, recurring, facilities, pricing, blocks, reports and finances surfaced','Strongest live alignment; behavior still needs verification'],
['Tournament','Full registration through ticketing/post-event','Create/manage/register/draw/schedule/scoring routes exist','Strong base; format and lifecycle matrix needed'],
['Academy / Club','End-to-end lifecycle specified','Multiple workspace modules surfaced','Partial; commercial and guardian/membership detail incomplete'],
['Shared core','CRM, invoices, comms, HR, audit, go-live, reports','Some settings/admin routes exist','Needs explicit shared data and lifecycle architecture']
],[31*mm,48*mm,55*mm,40*mm])]
story += [P('What to retain from the live app','H1X'),P('<b>Retain:</b> existing public discovery, multi-workspace account model, venue booking foundation, tournament/event route structure, live score boards, and dynamic backend integration. These are valuable implementation assets that wireframes do not replace.','BodyX')]
story += [P('What to adopt from the wireframe','H1X'),P('<b>Adopt:</b> shared Business Core, role-centered dashboards, explicit lifecycle/state models, organization-linking design, and phased scope. Replace dashboard feature inventories with a small action area plus a queue of work that needs attention.','BodyX')]
story += [PageBreak(),P('Detailed product comparison','H1X')]
rows=[
['Area','Observed live / code evidence','Gap or risk','Priority'],
['Consumer','Discovery cards, sport filters, venues, tournaments, community sessions and scores are live. Venue/academy/coach routes exist.','No verified sport-scoped product context, map search, family account, wallet/receipt/privacy centre, QR/cancel/reschedule evidence.','P0/P1'],
['Venue','Venue workspace surfaces calendar, bookings, recurring, facilities, pricing, blocks, reports and finance.','Slot lock, parent-child resource conflict, policy engine, check-in/no-show, enquiry/quote, waitlist, invoices/settlements not proven.','P0/P1'],
['Tournament','Organizer offers create/manage/registrations; source has draw, schedule and multi-sport scoring routes.','Supported-format matrix, waiver/partner/roster validation, scheduler constraints, score correction audit, tickets/certificates not proven.','P0/P1'],
['Academy','Students, batches, admissions, coaches, attendance, progress, inventory and finance destinations are visible.','Guardian/medical/consent, trial funnel, fee lifecycle, canonical student record, parent access and report cards not proven.','P1'],
['Club','Members, attendance, matches, ranking, inventory, analytics and finances visible.','Membership plan/dues/ID, team/squad, RSVP, polls/communication and linked-venue flows not proven.','P1'],
['Business core','Multiple orgs/workspaces, roles/settings and admin routes exist.','CRM, explicit go-live gate, immutable audit, shared ledger/invoice, communications and organization linking need first-class treatment.','P0/P1'],
['Admin/Gym','Admin routes exist in source. Gym mock exists in wireframe.','Admin inaccessible to this account; Gym not observed in live route inventory/workspace.','Separate review / future scope']
]
story += [table(rows,[24*mm,60*mm,62*mm,28*mm])]
story += [P('P0 launch integrity backlog','H1X')]
for title,body in [
('Booking integrity','Server-authoritative slot locks, idempotency, exclusion protection, payment webhook reconciliation and visible cancellation/refund state.'),
('Organization go-live','A checklist and verification gate for public listing: profile, geo, resource/programme, contact, payout, KYC and tax state.'),
('Authorization and audit','Tenant scoped backend authorization, configurable role permissions and immutable financial/booking/score-correction audit trail.'),
('Tournament integrity','Document formats that are genuinely supported and enforce correct registration, draw, schedule, scoring and advancement transitions.'),
('Consumer onboarding','Verified sign-in, favourite sport/skill/location capture and profile completion that drive search and recommendations.')]:
    story += [P(title,'H2X'),P(body,'BodyX')]
story += [P('P1 commercial operations','H1X'),P('Shared CRM/lead pipeline; invoices and GST receipts; academy admission/fees/guardian data; club memberships/dues/events; venue walk-in/check-in/recurring/enquiries; preference-aware notifications.','BodyX')]
story += [P('P2 scale and differentiation','H1X'),P('Map/geo search, rating/leaderboards, tickets and gate scan, sponsors/certificates, parent/coach companion apps, channel integrations, HR/payroll/maintenance/cleaning and Gym.','BodyX')]
story += [PageBreak(),P('Recommended delivery sequence','H1X'),table([
['Release','Scope','Release gate'],
['R1 - Core trust','Booking lock/reconciliation, go-live, RBAC/audit, onboarding, venue core','Concurrency proves one booking per slot; sensitive state changes audited.'],
['R2 - Commerce & events','Ledger/invoices, complete registration-to-result flow, counter/check-in, CRM','A real tournament completes with reconcilable booking/payment/score records.'],
['R3 - Academy & club','Admission/fees/attendance, membership/dues/RSVP, guardian basics','Student and member lifecycles work without manual side channels.'],
['R4 - Scale','Tickets, maps, ratings, integrations, advanced reports','Support, security and metrics support growth.']
],[33*mm,67*mm,74*mm])]
story += [P('Implementation guidance','H1X'),P('Do not recreate all wireframe screens. Build a single reusable set of record shells, state components and shared services first. Every dashboard should foreground pending work, not a carousel of modules. Every core entity - Booking, Invoice, Participant/Team, Student, Member, Organization and Match - needs one canonical detail page and an explicit state history.','BodyX')]
story += [P('Next validation steps','H1X'),P('Run full disposable-data E2E tests for booking/payment/cancellation, tournament registration/draw/scoring, academy admission/fees, and club membership. Perform tenant isolation and role tests. Review Admin with an authorized test account. Confirm MVP sports/city, payment/settlement policy, verification policy and whether Gym is in launch scope.','BodyX')]
doc.build(story,onFirstPage=footer,onLaterPages=footer)
