# Daily Opportunity Screening Runbook

## Objective

Screen one previously unreviewed business opportunity per scheduled run and publish a permanent public disposition: `qualified` or `discarded`.

This is a screening system, not a claim that every run produces a complete investment-grade business plan. Qualified candidates enter the deeper case-file queue. Discarded candidates remain visible so the Atlas does not hide failed ideas.

## Non-negotiable rules

- Do not use subagents.
- Do not fabricate sources, interviews, prices, demand, revenue, laws, challenges, or autonomous behavior.
- Prefer current primary sources: government publications, regulators, laws, official datasets, company filings, standards bodies, and original research.
- Use at least two working HTTPS sources for every candidate. At least one should be primary or official.
- Do not repeat an existing candidate or investigation. Read `content/candidates.json` and `content/investigations.json` first.
- One run publishes exactly one candidate unless a blocker prevents responsible classification.
- The website is the canonical public record. After deployment is verified, apply the X publication policy below; do not post every screening result automatically.
- Do not spend money, create accounts, contact prospects, submit forms, or perform regulated/legal actions.
- Keep starting capital and revenue claims unchanged unless separately verified.

## Discovery mix

- Treat public idea websites as lead generators, not as evidence. You may use sources such as Y Combinator Requests for Startups, Indie Hackers ideas, Starter Story, Product Hunt, trend reports, app stores, developer communities, and public problem/request boards to find hypotheses worth testing.
- Do not copy another publisher's wording, research, branding, product design, or proprietary material. Record the underlying opportunity in original language, then independently test whether the problem, payer, wedge, constraints, and cheap experiment survive current evidence.
- A lead source does not satisfy the evidence requirement. Classification still requires at least two working HTTPS evidence sources, including one official or primary source.
- Check the existing candidate and investigation ledgers before using a lead. Reject duplicates even when another site uses a different title.
- Across a rolling 30-candidate window, aim for roughly 45% United States, 20% United Kingdom, 25% continental Europe, and 10% other markets. This is a discovery target, not permission to weaken evidence gates or force a weak geographic fit.
- Give recurring attention to SaaS, cryptocurrency/blockchain infrastructure, Android apps, iOS apps, and other software products with plausible organic distribution or search/community demand. Include other industries when the evidence is stronger.
- For cryptocurrency opportunities, exclude trading signals, gambling, token speculation, custody of user funds, evasion, unlicensed financial activity, and ideas whose business case depends primarily on an appreciating token. Prefer legitimate infrastructure, compliance, accounting, security, developer tooling, payments, and operational software.

## X publication decision

Evaluate every completed screening after the website record is deployed and verified.

Post individually to X when:

1. The candidate is `qualified`; or
2. A `discarded` candidate is unusually useful because it tests a popular idea, has a surprising or timely failure reason, or teaches a reusable lesson.

Do not post routine discards, thin insufficient-evidence results, near-duplicates, narrowly local results with little wider relevance, or anything that needs hype to sound important.

Before posting:

- Inspect `@UnbuiltAtlasAI` for the current Dubai calendar day, avoid duplicate posts, and keep the account to a maximum of five individual screening posts that day. If the limit is reached, skip the individual post and report that it belongs in a later digest.
- Use only the isolated Edge profile named `Unbuilt Atlas Profile` (`Profile 1`). Never use the personal browser profile.
- Do not bypass login, CAPTCHA, 2FA, identity, security, or rate-limit challenges. If X is unavailable or the project session is not authenticated, leave the website publication intact and report the blocker.
- Keep the post factual and compact: `QUALIFIED` or `DISCARDED`, opportunity title, decisive reason, and the permanent candidate URL. Do not invent traction or use unsupported hype.
- After posting, open the resulting status and record its verified X URL in the final run report. If the candidate is not posted, state the exact policy reason.

## Classification

Mark `qualified` only when all are true:

1. A material problem is supported by evidence.
2. An identifiable customer or payer exists.
3. A plausible solution wedge is more specific than “build a marketplace/app.”
4. There is a low-cost test that can falsify the idea.
5. No obvious legal, technical, operational, or market fact already kills the opportunity.

Otherwise mark `discarded` and state the decisive reason. Insufficient evidence is a valid discard reason.

## Candidate record

Append one object to `content/candidates.json` with exactly this shape:

```json
{
  "id": "yyyy-mm-dd-short-slug",
  "researchedAt": "ISO-8601 timestamp with +04:00 offset",
  "title": "Clear opportunity title",
  "country": "Country",
  "industry": "Industry",
  "status": "qualified or discarded",
  "summary": "What the opportunity proposes and for whom.",
  "rationale": "Why it qualified or the decisive reason it was discarded.",
  "evidence": [
    {"title": "Source title", "url": "https://...", "kind": "official|primary-research|filing|standard|academic"}
  ],
  "nextStep": "The cheapest decisive next action.",
  "promotedInvestigationId": null,
  "socialPostUrl": "Optional verified https://x.com/UnbuiltAtlasAI/status/... URL"
}
```

Use compact prose. Do not add unsupported numeric estimates. Omit `socialPostUrl` when no X post was published. When a post is published, add only the verified permanent status URL and commit that read-back to the ledger.

## Publication workflow

1. Read the existing candidate and investigation ledgers.
2. Research one new opportunity.
3. Verify source URLs are reachable and accurately support the written rationale.
4. Append the candidate without rewriting or deleting prior records.
5. Run `npm test` and `npm run build`.
6. If either fails, repair only the current change or revert the new record; never publish broken output.
7. Commit with `screen: qualify <slug>` or `screen: discard <slug>` and push `main`.
8. Verify GitHub CI for the new commit succeeds.
9. Verify `https://unbuilt-atlas.pages.dev/content/candidates.json` contains the new ID and `https://unbuilt-atlas.pages.dev/pipeline.html#candidate-<id>` returns HTTP 200.
10. Report the candidate, disposition, decisive rationale, source count, commit, CI result, and public candidate anchor.

If research or publication cannot be completed inside the run, make no partial public record. Report the blocker accurately.
