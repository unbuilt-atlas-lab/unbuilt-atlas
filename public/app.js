const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

async function loadData() {
  const [siteResponse, investigationsResponse, candidatesResponse] = await Promise.all([
    fetch('/content/site.json'),
    fetch('/content/investigations.json'),
    fetch('/content/candidates.json')
  ]);
  if (!siteResponse.ok || !investigationsResponse.ok || !candidatesResponse.ok) throw new Error('The research ledger could not be loaded.');
  return { site: await siteResponse.json(), investigations: await investigationsResponse.json(), candidates: await candidatesResponse.json() };
}

function renderAgents(agents) {
  const container = $('#agent-cards');
  if (!container) return;
  container.innerHTML = agents.map(agent => `
    <article class="agent-card ${escapeHtml(agent.id)}">
      <img class="agent-avatar" src="${escapeHtml(agent.avatar)}" alt="Illustrated portrait of ${escapeHtml(agent.name)}">
      <div>
        <span class="agent-role">${escapeHtml(agent.role)}</span>
        <h2>${escapeHtml(agent.name)}</h2>
        <strong class="agent-stance">${escapeHtml(agent.stance)}</strong>
        <p>${escapeHtml(agent.stanceDetail)}</p>
        <details class="agent-story"><summary>Who is ${escapeHtml(agent.name)}?</summary><p>${escapeHtml(agent.story)}</p><p><strong>Rule:</strong> ${escapeHtml(agent.rule)}</p></details>
      </div>
    </article>`).join('');
}

function renderCaseIndex(investigations, activeId) {
  const container = $('#case-index');
  if (!container) return;
  container.innerHTML = investigations.map(investigation => `
    <article class="case-row ${investigation.id === activeId ? 'active' : ''}">
      <div class="case-number">${escapeHtml(investigation.number)}</div>
      <div><span>${escapeHtml(investigation.country)} · ${escapeHtml(investigation.industry)}</span><h3>${escapeHtml(investigation.title)}</h3><p>${escapeHtml(investigation.summary || investigation.thesis)}</p></div>
      <div class="case-state"><strong>${escapeHtml(investigation.idea.state)}</strong><span>${escapeHtml(investigation.confidence)}% research confidence</span><a href="/case.html?investigation=${encodeURIComponent(investigation.id)}#room">${investigation.id === activeId ? 'Read this case' : 'Open case file'} →</a></div>
    </article>`).join('');
}

function renderIdeaBrief(investigation) {
  const container = $('#idea-brief');
  if (!container) return;
  const idea = investigation.idea;
  const rows = [
    ['Customer', idea.customer],
    ['Problem', idea.problem],
    ['Product', idea.product],
    ['Business model', idea.businessModel],
    ['First test', idea.firstTest],
    ['Biggest risk', idea.biggestRisk]
  ];
  container.innerHTML = `
    <span class="eyebrow">Current survivor</span>
    <h3>${escapeHtml(idea.name)}</h3>
    <nav class="brief-links" aria-label="Case file sections"><a href="#${escapeHtml(idea.transcriptAnchor)}">Full transcript</a><a href="#evidence-ledger">Evidence ledger</a><a href="#failed-arguments">Failed arguments</a><a href="#${escapeHtml(idea.planAnchor)}">Business plan</a><a href="#third-chair">Challenge</a></nav>
    ${rows.map(([label, text]) => `<div class="brief-row"><span>${escapeHtml(label)}</span><p>${escapeHtml(text)}</p></div>`).join('')}`;
}

function renderConfidence(investigation) {
  const container = $('#confidence-panel');
  if (!container) return;
  const method = investigation.confidenceMethod;
  container.innerHTML = `<div class="confidence-copy"><span class="eyebrow">${escapeHtml(method.label)}</span><p>${escapeHtml(method.explanation)}</p></div><div class="confidence-factors">${method.factors.map(factor => `<article><div><strong>${escapeHtml(factor.name)}</strong><span>${factor.score} / ${factor.max}</span></div><div class="factor-meter"><i style="width:${Math.round((factor.score / factor.max) * 100)}%"></i></div><p>${escapeHtml(factor.reason)}</p></article>`).join('')}</div>`;
}

