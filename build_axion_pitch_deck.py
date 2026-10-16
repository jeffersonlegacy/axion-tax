from pathlib import Path

from PIL import Image
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "output" / "pdf" / "axion-owner-pitch-deck.pdf"
IMG = ROOT / "output" / "playwright"

PAGE_W = 13.333 * 72
PAGE_H = 7.5 * 72
MARGIN = 42

BG = HexColor("#0a0a0b")
PANEL = HexColor("#111216")
PANEL_2 = HexColor("#171018")
ACCENT = HexColor("#e23b3b")
ACCENT_SOFT = HexColor("#ffb6b6")
TEXT = HexColor("#f3f3f4")
MUTED = HexColor("#b8bcc7")
LINE = Color(1, 1, 1, alpha=0.08)


def fit_rect(img_path, x, y, w, h):
    with Image.open(img_path) as im:
        iw, ih = im.size
    scale = min(w / iw, h / ih)
    dw = iw * scale
    dh = ih * scale
    dx = x + (w - dw) / 2
    dy = y + (h - dh) / 2
    return dx, dy, dw, dh


def fill_rect(img_path, x, y, w, h):
    with Image.open(img_path) as im:
        iw, ih = im.size
    scale = max(w / iw, h / ih)
    dw = iw * scale
    dh = ih * scale
    dx = x + (w - dw) / 2
    dy = y + (h - dh) / 2
    return dx, dy, dw, dh


def new_page(c):
    c.setFillColor(BG)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)


def footer(c, page_num):
    c.setStrokeColor(LINE)
    c.line(MARGIN, 24, PAGE_W - MARGIN, 24)
    c.setFont("Helvetica", 9)
    c.setFillColor(MUTED)
    c.drawString(MARGIN, 10, "AXION owner proposal")
    c.drawRightString(PAGE_W - MARGIN, 10, f"{page_num:02d}")


def eyebrow(c, text, x, y):
    c.setFillColor(ACCENT_SOFT)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x, y, text.upper())


def title(c, text, x, y, size=28):
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", size)
    c.drawString(x, y, text)


def body_lines(c, lines, x, y, width=380, leading=18, bullet=True, color=MUTED, size=12):
    c.setFont("Helvetica", size)
    c.setFillColor(color)
    cursor_y = y
    for raw in lines:
        prefix = "• " if bullet else ""
        text = prefix + raw
        words = text.split()
        line = ""
        rows = []
        for word in words:
            trial = (line + " " + word).strip()
            if stringWidth(trial, "Helvetica", size) <= width:
                line = trial
            else:
                rows.append(line)
                line = word
        if line:
            rows.append(line)
        for row in rows:
            c.drawString(x, cursor_y, row)
            cursor_y -= leading
        cursor_y -= 6
    return cursor_y


def stat_box(c, x, y, w, h, big, small):
    c.setFillColor(PANEL)
    c.roundRect(x, y, w, h, 16, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, w, h, 16, fill=0, stroke=1)
    c.setFillColor(ACCENT_SOFT)
    c.setFont("Helvetica-Bold", 24)
    c.drawString(x + 16, y + h - 34, big)
    c.setFillColor(TEXT)
    c.setFont("Helvetica", 11)
    c.drawString(x + 16, y + h - 52, small)


def screenshot_card(c, img_path, x, y, w, h, caption=None):
    c.setFillColor(PANEL)
    c.roundRect(x, y, w, h, 20, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, w, h, 20, fill=0, stroke=1)
    ix, iy, iw, ih = fit_rect(img_path, x + 12, y + 12, w - 24, h - 38)
    c.drawImage(ImageReader(str(img_path)), ix, iy, width=iw, height=ih, mask="auto")
    if caption:
        c.setFont("Helvetica", 10)
        c.setFillColor(MUTED)
        c.drawString(x + 14, y + 10, caption)


def cover_page(c):
    new_page(c)
    img = IMG / "home-hero.png"
    ix, iy, iw, ih = fill_rect(img, 0, 0, PAGE_W, PAGE_H)
    c.drawImage(ImageReader(str(img)), ix, iy, width=iw, height=ih, mask="auto")
    c.setFillColor(Color(0, 0, 0, alpha=0.55))
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    c.setFillColor(ACCENT_SOFT)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(MARGIN, PAGE_H - 60, "AXION OWNER PROPOSAL")
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 30)
    c.drawString(MARGIN, PAGE_H - 100, "AXION can be more than a tax website.")
    c.setFont("Helvetica-Bold", 22)
    c.drawString(MARGIN, PAGE_H - 132, "It can be a premium client system.")

    lines = [
        "Built from the actual live product screens.",
        "Designed to show how AXION can increase trust, reduce cleanup time, and support higher-value tax work.",
    ]
    body_lines(c, lines, MARGIN, PAGE_H - 180, width=470, bullet=False, size=13, color=TEXT, leading=20)

    c.setFillColor(Color(0, 0, 0, alpha=0.45))
    c.roundRect(MARGIN, 42, 390, 54, 18, fill=1, stroke=0)
    c.setFillColor(TEXT)
    c.setFont("Helvetica", 12)
    c.drawString(MARGIN + 18, 72, "Prepared as a business proposal for AXION leadership.")
    footer(c, 1)
    c.showPage()


