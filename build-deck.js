const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10" x 5.625"
pres.author = "Phill";
pres.title = "Job Application Tracker — Pitch & Plan";

// Palette
const NAVY = "0B1E3F";        // background
const CARD = "13294B";        // card / secondary surface
const BLUE = "4FC3F7";        // primary accent (light blue)
const GOLD = "F5C518";        // secondary accent (highlight)
const WHITE = "FFFFFF";
const MUTED = "B8C5D6";
const BORDER = "1F3A66";

const HEAD_FONT = "Calibri";
const BODY_FONT = "Calibri";

// Slide dims
const W = 10;
const H = 5.625;

// Reusable decorators
function applyBase(slide) {
  slide.background = { color: NAVY };
  // Gold left-edge accent bar (visual motif)
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.12, h: H,
    fill: { color: GOLD }, line: { color: GOLD, width: 0 },
  });
}

function addFooter(slide, pageNum, total) {
  slide.addText("Job Application Tracker  •  Pitch & Plan", {
    x: 0.4, y: H - 0.35, w: 6, h: 0.25,
    fontSize: 9, fontFace: BODY_FONT, color: MUTED, margin: 0,
  });
  slide.addText(`${pageNum} / ${total}`, {
    x: W - 1.2, y: H - 0.35, w: 0.8, h: 0.25,
    fontSize: 9, fontFace: BODY_FONT, color: MUTED, align: "right", margin: 0,
  });
}

function addTitle(slide, text) {
  slide.addText(text, {
    x: 0.5, y: 0.45, w: 9, h: 0.7,
    fontSize: 32, fontFace: HEAD_FONT, color: WHITE, bold: true, margin: 0,
  });
}

const TOTAL = 11;

// =====================================================
// Slide 1 — Title
// =====================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  // Large gold accent block on the left
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.3, h: H,
    fill: { color: GOLD }, line: { color: GOLD, width: 0 },
  });

  // Eyebrow
  s.addText("PITCH & PLAN", {
    x: 0.9, y: 1.5, w: 8, h: 0.4,
    fontSize: 14, fontFace: HEAD_FONT, color: GOLD, bold: true,
    charSpacing: 6, margin: 0,
  });

  // Main title
  s.addText("Job Application Tracker", {
    x: 0.9, y: 1.95, w: 8.5, h: 1.1,
    fontSize: 54, fontFace: HEAD_FONT, color: WHITE, bold: true, margin: 0,
  });

  // Subtitle
  s.addText("A CRM for your job search.", {
    x: 0.9, y: 3.1, w: 8.5, h: 0.5,
    fontSize: 22, fontFace: BODY_FONT, color: BLUE, italic: true, margin: 0,
  });

  // Footer / byline
  s.addText("By Phill   •   2026", {
    x: 0.9, y: H - 0.7, w: 5, h: 0.3,
    fontSize: 12, fontFace: BODY_FONT, color: MUTED, margin: 0,
  });
}

// =====================================================
// Slide 2 — The Problem
// =====================================================
{
  const s = pres.addSlide();
  applyBase(s);
  addTitle(s, "The Problem");

  s.addText([
    { text: "Job seekers run 20+ applications across LinkedIn, company sites, referrals, and recruiters.", options: { bullet: true, breakLine: true } },
    { text: "Data ends up scattered across spreadsheets, emails, and browser tabs.", options: { bullet: true, breakLine: true } },
    { text: "Tactical pain: missed follow-ups, double-applications, forgotten interviewer names.", options: { bullet: true, breakLine: true } },
    { text: "Strategic pain: no visibility into what's actually working — funnel stalls, slow responders, weak sources.", options: { bullet: true } },
  ], {
    x: 0.6, y: 1.4, w: 8.8, h: 3.4,
    fontSize: 18, fontFace: BODY_FONT, color: WHITE, paraSpaceAfter: 10,
  });

  addFooter(s, 2, TOTAL);
}

// =====================================================
// Slide 3 — The User
// =====================================================
{
  const s = pres.addSlide();
  applyBase(s);
  addTitle(s, "The User");

  // Big pull-quote callout
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 1.4, w: 8.8, h: 1.3,
    fill: { color: CARD }, line: { color: BORDER, width: 1 },
  });
  s.addText("An active job seeker running 20+ concurrent applications.", {
    x: 0.9, y: 1.5, w: 8.2, h: 1.1,
    fontSize: 22, fontFace: HEAD_FONT, color: WHITE, bold: true,
    valign: "middle", margin: 0,
  });

  s.addText([
    { text: "New grads, career switchers, recently laid-off professionals.", options: { bullet: true, breakLine: true } },
    { text: "Currently lives in a Google Sheet — and knows they've outgrown it.", options: { bullet: true } },
  ], {
    x: 0.6, y: 3.0, w: 8.8, h: 2.0,
    fontSize: 18, fontFace: BODY_FONT, color: WHITE, paraSpaceAfter: 10,
  });

  addFooter(s, 3, TOTAL);
}

