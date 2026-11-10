from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.pdfbase.pdfmetrics import stringWidth

OUT = r'C:\Dinesh\Projects\Athlon-Sport\test-reports\athlon-uiux-audit-2026-10-12\ATHLON_DESKTOP_UI_UX_AUDIT_REPORT.pdf'
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='Title2',parent=styles['Title'],fontName='Helvetica-Bold',fontSize=21,leading=25,textColor=colors.HexColor('#10243E'),spaceAfter=8))
styles.add(ParagraphStyle(name='H1x',parent=styles['Heading1'],fontName='Helvetica-Bold',fontSize=14,leading=17,textColor=colors.HexColor('#10243E'),spaceBefore=14,spaceAfter=7))
styles.add(ParagraphStyle(name='H2x',parent=styles['Heading2'],fontName='Helvetica-Bold',fontSize=11,leading=14,textColor=colors.HexColor('#1F5E9D'),spaceBefore=10,spaceAfter=4))
styles.add(ParagraphStyle(name='Bodyx',parent=styles['BodyText'],fontName='Helvetica',fontSize=9,leading=13,textColor=colors.HexColor('#17212B'),spaceAfter=5))
styles.add(ParagraphStyle(name='Small',parent=styles['BodyText'],fontName='Helvetica',fontSize=7.8,leading=10,textColor=colors.HexColor('#17212B')))
styles.add(ParagraphStyle(name='SmallHead',parent=styles['BodyText'],fontName='Helvetica-Bold',fontSize=7.8,leading=10,textColor=colors.white))

def p(text,style='Bodyx'): return Paragraph(text,styles[style])
def footer(canvas,doc):
    canvas.saveState(); canvas.setStrokeColor(colors.HexColor('#D5DCE5')); canvas.line(18*mm,14*mm,192*mm,14*mm)
    canvas.setFont('Helvetica',7); canvas.setFillColor(colors.HexColor('#5B6571'))
    canvas.drawString(18*mm,9*mm,'ATHLON Desktop UI/UX Audit - Read-only live inspection')
    canvas.drawRightString(192*mm,9*mm,f'Page {doc.page}')
    canvas.restoreState()

doc=SimpleDocTemplate(OUT,pagesize=A4,rightMargin=18*mm,leftMargin=18*mm,topMargin=17*mm,bottomMargin=20*mm)
story=[]
story += [p('ATHLON Desktop UI/UX Audit','Title2'),p('Live environment: https://athlon.co.in | Audit date: 12 October 2026 | Scope: desktop, read-only, authenticated browser inspection','Bodyx'),Spacer(1,5)]
story += [p('Executive conclusion','H1x'),p('ATHLON has meaningful workspace breadth and an especially promising Venue Manager information architecture. Its desktop experience is not yet consistently operational: dashboards duplicate the side navigation through tool carousels, hierarchy competes with action-oriented data, and the presentation of static-looking content beside live totals risks trust. The recommended redesign is desktop-only and preserves mobile UI, routes, APIs, permissions, and business logic.','Bodyx')]
rating=[['Area','Assessment','Reason'],['App shell','Needs improvement','Grouped navigation is useful, but dashboards repeat it.'],['Organizer','Major redesign needed','Operational data should lead; card list does not scale.'],['Academy','Major redesign needed','Standard roster/state patterns needed.'],['Club','Needs improvement','Member table is solid; dashboard needs hierarchy.'],['Venue','Needs improvement','Best IA; calendar/ledger need desktop refinement.']]
rating_cells=[[p(x,'SmallHead' if i==0 else 'Small') for x in r] for i,r in enumerate(rating)]
t=Table(rating_cells,colWidths=[34*mm,39*mm,101*mm]);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#10243E')),('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#D5DCE5')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]));story += [t]
story += [p('Audit method and boundary','H1x'),p('Inspected: public home, authenticated Athlete home, Organizer dashboard and tournament list, Academy dashboard/students/batches, Club dashboard/members, and Venue dashboard/calendar/bookings/facilities. No data was created, edited, deleted, paid, or submitted. Coach, Team Auction, Super Admin, and unavailable workspaces were not accessible. This is not a mobile test or functional E2E report.','Bodyx')]
story += [p('Priority findings','H1x')]
findings=[
('ATH-UX-001 | P0','Operational dashboards duplicate navigation','Organizer, Academy, Club, and Venue dashboards include a management-tool carousel that repeats the sidebar. Remove this desktop carousel and retain the sidebar as the canonical navigation; allow up to four contextual pinned actions.'),
('ATH-UX-002 | P0','Live-data trust is ambiguous','Organizer and Club dashboards display named, static-looking activity/content beside zero live metrics. Render only live content, true empty/error states, or explicitly labeled sample data.'),
('ATH-UX-003 | P1','Organizer needs a table-first competition list','A card-first list does not scale to filtering, status comparison, bulk management, or frequent scanning. Default desktop to a competition table/list; keep a visual card view optional.'),
('ATH-UX-004 | P1','Academy loading/empty states need a shared contract','Student and batch pages initially showed Loading labels and later resolved to good empty states. Use bounded skeletons, an error/retry path, then a resolved zero state across all roster pages.'),
('ATH-UX-005 | P1','Venue calendar needs scalable grid ergonomics','The calendar is a strong time-by-court matrix. Add frozen time/header axes, persistent legend, constrained grid scroll, and non-color status distinctions.'),
('ATH-UX-006 | P1','Booking ledger exposes full phone numbers','Customer phone numbers appear in the desktop table. Mask list-view phone data and reveal it only in an authorized detail context.'),
('ATH-UX-007 | P2','Athlete home mixes operations and discovery','Personal status/actions compete with marketplace and discovery modules. Lead with My Day and pending actions; demote discovery.'),
('ATH-UX-008 | P2','Club member removal is a high-visibility row action','Repeat destructive actions are visually noisy and error-prone. Move removal to an overflow/secondary action with confirmation.'),
('ATH-UX-009 | P2','Dense navigation requires collapsed-mode validation','Academy and Venue group routes well, but collapsed mode must preserve labels, focus, active state, and keyboard behavior.'),
('ATH-UX-010 | P2','Dashboards need priority queues before feature inventories','Use 3-5 KPIs then a prioritized operational queue, not a long collection of feature cards.')]
for ident,title,desc in findings:
    story += [p(ident,'H2x'),p(f'<b>{title}.</b> {desc}','Bodyx')]