def opportunity_page(c):
    new_page(c)
    eyebrow(c, "The opportunity", MARGIN, PAGE_H - 44)
    title(c, "Most firms still lose time before the meeting even starts.", MARGIN, PAGE_H - 78, size=24)

    left = [
        "Clients arrive missing documents, unsure where files belong, and unclear on tax terms.",
        "Preparers burn high-value time on intake cleanup instead of strategy, judgment, and advisory work.",
        "AXION moves that clarity earlier by combining a premium brand, a guided prep flow, and bilingual support.",
    ]
    body_lines(c, left, MARGIN, PAGE_H - 122, width=420, size=13, leading=19)

    stat_box(c, MARGIN, 120, 180, 84, "66-100 hrs", "Recovered at 200 clients if AXION saves 20-30 minutes each")
    stat_box(c, MARGIN + 196, 120, 180, 84, "$9.9k-$30k", "Recovered value at $150-$300 per hour")
    stat_box(c, MARGIN + 392, 120, 180, 84, "166-250 hrs", "Recovered at 500 clients")

    screenshot_card(c, IMG / "home-faxion.png", 600, 86, 300, 370, "Interactive trust-building education on the homepage")

    footer(c, 2)
    c.showPage()


def public_funnel_page(c):
    new_page(c)
    eyebrow(c, "Public experience", MARGIN, PAGE_H - 44)
    title(c, "The site already sells trust before the client signs in.", MARGIN, PAGE_H - 78, size=24)

    bullets = [
        "Homepage positioning feels premium and modern instead of generic tax-season marketing.",
        "AXION Items now previews value publicly while keeping the real working tools exclusive to clients.",
        "That structure increases perceived value and gives visitors a reason to open a workspace.",
    ]
    body_lines(c, bullets, MARGIN, PAGE_H - 124, width=350, size=12.5, leading=18)

    screenshot_card(c, IMG / "tools-preview.png", 420, 96, 500, 350, "Public AXION Items preview with locked client benefits")
    screenshot_card(c, IMG / "tools-calendar.png", 420, 24, 500, 64, "Public utility tool keeps the page useful even before sign-up")

    footer(c, 3)
    c.showPage()


def portal_page(c):
    new_page(c)
    eyebrow(c, "Portal workflow", MARGIN, PAGE_H - 44)
    title(c, "The portal is where AXION starts creating operational leverage.", MARGIN, PAGE_H - 78, size=24)

    bullets = [
        "One workspace for booking, uploading, preparation, and client updates.",
        "This reduces friction for first-time clients and keeps the firm in control of intake quality.",
        "The experience already looks closer to a premium client dashboard than a standard tax intake page.",
    ]
    body_lines(c, bullets, MARGIN, PAGE_H - 124, width=360, size=12.5, leading=18)

    screenshot_card(c, IMG / "portal-access.png", 392, 268, 520, 180, "Portal entry and positioning")
    screenshot_card(c, IMG / "portal-overview.png", 392, 32, 520, 220, "Client dashboard with next-step guidance")

    footer(c, 4)
    c.showPage()


def prep_page(c):
    new_page(c)
    eyebrow(c, "Preparation quality", MARGIN, PAGE_H - 44)
    title(c, "Cleaner document intake means better meetings and fewer delays.", MARGIN, PAGE_H - 78, size=24)

    bullets = [
        "The document lanes are simple enough for a normal client to understand: jobs, business, and personal information.",
        "This alone can cut down follow-up emails, duplicate uploads, and last-minute missing forms.",
        "A cleaner packet means the meeting can move faster into strategy, corrections, and higher-value advisory work.",
    ]
    body_lines(c, bullets, MARGIN, PAGE_H - 124, width=355, size=12.5, leading=18)
    screenshot_card(c, IMG / "portal-documents.png", 402, 84, 510, 360, "Dedicated upload lanes reduce terminology overload")

    footer(c, 5)
    c.showPage()


def differentiation_page(c):
    new_page(c)
    eyebrow(c, "Differentiation", MARGIN, PAGE_H - 44)
    title(c, "Axion Familia tools make the service feel premium, not commodity.", MARGIN, PAGE_H - 78, size=24)

    bullets = [
        "The language decoder, amortization lab, reserve planner, and IRS capture workflow make AXION feel more useful than a normal tax office site.",
        "These tools support real client behavior: finding missing forms, learning what terms mean, and arriving better prepared.",
        "This is where brand perception shifts from 'tax preparer' to 'high-value advisory experience.'",
    ]
    body_lines(c, bullets, MARGIN, PAGE_H - 124, width=355, size=12.5, leading=18)
    screenshot_card(c, IMG / "portal-familia-tools.png", 398, 84, 514, 360, "Client-only tools reinforce premium positioning")

    footer(c, 6)
    c.showPage()