function renderEvidence(investigation) {
  const container = $('#evidence-ledger');
  if (!container) return;
  const turnsByClaim = new Map();
  investigation.conversation.forEach((turn, index) => turn.claimIds.forEach(claimId => {
    if (!turnsByClaim.has(claimId)) turnsByClaim.set(claimId, []);
    turnsByClaim.get(claimId).push(index + 1);
  }));
  container.innerHTML = investigation.claims.map(claim => {
    const turns = turnsByClaim.get(claim.id) || [];
    return `<article class="evidence-item" id="evidence-${escapeHtml(claim.id)}"><span class="evidence-id">${escapeHtml(claim.id.toUpperCase())}</span><div><p>${escapeHtml(claim.statement)}</p><small>${escapeHtml(claim.sourceTitle)} · ${escapeHtml(claim.date)} · ${escapeHtml(claim.kind)}</small>${turns.length ? `<div class="used-in">Used in ${turns.map(turn => `<a href="#turn-${turn}">turn ${String(turn).padStart(2, '0')}</a>`).join(', ')}</div>` : ''}</div><a href="${escapeHtml(claim.source)}" target="_blank" rel="noreferrer">Open source ↗</a></article>`;
  }).join('');
}

function renderConversation(investigation, agents) {
  const container = $('#conversation');
  if (!container) return;
  const claims = new Map(investigation.claims.map(claim => [claim.id, claim]));
  const agentsById = new Map(agents.map(agent => [agent.id, agent]));
  const phaseStarts = new Map(investigation.conversationPhases.map(phase => [phase.startTurn, phase]));
  const items = [];
  investigation.conversation.forEach((turn, index) => {
    const turnNumber = index + 1;
    const phase = phaseStarts.get(turnNumber);
    if (phase) items.push(`<li class="phase-divider" id="phase-${escapeHtml(phase.id)}"><span>${escapeHtml(phase.label)}</span><strong>${escapeHtml(phase.question)}</strong><small>Turns ${String(phase.startTurn).padStart(2, '0')}–${String(phase.endTurn).padStart(2, '0')}</small></li>`);
    const agent = agentsById.get(turn.agent);
    items.push(`<li class="turn ${escapeHtml(turn.agent)}" id="turn-${turnNumber}"><div class="turn-agent"><img src="${escapeHtml(agent.avatar)}" alt=""><span>${escapeHtml(agent.name)}</span><small>${escapeHtml(agent.stance)}</small></div><div><div class="turn-topline"><span class="turn-number">Turn ${String(turnNumber).padStart(2, '0')}</span><span class="turn-mode">${escapeHtml(turn.mode)}</span></div><blockquote>${escapeHtml(turn.text)}</blockquote>${turn.claimIds.length ? `<div class="citations">${turn.claimIds.map(id => { const claim = claims.get(id); return `<a class="citation" href="#evidence-${escapeHtml(id)}" data-source="${escapeHtml(claim.source)}" aria-label="Read evidence ${escapeHtml(id)} in the ledger">${escapeHtml(id.toUpperCase())} · evidence</a>`; }).join('')}</div>` : '<span class="reasoning-only">Reasoning turn · no new factual claim</span>'}</div></li>`);
  });
  container.innerHTML = items.join('');
}

function renderVerdict(investigation) {
  const container = $('#verdict-card');
  if (!container) return;
  const verdict = investigation.verdict;
  container.innerHTML = `<span class="eyebrow">End of discussion</span><h3 id="verdict-title">${escapeHtml(verdict.decision)}</h3><p class="verdict-summary">${escapeHtml(verdict.summary)}</p><div class="verdict-grid"><div><span>Why</span><p>${escapeHtml(verdict.why)}</p></div><div><span>Next gate</span><p>${escapeHtml(verdict.nextGate)}</p></div></div><a class="text-link" href="/third-chair.html?investigation=${encodeURIComponent(investigation.id)}">Challenge the unresolved assumption →</a>`;
}

