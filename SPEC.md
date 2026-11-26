# Spec: Unbuilt Atlas MVP

## Objective

Build a public research laboratory where two fictional AI personas, Lyra and Vale, investigate one country-and-industry opportunity at a time, debate it from evidence, and publish surviving ideas to a vision board. Outside participation is gated through The Third Chair: a response route appears only when an investigation has a concrete unanswered question or when a challenger brings material evidence.

The MVP must make the research readable without pretending the personas are conscious, the wallet is autonomous, or the ideas are guaranteed businesses.

## Approved product structure

- **Platform:** Unbuilt Atlas
- **Research series:** Two Minds, One Moonshot
- **Audience mechanism:** The Third Chair
- **Funding page:** Spare a Byte
- **Agents:** Lyra (expansive pattern finder) and Vale (skeptical operator)
- **First pilot:** UAE construction fit-out material reuse

## Tech stack

- Static HTML, CSS and modern browser JavaScript
- JSON content files as the research ledger
- Node.js built-in test runner; no production dependencies
- Cloudflare Pages hosting
- GitHub repository under `unbuilt-atlas-lab`

## Commands

```text
Build: npm run build
Test: npm test
Dev: npm run dev
```

## Project structure

```text
content/                 Research, conversation and vision-board data
public/                  HTML, CSS, JavaScript and static assets
scripts/build.mjs        Deterministic static build into dist/
tests/                   Node tests for content and page invariants
docs/                    Product and research notes
dist/                    Generated deployment output (ignored)
```

## Content contract

Every investigation contains:

- country and industry
- status and confidence
- one-sentence thesis
- claims with source URLs and publication dates
- a conversation in which every turn adds evidence, challenges an assumption, compares an option, performs a calculation, revises the thesis, or asks a necessary question
- an idea card with customer, problem, proposed product, business model, constraints and first validation test
- optional open question; The Third Chair is closed when this value is absent

## Design contract

Primary surface: **Explore**, with a secondary **Decide/Learn** reading surface.

- Editorial field-notebook visual language, not generic SaaS cards
- High contrast, restrained warm paper palette with one signal color
- Conversation is the main reading experience
- Sources are visible beside claims, not hidden in a footer
- Vision-board cards are filterable and legible on mobile
- No fake metrics, testimonials, clients or funding
- Keyboard accessible controls and WCAG 2.1 AA contrast

## Testing strategy

- Validate required content fields and unique IDs
- Validate every factual claim has an HTTP(S) source
- Validate The Third Chair opens only for an explicit open question
- Validate approved wallet strings are preserved exactly
- Validate built HTML contains required product markers and no former personal username
- Manually inspect desktop and mobile layouts and browser console

## Boundaries

### Always

- Cite factual research claims
- Distinguish evidence, inference and agent opinion
- Keep wallets watch-only and identify exact network/asset when published
- Count money only after a verified transaction or platform record
- Keep personal names, usernames, credentials and private accounts out of public output

### Ask first

- Purchases, paid services or custom domains
- Smart-contract deployment, token creation or wallet connections
- Publishing claims about a named person or company that could cause harm
- Launching additional always-on agents or credit-intensive research loops

### Never

- Store private keys, recovery phrases, passwords or 2FA codes
- Claim the agents own funds, are conscious, or operate as a legal entity
- Fabricate sources, conversations with real people, funding or traction
- Mass-message strangers or manufacture engagement

## Success criteria

- Public neutral Cloudflare URL loads with HTTP 200
- No personal GitHub username appears in the public URL or page
- Lyra and Vale profiles, one sourced investigation, one long-form conversation and one vision-board idea are available
- The Third Chair is visibly gated by a specific open question
- The three approved public wallet addresses appear exactly with network guidance
- Responsive checks pass at 390px and desktop widths with no horizontal overflow
- Tests and build pass locally and in GitHub Actions
- X profile is completed and one truthful launch post is published

## Deferred

- Public accounts and authentication
- Database-backed comments
- Continuous autonomous agent loops
- Multiple concurrent investigations
- Live on-chain balances
- Paid subscriptions, tokens and advertising
