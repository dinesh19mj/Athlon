import fs from 'node:fs/promises';
import { SpreadsheetFile, Workbook } from 'file:///C:/Users/neoni/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';

const outDir = 'C:/Dinesh/Projects/Athlon-Sport/test-reports/athlon-uiux-audit-2026-10-12';
await fs.mkdir(outDir, { recursive: true });
const wb = Workbook.create();
const summary = wb.worksheets.add('Summary');
const tracker = wb.worksheets.add('Findings');
const coverage = wb.worksheets.add('Coverage');
for (const s of [summary, tracker, coverage]) { s.showGridLines = false; }

const navy='#10243E', blue='#1F5E9D', pale='#EAF2F8', text='#17212B', amber='#FCE4B2', red='#FADBD8', green='#E8F5E9', border='#D5DCE5';
const findings = [
['ATH-UX-001','P0','Information architecture','Organizer, Academy, Club, Venue','Dashboard tool carousel duplicates sidebar navigation','Observed across workspace dashboards; consumes first viewport and repeats destinations.','Remove generic carousel on desktop; retain sidebar as canonical navigation and show max four contextual pinned actions.','Open'],
['ATH-UX-002','P0','Data trust','Organizer, Club','Static-looking event/activity content appears beside live zero totals','A manager cannot distinguish live records from sample content.','Use only live data or explicit empty/error/sample states.','Open'],
['ATH-UX-003','P1','Data management','Organizer','Tournament management is card-first','Cards do not scale for filtering, comparing, or bulk management.','Make table/list default; keep card view optional.','Open'],
['ATH-UX-004','P1','Loading/empty state','Academy','Roster/batch state transition lacks a unified resolved-state contract','Initial Loading labels were observed before useful empty state.','Use bounded skeleton, error/retry, then explicit zero state.','Open'],
['ATH-UX-005','P1','Scheduling UX','Venue','Calendar grid needs scalable desktop ergonomics','Strong grid foundation, but high facility volume needs fixed headers/legend and constrained scroll.','Freeze time/header, persistent legend, non-color state cues.','Open'],
['ATH-UX-006','P1','Privacy UX','Venue','Booking ledger displays full customer phone numbers','List view makes phone data easy to shoulder-surf or expose in screenshots.','Mask by default; reveal in authorized detail.','Open'],
['ATH-UX-007','P2','Hierarchy','Athlete','Personal operations and marketplace discovery compete','Upcoming personal actions have similar weight to explore content.','Put My Day and action queue first; demote discovery.','Open'],
['ATH-UX-008','P2','Safety UX','Club','Remove member is repeated as a direct table action','Prominent destructive controls create visual noise and accidental-action risk.','Use overflow/secondary action plus confirmation.','Open'],
['ATH-UX-009','P2','Accessibility/navigation','Academy, Venue','Dense sidebars require robust collapsed-mode behavior','Grouping is good but needs reliable tooltip, focus, active-state, and keyboard validation.','Implement/test collapsed accessible navigation contract.','Open'],
['ATH-UX-010','P2','Dashboard hierarchy','All workspaces','Too many metrics/features appear before a priority queue','Dashboard attention is diluted.','Limit KPI strip then show prioritized operational work.','Open'],
];
summary.getRange('A2:H2').merge();
summary.getRange('A2').values=[['ATHLON Desktop UI/UX Audit Tracker']];
summary.getRange('A3:H3').merge();
summary.getRange('A3').values=[['Live read-only desktop inspection - 12 Oct 2026 - https://athlon.co.in']];
summary.getRange('A5:B10').values=[
['Metric','Value'],['Findings',findings.length],['P0',2],['P1',4],['P2',4],['Test method','Live browser inspection; no mutations']
];
summary.getRange('D5:H10').values=[
['Audit boundary','Details','','',''],
['Inspected','Athlete, Organizer, Academy, Club, Venue','','',''],
['Not available','Coach, Team Auction, Super Admin','','',''],
['Viewport limitation','Fixed 1366/1440/1920 viewport automation not available','','',''],
['Mobile','Not inspected or changed','','',''],
['Functional scope','No forms, payments, or mutations tested','','','']
];
summary.getRange('A2:H2').format={fill:navy,horizontalAlignment:'left',verticalAlignment:'center'};
summary.getRange('A2:H2').format.font={name:'Arial',size:16,bold:true,color:'#FFFFFF'};
summary.getRange('A3:H3').format={verticalAlignment:'center'};
summary.getRange('A3:H3').format.font={name:'Arial',size:10,color:'#4B5563',italic:true};
summary.getRange('A5:B5').format={fill:blue,font:{name:'Arial',bold:true,color:'#FFFFFF'},horizontalAlignment:'center'};
summary.getRange('D5:H5').format={fill:blue,font:{name:'Arial',bold:true,color:'#FFFFFF'},horizontalAlignment:'center'};
summary.getRange('A5:B10').format.borders={preset:'all',style:'thin',color:border};
summary.getRange('D5:H10').format.borders={preset:'all',style:'thin',color:border};
summary.getRange('A6:A10').format.font={name:'Arial',bold:true,color:text};
summary.getRange('D6:D10').format.font={name:'Arial',bold:true,color:text};
summary.getRange('A2:H3').format.rowHeight=26;
summary.getRange('A1:H15').format.font={name:'Arial',size:10,color:text};
summary.getRange('A2:H2').format.font={name:'Arial',size:16,bold:true,color:'#FFFFFF'};
summary.getRange('A3:H3').format.font={name:'Arial',size:10,color:'#4B5563',italic:true};
summary.getRange('A:A').format.columnWidth=20; summary.getRange('B:B').format.columnWidth=32; summary.getRange('C:C').format.columnWidth=4; summary.getRange('D:D').format.columnWidth=22; summary.getRange('E:H').format.columnWidth=20;
summary.getRange('B10').format.wrapText=true; summary.getRange('E6:E10').format.wrapText=true;