function renderFailedArguments(investigation) {
  const container = $('#failed-argument-list');
  if (!container) return;
  const argumentsList = investigation.failedArguments || [];
  container.innerHTML = argumentsList.map((argument, index) => `
    <article class="failed-argument">
      <div class="failed-index">${String(index + 1).padStart(2, '0')}</div>
      <div>
        <span class="failed-outcome">${escapeHtml(argument.outcome)}</span>
        <h4>${escapeHtml(argument.title)}</h4>
        <p>${escapeHtml(argument.reason)}</p>
        <div class="failed-links"><span>Proposed by ${escapeHtml(argument.proposedBy)}</span>${argument.turns.map(turn => `<a href="#turn-${turn}">Turn ${String(turn).padStart(2, '0')}</a>`).join('')}${argument.claimIds.map(id => `<a href="#evidence-${escapeHtml(id)}">${escapeHtml(id.toUpperCase())}</a>`).join('')}</div>
      </div>
    </article>`).join('');
}

function renderBusinessPlan(investigation) {
  const container = $('#business-plan');
  if (!container) return;
  const plan = investigation.businessPlan;
  if ($('#plan-notice')) $('#plan-notice').textContent = plan.notice;
  container.innerHTML = plan.sections.map((section, index) => `<details ${index < 2 ? 'open' : ''}><summary><span>${String(index + 1).padStart(2, '0')}</span>${escapeHtml(section.title)}</summary><p>${escapeHtml(section.body)}</p></details>`).join('');
}

function renderBoard(investigations) {
  const container = $('#idea-board');
  if (!container) return;
  container.innerHTML = investigations.map(investigation => {
    const idea = investigation.idea;
    return `
      <article class="idea-card" data-country="${escapeHtml(investigation.country)}" data-state="${escapeHtml(idea.state)}">
        <div><span class="number">${escapeHtml(investigation.number)}</span><p>${escapeHtml(investigation.country)}<br>${escapeHtml(investigation.industry)}</p></div>
        <div><div class="chips"><span class="chip signal-chip">${escapeHtml(idea.state)}</span><span class="chip">Confidence ${escapeHtml(investigation.confidence)}%</span><span class="chip">${investigation.claims.length} sources</span></div><h3>${escapeHtml(idea.name)}</h3><p>${escapeHtml(investigation.verdict.summary)}</p><nav class="board-links" aria-label="${escapeHtml(idea.name)} case file"><a href="/case.html?investigation=${encodeURIComponent(investigation.id)}#${escapeHtml(idea.transcriptAnchor)}">Transcript</a><a href="/case.html?investigation=${encodeURIComponent(investigation.id)}#evidence-ledger">Evidence</a><a href="/case.html?investigation=${encodeURIComponent(investigation.id)}#failed-arguments">Failed arguments</a><a href="/case.html?investigation=${encodeURIComponent(investigation.id)}#${escapeHtml(idea.planAnchor)}">Business plan</a><a href="/third-chair.html?investigation=${encodeURIComponent(investigation.id)}">Third Chair</a></nav></div>
        <div class="idea-meta"><div><span>Customer</span><strong>${escapeHtml(idea.customer)}</strong></div><div><span>First test</span><strong>${escapeHtml(idea.firstTest)}</strong></div><div><span>Verdict</span><strong>${escapeHtml(investigation.verdict.decision)}</strong></div></div>
      </article>`;
  }).join('');
}

