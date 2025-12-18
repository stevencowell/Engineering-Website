# QA Fix Log

Generated: 2025-12-13

This log records the minimal, safety-focused edits made to reduce “hallucination risk” around outcomes, syllabus wording, policy-style claims, and internal link credibility.

## Changes

- `year9_program_complete.html`
  - Corrected IND5 outcome wording to match the Industrial Technology Years 7–10 Syllabus (2019), including fixing the IND5-6/IND5-7 mismatch (IND5-6 is collaborative work practices; IND5-7 is skills transfer).
  - Updated the EGT5 “Post-2027 Outcomes Alignment” block to clearly label student-friendly summaries vs official outcome wording, and corrected EGT5-GRP-01 to technical graphics (not “collaboration”).
  - Fixed the broken internal link to `Term 2 images/concrete testing.gif` (removed incorrect `../`).

- `Year 9 Engineering Program - Complete Scope and Sequence.md`
  - Corrected IND5 outcome wording (including IND5-6/IND5-7) and added a brief note pointing to the syllabus PDF as the wording source.
  - Updated the EGT5 alignment section to clearly label student-friendly summaries vs official wording, and corrected EGT5-GRP-01 to technical graphics.
  - Fixed the broken markdown link to `Term 2 images/concrete testing.gif` (removed incorrect `../`).

- `year9_term1.html`, `year9_term2.html`, `year9_term4.html`
  - Updated each EGT5 alignment list item to include:
    - `Student-friendly summary (not official wording): …`
    - `Official wording: …`
  - Removed/avoided implying EGT5-GRP-01 means “collaboration”; aligned it to technical graphics.

- `Year9 T2 Modules/toolkit2 Term 2.html`
  - Reworked the in-paragraph “EGT5-MEA-01: …” phrasing so it cannot be mistaken as official wording, and added the official wording explicitly.

- `QA_OUTCOMES_AUDIT.md`
  - Regenerated the repository-wide inventory after fixes so it reflects the current state of outcome references and labelling.

## Policy/requirements claim pass

- Searched for NESA/DoE “requirement-style” claims (e.g., “NESA requires…”, minimum hours/minutes, mandatory modules). No high-risk, unsourced policy claims were found that needed neutralising in the website pages.

## Link validation

- Re-checked internal `href`/`src` targets across HTML pages; no broken internal links remain in the scanned pages after the fixes above.

