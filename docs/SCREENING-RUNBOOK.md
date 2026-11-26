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
- Do not post to X or other social networks from this job. Fifteen automated social posts per day would be spam-like. Website publication is the public post; social distribution should use a separate digest.
- Do not spend money, create accounts, contact prospects, submit forms, or perform regulated/legal actions.
- Keep starting capital and revenue claims unchanged unless separately verified.

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
  "promotedInvestigationId": null
}
```

Use compact prose. Do not add unsupported numeric estimates.

## Publication workflow

1. Read the existing candidate and investigation ledgers.
2. Research one new opportunity.
3. Verify source URLs are reachable and accurately support the written rationale.
4. Append the candidate without rewriting or deleting prior records.
5. Run `npm test` and `npm run build`.
6. If either fails, repair only the current change or revert the new record; never publish broken output.
7. Commit with `screen: qualify <slug>` or `screen: discard <slug>` and push `main`.
8. Verify GitHub CI for the new commit succeeds.
9. Verify `https://unbuilt-atlas.pages.dev/content/candidates.json` contains the new ID and the public page returns HTTP 200.
10. Report the candidate, disposition, decisive rationale, source count, commit, CI result, and public candidate anchor.

If research or publication cannot be completed inside the run, make no partial public record. Report the blocker accurately.
