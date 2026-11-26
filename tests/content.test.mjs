import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../content/site.json', import.meta.url)));
const investigations = JSON.parse(await readFile(new URL('../content/investigations.json', import.meta.url)));
const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');

const requiredWallets = [
  'GA1zjTdMNSTfJFeLnA84bd4kyEHJuqZPSZsCuM3uyYx8',
  'bc1px9nztr2n2hwp9u5jsfthmlk47etkxqcldwzj982yqj8vjnq8wtnqdsjchu',
  '0xd95FAE8Ccb5aC39Ee058858f5cb3c6d4E44932f3'
];

test('brand and agent contract is complete', () => {
  assert.equal(site.brand, 'Unbuilt Atlas');
  assert.deepEqual(site.agents.map(agent => agent.id), ['lyra', 'vale']);
  assert.equal(new Set(site.agents.map(agent => agent.id)).size, site.agents.length);
  for (const agent of site.agents) {
    assert.ok(agent.stance && agent.story && agent.rule);
    assert.match(agent.avatar, /^\/avatars\/.+\.svg$/);
  }
});

test('approved wallets are preserved exactly', () => {
  assert.deepEqual(site.wallets.map(wallet => wallet.address), requiredWallets);
});

test('investigations have sourced claims and complete case files', () => {
  assert.ok(investigations.length > 0);
  for (const investigation of investigations) {
    assert.ok(investigation.id && investigation.title && investigation.idea);
    assert.ok(investigation.conversation.length >= 10);
    assert.ok(investigation.claims.length >= 3);
    for (const claim of investigation.claims) {
      assert.match(claim.source, /^https:\/\//);
      assert.ok(claim.statement.length > 30);
    }
    const claimIds = new Set(investigation.claims.map(claim => claim.id));
    for (const turn of investigation.conversation) {
      assert.ok(['lyra', 'vale'].includes(turn.agent));
      assert.ok(turn.text.length > 40);
      for (const claimId of turn.claimIds) assert.ok(claimIds.has(claimId));
    }
    assert.ok(investigation.conversationPhases.length >= 3);
    assert.equal(investigation.conversationPhases.at(-1).endTurn, investigation.conversation.length);
    assert.ok(investigation.verdict.decision && investigation.verdict.nextGate);
    assert.ok(investigation.businessPlan.sections.length >= 8);
    const confidenceTotal = investigation.confidenceMethod.factors.reduce((total, factor) => total + factor.score, 0);
    assert.equal(confidenceTotal, investigation.confidence);
    assert.deepEqual(investigation.idea.evidenceIds, investigation.claims.map(claim => claim.id));
  }
});

test('The Third Chair opens only for an explicit question', () => {
  for (const investigation of investigations) {
    const isOpen = investigation.status === 'third-chair-open';
    assert.equal(isOpen, Boolean(investigation.openQuestion));
    if (isOpen) {
      assert.ok(investigation.openQuestion.question.endsWith('?'));
      assert.match(investigation.openQuestion.responseEmail, /@/);
    }
  }
});

test('public shell contains required product markers and no former username', () => {
  for (const marker of ['Unbuilt Atlas', 'The Third Chair', 'Spare a Byte', 'Vision board']) {
    assert.ok(html.includes(marker), `missing ${marker}`);
  }
  assert.ok(!html.toLowerCase().includes('jjjawad'));
  assert.match(html, /<main id="main">/);
  assert.match(html, /class="skip-link"/);
});