// =====================================================
// Slide 4 — The Solution
// =====================================================
{
  const s = pres.addSlide();
  applyBase(s);
  addTitle(s, "The Solution");

  s.addText("A focused CRM for the job search.", {
    x: 0.6, y: 1.25, w: 9, h: 0.5,
    fontSize: 20, fontFace: HEAD_FONT, color: BLUE, italic: true, margin: 0,
  });

  s.addText([
    { text: "One place for applications, companies, interview rounds, and the humans you're talking to.", options: { bullet: true, breakLine: true } },
    { text: "Built-in analytics so users can see their own funnel.", options: { bullet: true, breakLine: true } },
    { text: "AI-assisted: paste a job description, get an auto-filled application card and a tailored cover letter.", options: { bullet: true } },
  ], {
    x: 0.6, y: 2.0, w: 8.8, h: 3.0,
    fontSize: 18, fontFace: BODY_FONT, color: WHITE, paraSpaceAfter: 12,
  });

  addFooter(s, 4, TOTAL);
}

// =====================================================
// Slide 5 — Core Features (MVP)
// =====================================================
{
  const s = pres.addSlide();
  applyBase(s);
  addTitle(s, "Core Features (MVP)");

  s.addText([
    { text: "Full CRUD on Applications, Companies, Interviews, Contacts", options: { bullet: true, breakLine: true } },
    { text: "Application list with status filter", options: { bullet: true, breakLine: true } },
    { text: "Application detail page with related interviews + contacts", options: { bullet: true, breakLine: true } },
    { text: "Status pipeline: Applied → Contacted → Interview → Offer  (+ Rejected, Withdrawn)", options: { bullet: true, breakLine: true } },
    { text: "Funnel chart + days-to-response metric", options: { bullet: true, breakLine: true } },
    { text: "AI JD Extractor — paste a job description, auto-fill the application", options: { bullet: true, breakLine: true } },
    { text: "AI Cover Letter Generator — tailored letter from your resume + the JD", options: { bullet: true } },
  ], {
    x: 0.6, y: 1.3, w: 8.8, h: 3.8,
    fontSize: 15, fontFace: BODY_FONT, color: WHITE, paraSpaceAfter: 8,
  });

  addFooter(s, 5, TOTAL);
}

// =====================================================
// Slide 6 — AI Features
// =====================================================
{
  const s = pres.addSlide();
  applyBase(s);
  addTitle(s, "AI Features");

  // Two feature cards side by side
  const cardY = 1.4;
  const cardH = 2.6;
  const card1X = 0.6;
  const card2X = 5.2;
  const cardW = 4.2;

  // Card 1
  s.addShape(pres.shapes.RECTANGLE, {
    x: card1X, y: cardY, w: cardW, h: cardH,
    fill: { color: CARD }, line: { color: BORDER, width: 1 },
  });
  s.addText("JD Extractor", {
    x: card1X + 0.25, y: cardY + 0.2, w: cardW - 0.5, h: 0.45,
    fontSize: 20, fontFace: HEAD_FONT, color: GOLD, bold: true, margin: 0,
  });
  s.addText(
    "Paste a job description. OpenAI pulls out required skills and auto-fills the application card — title, skills, seniority hints.",
    {
      x: card1X + 0.25, y: cardY + 0.75, w: cardW - 0.5, h: cardH - 1.0,
      fontSize: 14, fontFace: BODY_FONT, color: WHITE, margin: 0,
    }
  );

  // Card 2
  s.addShape(pres.shapes.RECTANGLE, {
    x: card2X, y: cardY, w: cardW, h: cardH,
    fill: { color: CARD }, line: { color: BORDER, width: 1 },
  });
  s.addText("Cover Letter Generator", {
    x: card2X + 0.25, y: cardY + 0.2, w: cardW - 0.5, h: 0.45,
    fontSize: 20, fontFace: HEAD_FONT, color: GOLD, bold: true, margin: 0,
  });
  s.addText(
    "Drafts a tailored cover letter from your stored resume + the JD. Editable before you send. Saved on the application card.",
    {
      x: card2X + 0.25, y: cardY + 0.75, w: cardW - 0.5, h: cardH - 1.0,
      fontSize: 14, fontFace: BODY_FONT, color: WHITE, margin: 0,
    }
  );

  // Security note
  s.addText("API key stays server-side (Flask) — never in the browser.", {
    x: 0.6, y: 4.3, w: 8.8, h: 0.4,
    fontSize: 13, fontFace: BODY_FONT, color: BLUE, italic: true, margin: 0,
  });

  addFooter(s, 6, TOTAL);
}

