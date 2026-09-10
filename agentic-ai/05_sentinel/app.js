const issues = [
  {
    number: 335508,
    title: 'AI Customizations: Extension Tools list is clipped and hides tools',
    html_url: 'https://github.com/microsoft/vscode/issues/335508',
    state: 'open',
    user: { login: 'Copilot' },
    labels: [{ name: 'agents-window' }, { name: 'ai-customizations' }],
    assignees: [],
    comments: 0,
    created_at: '2026-09-10T16:42:15Z',
    updated_at: '2026-09-10T16:42:15Z'
  },
  {
    number: 335507,
    title: 'Test: Shareable Automations',
    html_url: 'https://github.com/microsoft/vscode/issues/335507',
    state: 'open',
    user: { login: 'ulugbekna' },
    labels: [{ name: 'testplan-item' }, { name: 'automations' }],
    assignees: [{ login: 'ulugbekna' }],
    comments: 0,
    created_at: '2026-09-10T16:38:29Z',
    updated_at: '2026-09-10T16:42:55Z'
  },
  {
    number: 335505,
    title: 'Quick Fix / Code Action widget: ArrowDown invokes selectNextCodeAction but selection never moves',
    html_url: 'https://github.com/microsoft/vscode/issues/335505',
    state: 'open',
    user: { login: 'xJundo' },
    labels: [],
    assignees: [{ login: 'justschen' }],
    comments: 0,
    created_at: '2026-09-10T16:34:03Z',
    updated_at: '2026-09-10T16:43:04Z'
  },
  {
    number: 335503,
    title: 'unexpected status 404 Not Found:',
    html_url: 'https://github.com/microsoft/vscode/issues/335503',
    state: 'open',
    user: { login: 'Palaniveltkm' },
    labels: [{ name: 'triage-needed' }],
    assignees: [{ login: 'dileepyavan' }],
    comments: 1,
    created_at: '2026-09-10T16:28:58Z',
    updated_at: '2026-09-10T16:40:16Z'
  },
  {
    number: 335499,
    title: 'Model picker hover is too short in icon-only state',
    html_url: 'https://github.com/microsoft/vscode/issues/335499',
    state: 'open',
    user: { login: 'jo-oikawa' },
    labels: [{ name: 'bug' }],
    assignees: [{ login: 'lramos15' }],
    comments: 0,
    created_at: '2026-09-10T16:23:36Z',
    updated_at: '2026-09-10T16:24:20Z'
  }
];

const issueList = document.querySelector('#issues');
const search = document.querySelector('#search');

function formatDate(value) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value));
}

function renderIssue(issue) {
  const labels = issue.labels.map((label) => `<span class="label">${label.name}</span>`).join('');
  const assignee = issue.assignees[0]?.login || '';
  return `<article class="issue">
    <div class="issue-top"><span class="number">#${issue.number}</span><span class="state">${issue.state}</span></div>
    <h2><a href="${issue.html_url}" target="_blank" rel="noreferrer">${issue.title}</a></h2>
    <div class="labels">${labels}</div>
    <footer class="issue-footer"><span>${issue.user.login}${assignee ? ` · ${assignee}` : ''}</span><span>${formatDate(issue.updated_at)} · ${issue.comments}</span></footer>
  </article>`;
}

function render(filter = '') {
  const normalized = filter.trim().toLowerCase();
  const visibleIssues = issues.filter((issue) => JSON.stringify(issue).toLowerCase().includes(normalized));
  issueList.innerHTML = visibleIssues.length ? visibleIssues.map(renderIssue).join('') : '<p class="empty">Aucune issue correspondante.</p>';
}

search.addEventListener('input', (event) => render(event.target.value));
render();