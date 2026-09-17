# ANR NEWS — Editorial & Technical Architecture Specification

This specification documents the frontend design tokens, grid geometry, and backend editorial pipeline for ANR NEWS.

---

## 1. Frontend Design Tokens

### Typography Matrix
- **Masthead**: `Cinzel` / Blackletter serif, `72px` desktop, uppercase tracking tight.
- **Lead Headlines**: `Newsreader` (Cheltenham revival), `36px` desktop / `28px` mobile, line-height `1.12`.
- **Deck / Excerpts**: `Newsreader` regular, `18px`, color `#666666`, line-height `1.35`.
- **Body Copy**: `Newsreader` text, `18px`, line-height `1.65`.
- **Metadata & UI**: `Plus Jakarta Sans`, `11px–12px`, uppercase tracking `0.05em`.

### Color & Theming Tokens
- **Day (Editorial White)**:
  - Background: `#FFFFFF`
  - Text Primary: `#121212`
  - Borders: `#E2E2E2`
  - Double Rules: `3px double #121212`
  - Accent Red: `#D0021B` (Breaking News, Live Updates)
  - Accent Blue: `#326891` (Categories & Links)
- **Paper (Vintage Sepia)**:
  - Background: `#F5EFEB`
  - Text Primary: `#241D17`
  - Borders: `#E0D4C5`
- **Night (OLED Low-Light)**:
  - Background: `#121316`
  - Text Primary: `#F2F4F7`
  - Borders: `#2D313A`

---

## 2. The 3-Column Desktop Grid Layout

The layout uses a 12-column CSS grid divided into classic editorial proportions:
- **Columns 1–5 (41.6% width)**: Lead Investigation (A-Hed anchor story, high-res 16:9 photo, caption, audio player, drop cap).
- **Columns 6–9 (33.3% width)**: Secondary stories & analysis with media thumbnails and cooking/culture widgets.
- **Columns 10–12 (25.0% width)**: Opinion rail with circular author portraits, daily columns, and morning newsletter subscription module.

---

## 3. Newsroom CMS Pipeline (Scoop & Oak System)

```
[ Reporter Drafts in Oak Canvas ]
                ↓
[ Headline Character Fit Check (<= 80 chars) ]
                ↓
[ Copy Desk Standards Checklist (AP Style, Sources) ]
                ↓
[ Legal Review Screening (Defamation, Redactions) ]
                ↓
[ Scoop Section Front Curator (Slot Assignment) ]
                ↓
[ Publish to Live Front Page & Mobile Push Alert ]
```