// =====================================================
// Slide 7 — Data Model
// =====================================================
{
  const s = pres.addSlide();
  applyBase(s);
  addTitle(s, "Data Model — 4 Related Resources");

  // Relationship strip (top)
  s.addText("Company  1:N  Application     •     Application  1:N  Interview     •     Company  1:N  Contact", {
    x: 0.6, y: 1.2, w: 8.8, h: 0.4,
    fontSize: 13, fontFace: BODY_FONT, color: BLUE, italic: true, margin: 0,
  });

  // 2x2 grid of resource cards
  const cards = [
    { name: "Company", fields: "name, industry, size, website, location, notes" },
    { name: "Application", fields: "role_title, company_id, status, applied_date, source, salary_range, jd_text, notes" },
    { name: "Interview", fields: "application_id, round_type, scheduled_at, interviewer_name, outcome, notes" },
    { name: "Contact", fields: "name, role, email, company_id, last_contacted, notes" },
  ];

  const gridX = 0.6, gridY = 1.75;
  const cW = 4.3, cH = 1.55, gap = 0.2;

  cards.forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = gridX + col * (cW + gap);
    const y = gridY + row * (cH + gap);
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: cW, h: cH,
      fill: { color: CARD }, line: { color: BORDER, width: 1 },
    });
    s.addText(c.name, {
      x: x + 0.2, y: y + 0.15, w: cW - 0.4, h: 0.4,
      fontSize: 16, fontFace: HEAD_FONT, color: GOLD, bold: true, margin: 0,
    });
    s.addText(c.fields, {
      x: x + 0.2, y: y + 0.6, w: cW - 0.4, h: cH - 0.7,
      fontSize: 12, fontFace: BODY_FONT, color: WHITE, margin: 0,
    });
  });

  addFooter(s, 7, TOTAL);
}

// =====================================================
// Slide 8 — API & Components
// =====================================================
{
  const s = pres.addSlide();
  applyBase(s);
  addTitle(s, "API, Components & External Services");

  // Two columns top: Flask API (left), React Components (right)
  const topY = 1.3;
  const topH = 2.5;
  const leftX = 0.6, rightX = 5.2;
  const colW = 4.2;

  // Left card — Flask API
  s.addShape(pres.shapes.RECTANGLE, {
    x: leftX, y: topY, w: colW, h: topH,
    fill: { color: CARD }, line: { color: BORDER, width: 1 },
  });
  s.addText("Flask API  (REST)", {
    x: leftX + 0.25, y: topY + 0.12, w: colW - 0.5, h: 0.35,
    fontSize: 15, fontFace: HEAD_FONT, color: GOLD, bold: true, margin: 0,
  });
  s.addText([
    { text: "GET / POST   /api/companies", options: { bullet: true, breakLine: true } },
    { text: "GET / PATCH / DELETE   /api/companies/<id>", options: { bullet: true, breakLine: true } },
    { text: "same shape for /applications, /interviews, /contacts", options: { bullet: true, breakLine: true } },
    { text: "GET   /api/analytics/funnel", options: { bullet: true, breakLine: true } },
    { text: "GET   /api/analytics/response-time", options: { bullet: true, breakLine: true } },
    { text: "POST  /api/ai/extract-jd", options: { bullet: true, breakLine: true } },
    { text: "POST  /api/ai/cover-letter", options: { bullet: true } },
  ], {
    x: leftX + 0.25, y: topY + 0.55, w: colW - 0.5, h: topH - 0.7,
    fontSize: 10.5, fontFace: "Consolas", color: WHITE, paraSpaceAfter: 2,
  });

  // Right card — React
  s.addShape(pres.shapes.RECTANGLE, {
    x: rightX, y: topY, w: colW, h: topH,
    fill: { color: CARD }, line: { color: BORDER, width: 1 },
  });
  s.addText("React Components", {
    x: rightX + 0.25, y: topY + 0.12, w: colW - 0.5, h: 0.35,
    fontSize: 15, fontFace: HEAD_FONT, color: GOLD, bold: true, margin: 0,
  });
  s.addText([
    { text: "App  ›  Layout", options: { bullet: true, breakLine: true } },
    { text: "Dashboard  (funnel + KPIs)", options: { bullet: true, breakLine: true } },
    { text: "Applications: List, Detail (tabs)", options: { bullet: true, breakLine: true } },
    { text: "Companies: List, Detail", options: { bullet: true, breakLine: true } },
    { text: "Contacts (list + drawer)", options: { bullet: true, breakLine: true } },
    { text: "shared: FormModal, StatusBadge, useApi hook", options: { bullet: true } },
  ], {
    x: rightX + 0.25, y: topY + 0.55, w: colW - 0.5, h: topH - 0.7,
    fontSize: 11, fontFace: BODY_FONT, color: WHITE, paraSpaceAfter: 3,
  });

  // Bottom strip — External Services
  const botY = 3.95;
  const botH = 0.95;
  s.addShape(pres.shapes.RECTANGLE, {
    x: leftX, y: botY, w: 8.8, h: botH,
    fill: { color: CARD }, line: { color: BORDER, width: 1 },
  });
  s.addText("External Services", {
    x: leftX + 0.25, y: botY + 0.1, w: 4, h: 0.35,
    fontSize: 15, fontFace: HEAD_FONT, color: GOLD, bold: true, margin: 0,
  });
  s.addText([
    { text: "OpenAI API ", options: { bold: true, color: BLUE } },
    { text: "(gpt-4o-mini)  —  powers JD extraction + cover letter generation. ", options: { color: WHITE } },
    { text: "Key stored in .env, called only from Flask.", options: { italic: true, color: MUTED } },
  ], {
    x: leftX + 0.25, y: botY + 0.45, w: 8.3, h: 0.45,
    fontSize: 12, fontFace: BODY_FONT, margin: 0, valign: "top",
  });

  addFooter(s, 8, TOTAL);
}