def economics_page(c):
    new_page(c)
    eyebrow(c, "Financial case", MARGIN, PAGE_H - 44)
    title(c, "Even modest time savings create meaningful upside.", MARGIN, PAGE_H - 78, size=24)

    stat_box(c, MARGIN, 324, 210, 92, "20-30 min", "Estimated prep time AXION can save per client")
    stat_box(c, MARGIN + 228, 324, 210, 92, "200 clients", "Season scenario for a growing tax practice")
    stat_box(c, MARGIN + 456, 324, 210, 92, "500 clients", "Season scenario for a scaled practice")

    bullets = [
        "At 200 clients, 20-30 minutes saved each becomes roughly 66-100 hours recovered.",
        "At 500 clients, the same lift becomes roughly 166-250 hours recovered.",
        "At $150-$300 per hour of professional value, that is roughly $9,900-$75,000 in recovered capacity.",
        "That does not include better conversion, stronger retention, or a higher-end client perception.",
    ]
    body_lines(c, bullets, MARGIN, PAGE_H - 160, width=610, size=13, leading=20)

    c.setFillColor(PANEL_2)
    c.roundRect(710, 84, 210, 220, 18, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.roundRect(710, 84, 210, 220, 18, fill=0, stroke=1)
    c.setFillColor(ACCENT_SOFT)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(728, 278, "What AXION is buying back")
    body_lines(
        c,
        [
            "prep hours",
            "review capacity",
            "client confidence",
            "premium positioning",
            "room for strategy",
        ],
        728,
        252,
        width=170,
        size=12,
        leading=18,
    )

    footer(c, 7)
    c.showPage()


def roadmap_page(c):
    new_page(c)
    eyebrow(c, "Rollout", MARGIN, PAGE_H - 44)
    title(c, "The path to production is measured in days and weeks, not quarters.", MARGIN, PAGE_H - 78, size=24)

    phases = [
        ("Phase 1: Production ready", "Days", [
            "final polish and QA",
            "tighten wording and flow",
            "deploy stable live version",
        ]),
        ("Phase 2: Revenue leverage", "1-3 weeks", [
            "optimize lead-to-portal flow",
            "refine notifications and intake guidance",
            "expand public utility tools like unclaimed funds search",
        ]),
        ("Phase 3: Premium differentiation", "1-2 months", [
            "deeper advisory tools",
            "behavior analytics and funnel data",
            "stronger premium positioning for higher-value engagements",
        ]),
    ]

    x = MARGIN
    for phase, timing, items in phases:
        c.setFillColor(PANEL)
        c.roundRect(x, 132, 272, 258, 18, fill=1, stroke=0)
        c.setStrokeColor(LINE)
        c.roundRect(x, 132, 272, 258, 18, fill=0, stroke=1)
        c.setFillColor(ACCENT_SOFT)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(x + 16, 364, phase)
        c.setFillColor(TEXT)
        c.setFont("Helvetica-Bold", 24)
        c.drawString(x + 16, 334, timing)
        body_lines(c, items, x + 16, 302, width=228, size=12, leading=18)
        x += 290

    footer(c, 8)
    c.showPage()


def close_page(c):
    new_page(c)
    c.setFillColor(PANEL_2)
    c.roundRect(MARGIN, 86, PAGE_W - (MARGIN * 2), PAGE_H - 172, 24, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.roundRect(MARGIN, 86, PAGE_W - (MARGIN * 2), PAGE_H - 172, 24, fill=0, stroke=1)

    eyebrow(c, "Bottom line", MARGIN + 28, PAGE_H - 122)
    title(c, "AXION already has the structure of a stronger firm.", MARGIN + 28, PAGE_H - 156, size=26)

    bullets = [
        "It can act as a premium digital front door.",
        "It can reduce prep chaos before appointments.",
        "It can free up professional time for better tax work.",
        "It can help AXION compete like a modern advisory brand instead of a standard prep office.",
    ]
    body_lines(c, bullets, MARGIN + 28, PAGE_H - 208, width=520, size=14, leading=22)

    c.setFillColor(ACCENT)
    c.roundRect(PAGE_W - 286, 134, 200, 84, 18, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(PAGE_W - 260, 186, "Recommended next move")
    c.setFont("Helvetica", 12)
    c.drawString(PAGE_W - 260, 164, "Finalize, deploy, and use the")
    c.drawString(PAGE_W - 260, 146, "portal workflow as the core offer.")

    footer(c, 9)
    c.showPage()


def main():
    c = canvas.Canvas(str(OUT), pagesize=(PAGE_W, PAGE_H))
    cover_page(c)
    opportunity_page(c)
    public_funnel_page(c)
    portal_page(c)
    prep_page(c)
    differentiation_page(c)
    economics_page(c)
    roadmap_page(c)
    close_page(c)
    c.save()
    print(OUT)


if __name__ == "__main__":
    main()