story += [PageBreak(),p('Module review','H1x')]
modules=[
('Athlete','The authenticated home is feature-rich but asks users to process personal operations, discovery, and workspace selection at once. Desktop should lead with personal action state and place explore content lower.'),
('Organizer','Core module coverage is understandable. Rebuild the dashboard around KPIs, approvals/action queue, active competition table, and supporting results; do not use unlabelled static-looking event cards.'),
('Academy','The broad module map is well grouped. Student and batch pages should share a table/roster shell with search, filters, totals, bulk action space, explicit loading/error/empty states, and one primary CTA.'),
('Club','Members already have a legible table and useful role/status filters. The dashboard needs less duplicated navigation and stronger operational reporting; destructive row actions should be de-emphasized.'),
('Venue Manager','This is the best operational model: grouped navigation, live calendar, ledger, facilities. Refine rather than replace it. Make calendar axes sticky, scope scrolling to the grid, consolidate ledger filters, and protect customer data.')]
for title,desc in modules: story += [p(title,'H2x'),p(desc,'Bodyx')]
story += [p('Implementation roadmap','H1x')]
road=[['Priority','Work','Outcome'],['P0','Shared desktop shell; sidebar as canonical navigation; remove generic tool carousels','Clearer first viewport and no repeated destinations'],['P0','Live/empty/error state contract; label sample data','Operational data trust'],['P1','Shared table/toolbar/state primitives','Scalable records management'],['P1','Venue calendar and ledger refinement','Faster scheduling and safer data display'],['P2','Athlete My Day hierarchy and accessibility/viewport QA','Better personal focus and lower usability risk']]
road_cells=[[p(x,'SmallHead' if i==0 else 'Small') for x in r] for i,r in enumerate(road)]
t=Table(road_cells,colWidths=[20*mm,76*mm,78*mm]);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#1F5E9D')),('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#D5DCE5')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]));story += [t]
story += [p('Validation limitations','H1x'),p('The available browser harness supported actual desktop inspection but not fixed automation at 1366x768, 1440x900, and 1920x1080. Validate the redesign at all three viewport sizes before release. Keyboard-only operation, contrast, screen-reader announcements, form/modals, payments, and mobile behavior were not tested in this audit.','Bodyx')]
doc.build(story,onFirstPage=footer,onLaterPages=footer)