// =====================================================
// Slide 9 — Timeline
// =====================================================
{
  const s = pres.addSlide();
  applyBase(s);
  addTitle(s, "Timeline  (~29–41 hrs total)");

  const headerStyle = { fill: { color: GOLD }, color: NAVY, bold: true, fontFace: HEAD_FONT, fontSize: 12, valign: "middle" };
  const cellBase = { fontFace: BODY_FONT, fontSize: 11, color: WHITE, valign: "middle" };
  const altFill = { fill: { color: CARD } };

  const rows = [
    [{ text: "#", options: headerStyle }, { text: "Task", options: headerStyle }, { text: "Est.", options: headerStyle }],
    [{ text: "1",  options: cellBase }, { text: "Flask scaffold, models, migrations",  options: cellBase }, { text: "2–3 hrs", options: cellBase }],
    [{ text: "2",  options: { ...cellBase, ...altFill } }, { text: "Applications + Companies CRUD endpoints", options: { ...cellBase, ...altFill } }, { text: "3–4 hrs", options: { ...cellBase, ...altFill } }],
    [{ text: "3",  options: cellBase }, { text: "Interviews + Contacts CRUD endpoints", options: cellBase }, { text: "2–3 hrs", options: cellBase }],
    [{ text: "4",  options: { ...cellBase, ...altFill } }, { text: "React scaffold, routing, useApi hook", options: { ...cellBase, ...altFill } }, { text: "2–3 hrs", options: { ...cellBase, ...altFill } }],
    [{ text: "5",  options: cellBase }, { text: "Applications list + detail view", options: cellBase }, { text: "4–6 hrs", options: cellBase }],
    [{ text: "6",  options: { ...cellBase, ...altFill } }, { text: "Companies + Contacts views", options: { ...cellBase, ...altFill } }, { text: "3–4 hrs", options: { ...cellBase, ...altFill } }],
    [{ text: "7",  options: cellBase }, { text: "Analytics endpoints + funnel chart", options: cellBase }, { text: "3–4 hrs", options: cellBase }],
    [{ text: "8",  options: { ...cellBase, ...altFill } }, { text: "AI: JD extractor + UI", options: { ...cellBase, ...altFill } }, { text: "3–4 hrs", options: { ...cellBase, ...altFill } }],
    [{ text: "9",  options: cellBase }, { text: "AI: cover letter generator + UI", options: cellBase }, { text: "2–3 hrs", options: cellBase }],
    [{ text: "10", options: { ...cellBase, ...altFill } }, { text: "Polish: empty states, loading, errors", options: { ...cellBase, ...altFill } }, { text: "3–4 hrs", options: { ...cellBase, ...altFill } }],
    [{ text: "11", options: cellBase }, { text: "Video walkthrough + written reflection", options: cellBase }, { text: "2–3 hrs", options: cellBase }],
  ];

  s.addTable(rows, {
    x: 0.6, y: 1.2, w: 8.8,
    colW: [0.6, 6.8, 1.4],
    rowH: 0.27,
    border: { type: "solid", pt: 0.5, color: BORDER },
    fontSize: 11,
  });

  s.addText("At 8 hrs/week → ~4–5 weeks.    At 15 hrs/week → ~2.5 weeks.", {
    x: 0.6, y: 4.85, w: 8.8, h: 0.35,
    fontSize: 12, fontFace: BODY_FONT, color: BLUE, italic: true, margin: 0,
  });

  addFooter(s, 9, TOTAL);
}

