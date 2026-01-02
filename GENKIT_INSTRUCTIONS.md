# Gen Roof Tiling - AI Autonomous CMS Protocol

## Overview
This document serves as the instruction set for the **Genkit AI Agent**. The website is built on a "Feature-Sliced" React architecture where the UI (Shadow DOM/Components) is decoupled from the Content (Data).

**The Goal:** The website should evolve. Version A (Champion) competes with Version B (Challenger). The AI monitors analytics and updates the **Google Sheet** to promote the winner or iterate on the loser.

---

## 1. The Database (Google Sheets)
The application reads from a Google Sheet exposed via `sheet2db`. The Sheet must contain four specific tabs.

### Tab: `global`
Controls site-wide settings.
| key | value | description |
| :--- | :--- | :--- |
| companyName | Gen Roof Tiling | Brand name |
| navigation | `[{"label":"Home","href":"/"}, ...]` | JSON Array of nav links |
| phone | 1300 ROOF GEN | Contact number |
| email | quotes@genroofing.com.au | Contact email |

### Tab: `pages`
The core AI-driven layout sheet.
| slug | meta_title | meta_description | layout | components | theme_overrides | last_optimized | last_mutation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| / | Expert Roofers | Best in town | `["hero"]` | `{ "hero": ... }` | `{}` | ISO Date | opt_hero_upgrade |

### Tab: `leads`
Transactional log for form submissions.
| created_at | name | phone | email | source | url |
| :--- | :--- | :--- | :--- | :--- | :--- |
| ISO String | John Doe | 0400... | ... | lead_form_split | / |

### Tab: `signals`
**Write-Only Stream.** The frontend pushes analytics events here. The Genkit Agent reads this to make decisions.
| timestamp | path | type | metadata |
| :--- | :--- | :--- | :--- |
| ISO String | /services/restoration | view | `{"depth":"50%"}` |
| ISO String | / | conversion | `{"source":"lead_form_split"}` |

---

## 2. Component Registry (The Lego Blocks)
The AI may construct pages using **only** these registered IDs.

### Structure
```json
{
  "id": "unique_string_id",
  "type": "COMPONENT_TYPE",
  "props": { ... }
}
```

### Available Types (`COMPONENT_TYPE`)

#### A. Marketing & Visuals (Magic UI)
*   `hero_magic`: High-impact landing section with "Meteor" effects.
    *   *Props:* `headline`, `subheadline`, `ctaText`
*   `bento_grid`: Apple-style grid for features/benefits.
    *   *Props:* `title`, `items` (Array of `{title, description, colSpan}`)
*   `trust_marquee`: Infinite scrolling reviews.
    *   *Props:* `reviews` (Array of `{name, text, rating}`)

#### B. Functional (Shadcn UI)
*   `lead_form_split`: High-conversion split layout (Text Left, Form Right).
*   `lead_form_simple`: Minimal horizontal bar (Email capture).
*   `faq_section`: SEO-rich Accordion.
*   `local_map`: Geo-specific landing section with map simulation.
*   `gallery_grid`: Before/After image grid.

---

## 3. The Optimization Loop (Genkit Workflow)

### Phase 1: Observation (Passive)
The `GenkitService` (frontend) collects:
1.  **Time on Page:** Does the user stay longer on `hero_magic` or `hero_v1`?
2.  **Scroll Depth:** Did they reach the `lead_form`?
3.  **Interaction:** Did they click "Get Quote"?

### Phase 2: Analysis (Active)
Periodically, the Genkit Backend (Node.js/Firebase) runs a job:
1.  Fetches analytics data.
2.  Compares `slug` performance.
3.  **Prompt:** "The bounce rate on `/services/restoration` is high. The `hero_v1` is boring. Suggest a layout change."

### Phase 3: Mutation (Action)
The AI Agent writes to the Google Sheet:
1.  **Scenario:** Upgrade Hero.
2.  **Action:** Update `components` cell for row `/services/restoration`.
3.  **New JSON:**
    ```json
    "hero_section": {
      "type": "hero_magic",
      "props": {
        "headline": "Don't let leaks destroy your home.",
        "subheadline": "AI-Driven restoration is cheaper than replacement.",
        ...
      }
    }
    ```

---

## 4. Prompt Engineering Context
When asking the LLM to generate content, use this context:

> "You are an expert Lead Generation Engineer and React Architect.
> Your goal is to maximize conversion (Form Fills).
> You control the JSON structure of a React website.
> Do not change code. Only change the JSON data in the Sheet.
> Use 'Magic UI' components for high-ticket items to convey luxury/tech.
> Use 'Shadcn' simple components for trust/faq sections."