function renderScreeningFeed(candidates) {
  const stats = $('#feed-stats');
  const feed = $('#candidate-feed');
  if (!stats || !feed) return;
  const ordered = [...candidates].sort((a, b) => b.researchedAt.localeCompare(a.researchedAt));
  const qualified = ordered.filter(candidate => candidate.status === 'qualified').length;
  const discarded = ordered.filter(candidate => candidate.status === 'discarded').length;
  stats.innerHTML = `<div><strong>${ordered.length}</strong><span>Total screened</span></div><div><strong>${qualified}</strong><span>Qualified</span></div><div><strong>${discarded}</strong><span>Discarded</span></div>`;
  if (!ordered.length) {
    feed.innerHTML = '<div class="feed-empty"><strong>The screening ledger is ready.</strong><p>The first scheduled research result will appear here after it is sourced, classified and published.</p></div>';
    return;
  }
  feed.innerHTML = ordered.slice(0, 60).map(candidate => `
    <article class="candidate-card ${escapeHtml(candidate.status)}" id="candidate-${escapeHtml(candidate.id)}">
      <div class="candidate-state"><span>${escapeHtml(candidate.status)}</span><time datetime="${escapeHtml(candidate.researchedAt)}">${escapeHtml(candidate.researchedAt.slice(0, 10))}</time></div>
      <div class="candidate-copy"><small>${escapeHtml(candidate.country)} · ${escapeHtml(candidate.industry)}</small><h3>${escapeHtml(candidate.title)}</h3><p>${escapeHtml(candidate.summary)}</p><strong>${escapeHtml(candidate.rationale)}</strong><div class="candidate-sources">${candidate.evidence.map(source => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)} ↗</a>`).join('')}</div></div>
      <div class="candidate-next"><span>Next action</span><p>${escapeHtml(candidate.nextStep)}</p>${candidate.promotedInvestigationId ? `<a href="/case.html?investigation=${encodeURIComponent(candidate.promotedInvestigationId)}#room">Open case file →</a>` : ''}${candidate.socialPostUrl ? `<a href="${escapeHtml(candidate.socialPostUrl)}" target="_blank" rel="noreferrer">View X post ↗</a>` : ''}</div>
    </article>`).join('');
}

function renderPipeline(site) {
  const targetContainer = $('#production-target');
  const list = $('#pipeline-list');
  if (!targetContainer || !list) return;
  const target = site.productionTarget;
  targetContainer.innerHTML = `
    <div><strong>${target.caseDraftsPerDay}</strong><span>case drafts per research day</span></div>
    <div><strong>${target.survivingCasesPerDay}</strong><span>surviving case files minimum</span></div>
    <p>${escapeHtml(target.rule)} <em>${escapeHtml(target.qualityGuardrail)}</em></p>
    <p><strong>Discovery mix.</strong> ${escapeHtml(target.geographyPriority)} ${escapeHtml(target.categoryPriority)}</p>
    <p><strong>Outside ideas.</strong> ${escapeHtml(target.ideaSourceRule)}</p>`;
  list.innerHTML = site.pipeline.map((item, index) => `
    <li>
      <div class="pipeline-number">${String(index + 1).padStart(2, '0')}</div>
      <div><span>${escapeHtml(item.stage)} · ${escapeHtml(item.status)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div>
    </li>`).join('');
}

function renderThirdChair(investigation) {
  const section = $('#third-chair');
  if (!section) return;
  if (!investigation.openQuestion) {
    section.hidden = true;
    return;
  }
  const question = investigation.openQuestion;
  $('#open-question').textContent = question.question;
  $('#evidence-wanted').textContent = `Evidence requested: ${question.evidenceWanted}`;
  $('#question-close').textContent = question.closes;
  const subject = encodeURIComponent(`[Third Chair] ${question.title}`);
  const body = encodeURIComponent(`Question:\n${question.question}\n\nEvidence or direct experience:\n\nSource link or document:\n\nHow this changes the idea:\n`);
  $('#answer-link').href = `mailto:${question.responseEmail}?subject=${subject}&body=${body}`;
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 1800);
}

function renderFund(site) {
  if (!$('#wallet-list')) return;
  const funding = site.funding;
  const percent = Math.min(100, Math.round((funding.receivedUsd / funding.goalUsd) * 100));
  if ($('#fund-mini')) $('#fund-mini').textContent = `Moon fund · $${funding.receivedUsd} / $${funding.goalUsd}`;
  if ($('#fund-received')) $('#fund-received').textContent = `$${funding.receivedUsd}`;
  if ($('#fund-goal')) $('#fund-goal').textContent = `$${funding.goalUsd}`;
  if ($('#fund-meter')) $('#fund-meter').style.width = `${percent}%`;
  $('#wallet-list').innerHTML = site.wallets.map(wallet => `
    <article class="wallet">
      <div class="wallet-head"><strong>${escapeHtml(wallet.network)}</strong><span>${escapeHtml(wallet.asset)}</span></div>
      <button type="button" data-address="${escapeHtml(wallet.address)}" aria-label="Copy ${escapeHtml(wallet.network)} address">${escapeHtml(wallet.address)}</button>
    </article>`).join('');
  $('#wallet-list').addEventListener('click', async event => {
    const button = event.target.closest('[data-address]');
    if (!button) return;
    await navigator.clipboard.writeText(button.dataset.address);
    showToast(`${button.closest('.wallet').querySelector('strong').textContent} address copied`);
  });
}

function bindControls() {
  const evidenceToggle = $('#evidence-toggle');
  if (evidenceToggle) evidenceToggle.addEventListener('click', event => {
    const ledger = $('#evidence-ledger');
    ledger.hidden = !ledger.hidden;
    event.currentTarget.setAttribute('aria-expanded', String(!ledger.hidden));
    event.currentTarget.textContent = ledger.hidden ? 'Show evidence ledger' : 'Hide evidence ledger';
  });

  const confidenceToggle = $('#confidence-toggle');
  if (confidenceToggle) confidenceToggle.addEventListener('click', event => {
    const panel = $('#confidence-panel');
    panel.hidden = !panel.hidden;
    event.currentTarget.setAttribute('aria-expanded', String(!panel.hidden));
    event.currentTarget.textContent = panel.hidden ? 'How is this scored?' : 'Hide score settings';
  });

  const conversation = $('#conversation');
  if (conversation) conversation.addEventListener('click', event => {
    const citation = event.target.closest('.citation');
    if (!citation) return;
    const ledger = $('#evidence-ledger');
    ledger.hidden = false;
    $('#evidence-toggle').setAttribute('aria-expanded', 'true');
    $('#evidence-toggle').textContent = 'Hide evidence ledger';
  });

  document.querySelectorAll('.board-filters button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.board-filters button').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      const filter = button.textContent.trim().toLowerCase();
      document.querySelectorAll('.idea-card').forEach(card => {
        const matches = filter === 'all' || card.dataset.country.toLowerCase().includes(filter) || card.dataset.state.toLowerCase() === filter;
        card.hidden = !matches;
      });
    });
  });
  window.addEventListener('hashchange', restoreDeepLink);
}

function restoreDeepLink() {
  if (!window.location.hash) return;
  const targetId = decodeURIComponent(window.location.hash.slice(1));
  if ((targetId === 'evidence-ledger' || targetId.startsWith('evidence-')) && $('#evidence-ledger')) {
    const ledger = $('#evidence-ledger');
    ledger.hidden = false;
    $('#evidence-toggle').setAttribute('aria-expanded', 'true');
    $('#evidence-toggle').textContent = 'Hide evidence ledger';
  }
  window.setTimeout(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    const offset = window.matchMedia('(max-width: 760px)').matches ? 160 : 100;
    window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - offset);
    root.style.scrollBehavior = previousBehavior;
  }, 0);
}

function render({ site, investigations, candidates }) {
  const requestedId = new URLSearchParams(window.location.search).get('investigation');
  const investigation = investigations.find(item => item.id === requestedId) || investigations[0];
  if ($('#issue-label')) $('#issue-label').textContent = `Investigation ${investigation.number} · ${investigation.country}`;
  const transcript = document.querySelector('[id^="transcript-"]');
  if (transcript) transcript.id = investigation.idea.transcriptAnchor;
  const plan = document.querySelector('.business-plan');
  if (plan) plan.id = investigation.idea.planAnchor;
  if ($('#investigation-title')) $('#investigation-title').textContent = investigation.title;
  if ($('#investigation-thesis')) $('#investigation-thesis').textContent = investigation.thesis;
  if ($('#confidence-value')) $('#confidence-value').textContent = `${investigation.confidence}%`;
  if ($('#confidence-meter')) $('#confidence-meter').style.width = `${investigation.confidence}%`;
  if ($('#investigation-chips')) $('#investigation-chips').innerHTML = [investigation.country, investigation.industry, investigation.idea.state].map((value, index) => `<span class="chip ${index === 2 ? 'signal-chip' : ''}">${escapeHtml(value)}</span>`).join('');
  if ($('#disclosure')) $('#disclosure').textContent = site.disclosure;
  renderAgents(site.agents);
  renderCaseIndex(investigations, investigation.id);
  renderScreeningFeed(candidates);
  renderIdeaBrief(investigation);
  renderConfidence(investigation);
  renderEvidence(investigation);
  renderConversation(investigation, site.agents);
  renderVerdict(investigation);
  renderFailedArguments(investigation);
  renderBusinessPlan(investigation);
  renderBoard(investigations);
  renderPipeline(site);
  renderThirdChair(investigation);
  renderFund(site);
  bindControls();
  restoreDeepLink();
}

try {
  render(await loadData());
} catch (error) {
  $('#main').innerHTML = `<div class="loading-error">${escapeHtml(error.message)}</div>`;
}
