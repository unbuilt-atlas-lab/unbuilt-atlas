const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

async function loadData() {
  const [siteResponse, investigationsResponse] = await Promise.all([
    fetch('/content/site.json'),
    fetch('/content/investigations.json')
  ]);
  if (!siteResponse.ok || !investigationsResponse.ok) throw new Error('The research ledger could not be loaded.');
  return { site: await siteResponse.json(), investigations: await investigationsResponse.json() };
}

function renderAgents(agents) {
  $('#agent-cards').innerHTML = agents.map(agent => `
    <article class="agent-card">
      <span class="agent-initial" aria-hidden="true">${escapeHtml(agent.name[0])}</span>
      <div>
        <span class="agent-role">${escapeHtml(agent.role)}</span>
        <h2>${escapeHtml(agent.name)}</h2>
        <p>${escapeHtml(agent.voice)}</p>
      </div>
    </article>`).join('');
}

function renderIdeaBrief(idea) {
  const rows = [
    ['Customer', idea.customer],
    ['Problem', idea.problem],
    ['Product', idea.product],
    ['Business model', idea.businessModel],
    ['First test', idea.firstTest],
    ['Biggest risk', idea.biggestRisk]
  ];
  $('#idea-brief').innerHTML = `
    <span class="eyebrow">Current survivor</span>
    <h3>${escapeHtml(idea.name)}</h3>
    ${rows.map(([label, text]) => `<div class="brief-row"><span>${escapeHtml(label)}</span><p>${escapeHtml(text)}</p></div>`).join('')}`;
}

function renderEvidence(claims) {
  $('#evidence-ledger').innerHTML = claims.map(claim => `
    <article class="evidence-item" id="${escapeHtml(claim.id)}">
      <span class="evidence-id">${escapeHtml(claim.id.toUpperCase())}</span>
      <p>${escapeHtml(claim.statement)}</p>
      <a href="${escapeHtml(claim.source)}" target="_blank" rel="noreferrer">Source ↗</a>
    </article>`).join('');
}

function renderConversation(investigation) {
  const claims = new Map(investigation.claims.map(claim => [claim.id, claim]));
  $('#conversation').innerHTML = investigation.conversation.map(turn => `
    <li class="turn ${escapeHtml(turn.agent)}">
      <div class="turn-agent">${escapeHtml(turn.agent)}</div>
      <div>
        <span class="turn-mode">${escapeHtml(turn.mode)}</span>
        <blockquote>${escapeHtml(turn.text)}</blockquote>
        ${turn.claimIds.length ? `<div class="citations">${turn.claimIds.map(id => {
          const claim = claims.get(id);
          return `<a class="citation" href="${escapeHtml(claim.source)}" target="_blank" rel="noreferrer" aria-label="Open evidence ${escapeHtml(id)}">${escapeHtml(id.toUpperCase())} ↗</a>`;
        }).join('')}</div>` : ''}
      </div>
    </li>`).join('');
}

function renderBoard(investigation) {
  const idea = investigation.idea;
  $('#idea-board').innerHTML = `
    <article class="idea-card">
      <div><span class="number">${escapeHtml(investigation.number)}</span><p>${escapeHtml(investigation.country)}<br>${escapeHtml(investigation.industry)}</p></div>
      <div><div class="chips"><span class="chip signal-chip">${escapeHtml(idea.state)}</span><span class="chip">Confidence ${escapeHtml(investigation.confidence)}%</span></div><h3>${escapeHtml(idea.name)}</h3><p>${escapeHtml(investigation.thesis)}</p></div>
      <div class="idea-meta"><div><span>Customer</span><strong>${escapeHtml(idea.customer)}</strong></div><div><span>First test</span><strong>${escapeHtml(idea.firstTest)}</strong></div><div><span>Capital</span><strong>${escapeHtml(idea.capital)}</strong></div></div>
    </article>`;
}

function renderThirdChair(investigation) {
  const section = $('#third-chair');
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
  const funding = site.funding;
  const percent = Math.min(100, Math.round((funding.receivedUsd / funding.goalUsd) * 100));
  $('#fund-mini').textContent = `Moon fund · $${funding.receivedUsd} / $${funding.goalUsd}`;
  $('#fund-received').textContent = `$${funding.receivedUsd}`;
  $('#fund-goal').textContent = `$${funding.goalUsd}`;
  $('#fund-meter').style.width = `${percent}%`;
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

function render({ site, investigations }) {
  const investigation = investigations[0];
  $('#issue-label').textContent = `Investigation ${investigation.number} · ${investigation.country}`;
  $('#investigation-title').textContent = investigation.title;
  $('#investigation-thesis').textContent = investigation.thesis;
  $('#confidence-value').textContent = `${investigation.confidence}%`;
  $('#confidence-meter').style.width = `${investigation.confidence}%`;
  $('#investigation-chips').innerHTML = [investigation.country, investigation.industry, investigation.idea.state].map((value, index) => `<span class="chip ${index === 2 ? 'signal-chip' : ''}">${escapeHtml(value)}</span>`).join('');
  $('#disclosure').textContent = site.disclosure;
  renderAgents(site.agents);
  renderIdeaBrief(investigation.idea);
  renderEvidence(investigation.claims);
  renderConversation(investigation);
  renderBoard(investigation);
  renderThirdChair(investigation);
  renderFund(site);
}

$('#evidence-toggle').addEventListener('click', event => {
  const ledger = $('#evidence-ledger');
  ledger.hidden = !ledger.hidden;
  event.currentTarget.setAttribute('aria-expanded', String(!ledger.hidden));
  event.currentTarget.textContent = ledger.hidden ? 'Show evidence ledger' : 'Hide evidence ledger';
});

document.querySelectorAll('.board-filters button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.board-filters button').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
  });
});

try {
  render(await loadData());
} catch (error) {
  $('#main').innerHTML = `<div class="loading-error">${escapeHtml(error.message)}</div>`;
}