// =====================================================
// Slide 10 — Stretch Goals
// =====================================================
{
  const s = pres.addSlide();
  applyBase(s);
  addTitle(s, "Stretch Goals  —  If MVP Ships Early");

  // 2x2 grid of stretch feature cards
  const stretchCards = [
    {
      name: "Email Forwarding & Auto-Status",
      body: "Forward recruiter emails to a per-user inbox. AI parses the message and suggests a status update for your review.",
    },
    {
      name: "AI Job Recommendations",
      body: "Pull listings from an external jobs API and match them against your resume to surface roles worth applying to.",
    },
    {
      name: "Conversion Analytics",
      body: "Response rate by company size, industry, and source — see which channels actually produce interviews.",
    },
    {
      name: "Follow-up Reminders",
      body: '"No reply from X in 7 days — want to send a follow-up?" Smart nudges based on application age + status.',
    },
  ];

  const gridX = 0.6, gridY = 1.4;
  const cW = 4.3, cH = 1.55, gap = 0.2;

  stretchCards.forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = gridX + col * (cW + gap);
    const y = gridY + row * (cH + gap);
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: cW, h: cH,
      fill: { color: CARD }, line: { color: BORDER, width: 1 },
    });
    s.addText(c.name, {
      x: x + 0.2, y: y + 0.15, w: cW - 0.4, h: 0.4,
      fontSize: 14, fontFace: HEAD_FONT, color: GOLD, bold: true, margin: 0,
    });
    s.addText(c.body, {
      x: x + 0.2, y: y + 0.6, w: cW - 0.4, h: cH - 0.7,
      fontSize: 11, fontFace: BODY_FONT, color: WHITE, margin: 0,
    });
  });

  // Bottom note
  s.addText("Also on the list:  CSV export   •   Dark mode   •   Mobile-friendly layout", {
    x: 0.6, y: 4.75, w: 8.8, h: 0.35,
    fontSize: 12, fontFace: BODY_FONT, color: BLUE, italic: true, margin: 0,
  });

  addFooter(s, 10, TOTAL);
}

// =====================================================
// Slide 11 — Success Criteria
// =====================================================
{
  const s = pres.addSlide();
  applyBase(s);
  addTitle(s, "What \"Done\" Looks Like");

  s.addText([
    { text: "All 4 resources support full CRUD from the UI", options: { bullet: true, breakLine: true } },
    { text: "AI JD extractor + cover letter generator work end-to-end", options: { bullet: true, breakLine: true } },
    { text: "Funnel chart updates live as statuses change", options: { bullet: true, breakLine: true } },
    { text: "Data persists across refreshes", options: { bullet: true, breakLine: true } },
    { text: "Zero unhandled errors in the golden path", options: { bullet: true } },
  ], {
    x: 0.6, y: 1.4, w: 8.8, h: 3.0,
    fontSize: 18, fontFace: BODY_FONT, color: WHITE, paraSpaceAfter: 12,
  });

  // Closing tech stack line
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 4.55, w: 8.8, h: 0.55,
    fill: { color: CARD }, line: { color: BORDER, width: 1 },
  });
  s.addText("Built with  React  •  Flask  •  SQLite  •  OpenAI", {
    x: 0.6, y: 4.55, w: 8.8, h: 0.55,
    fontSize: 13, fontFace: HEAD_FONT, color: GOLD, bold: true,
    align: "center", valign: "middle", margin: 0,
  });

  addFooter(s, 11, TOTAL);
}

pres.writeFile({ fileName: "/Users/phill/Pursuit/JobAppTracker-Pitch.pptx" })
  .then((f) => console.log("Wrote:", f));