tracker.getRange('A1:H1').values=[['Finding ID','Priority','Category','Module','Title','Observed issue','Recommended action','Status']];
tracker.getRange(`A2:H${findings.length+1}`).values=findings;
tracker.tables.add(`A1:H${findings.length+1}`,true,'FindingsTable');
tracker.getRange('A1:H1').format={fill:navy,font:{name:'Arial',bold:true,color:'#FFFFFF'},horizontalAlignment:'center',verticalAlignment:'center',wrapText:true};
tracker.getRange(`A2:H${findings.length+1}`).format={font:{name:'Arial',size:10,color:text},verticalAlignment:'top',wrapText:true};
tracker.getRange(`A1:H${findings.length+1}`).format.borders={preset:'inside',style:'thin',color:border};
tracker.getRange(`B2:B${findings.length+1}`).conditionalFormats.add('containsText',{text:'P0',format:{fill:red,font:{bold:true,color:'#9B1C1C'}}});
tracker.getRange(`B2:B${findings.length+1}`).conditionalFormats.add('containsText',{text:'P1',format:{fill:amber,font:{bold:true,color:'#92400E'}}});
tracker.getRange(`B2:B${findings.length+1}`).conditionalFormats.add('containsText',{text:'P2',format:{fill:pale,font:{bold:true,color:'#1E40AF'}}});
tracker.freezePanes.freezeRows(1);
for (const [c,w] of [['A:A',14],['B:B',10],['C:C',20],['D:D',24],['E:E',33],['F:F',48],['G:G',48],['H:H',12]]) tracker.getRange(c).format.columnWidth=w;
tracker.getRange(`A2:H${findings.length+1}`).format.rowHeight=54;

const cov=[
['Module','Actual live review','Desktop result','Notes'],
['Public/Athlete','Public home and authenticated personal home','Partial','No form or personal edit flows used'],
['Organizer','Dashboard and tournament list','Partial','Read-only visual inspection'],
['Academy','Dashboard, students, batches','Partial','Empty states reviewed'],
['Club','Dashboard, members','Partial','Member data table reviewed'],
['Venue Manager','Dashboard, calendar, bookings, facilities','Partial','Calendar and ledger reviewed'],
['Coach','Not available in workspace selector','Not tested','No claim made'],
['Team Auction','Not available in workspace selector','Not tested','No claim made'],
['Super Admin','Not available in workspace selector','Not tested','No claim made'],
['Mobile','Out of scope','Not tested','No mobile change recommended'],
['Fixed viewport visual regression','Browser harness limitation','Not tested','Validate 1366x768, 1440x900, 1920x1080']
];
coverage.getRange(`A1:D${cov.length}`).values=cov;
coverage.tables.add(`A1:D${cov.length}`,true,'CoverageTable');
coverage.getRange('A1:D1').format={fill:navy,font:{name:'Arial',bold:true,color:'#FFFFFF'},horizontalAlignment:'center'};
coverage.getRange(`A2:D${cov.length}`).format={font:{name:'Arial',size:10,color:text},verticalAlignment:'top',wrapText:true};
coverage.getRange(`A1:D${cov.length}`).format.borders={preset:'inside',style:'thin',color:border};
coverage.freezePanes.freezeRows(1);
for (const [c,w] of [['A:A',28],['B:B',38],['C:C',16],['D:D',55]]) coverage.getRange(c).format.columnWidth=w;
coverage.getRange(`A2:D${cov.length}`).format.rowHeight=34;
wb.recalculate();
const check = await wb.inspect({kind:'table',range:'Findings!A1:H11',include:'values,formulas',tableMaxRows:15,tableMaxCols:8});
if (!check.ndjson.includes('ATH-UX-001')) throw new Error('Workbook validation failed');
const errors = await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:20}});
if (errors.ndjson.includes('#REF!')) throw new Error('Formula error found');
const preview = await wb.render({sheetName:'Summary',range:'A1:H12',scale:1,format:'png'});
await fs.writeFile(`${outDir}/tracker-preview.png`,new Uint8Array(await preview.arrayBuffer()));
const xlsx=await SpreadsheetFile.exportXlsx(wb); await xlsx.save(`${outDir}/ATHLON_DESKTOP_UI_AUDIT_TRACKER.xlsx`);
