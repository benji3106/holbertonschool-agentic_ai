const issues = [
  { number: 335503, title: "unexpected status 404 Not Found:", state: "open", url: "https://github.com/microsoft/vscode/issues/335503", author: "Palaniveltkm", labels: [], assignee: null, comments: 1, created: "2026-09-10T16:28:58Z", excerpt: "The model gpt-5.5 does not exist or you do not have access to it." },
  { number: 335499, title: "Model picker hover is too short in icon-only state", state: "open", url: "https://github.com/microsoft/vscode/issues/335499", author: "jo-oikawa", labels: ["bug"], assignee: "lramos15", comments: 0, created: "2026-09-10T16:23:36Z", excerpt: "The hover state is too short when the model picker enters its icon-only state." },
  { number: 335496, title: "Test: Create PR form in the Agents Window", state: "open", url: "https://github.com/microsoft/vscode/issues/335496", author: "benibenj", labels: ["testplan-item"], assignee: null, comments: 0, created: "2026-09-10T16:16:13Z", excerpt: "Validate the Create PR action and generated form in Agent Host sessions." },
  { number: 335495, title: "Unable to switch agents in Agents Window for a remote session", state: "open", url: "https://github.com/microsoft/vscode/issues/335495", author: "Copilot", labels: ["agents-window", "ai-customizations"], assignee: "DonJayamanne", comments: 0, created: "2026-09-10T16:08:07Z", excerpt: "Selecting a different agent does not switch the active agent in a remote session." },
  { number: 335494, title: "Agent Host sandbox toggle uses client OS instead of remote host OS", state: "open", url: "https://github.com/microsoft/vscode/issues/335494", author: "digitarald", labels: ["bug"], assignee: "dileepyavan", comments: 0, created: "2026-09-10T16:08:06Z", excerpt: "The permissions UI uses the client operating system instead of the remote host OS." }
];

const list = document.querySelector("#issue-list");
const search = document.querySelector("#search");
const labelFilter = document.querySelector("#label-filter");
const sort = document.querySelector("#sort");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");

[...new Set(issues.flatMap((issue) => issue.labels))].sort().forEach((label) => labelFilter.insertAdjacentHTML("beforeend", `<option value="${label}">${label}</option>`));
const initials = (name) => name.split(/[^a-zA-Z0-9]+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
const dateLabel = (date) => new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(date));

function render() {
  const query = search.value.trim().toLowerCase();
  const selectedLabel = labelFilter.value;
  const visible = issues.filter((issue) => `${issue.title} ${issue.author} ${issue.assignee || ""} ${issue.labels.join(" ")}`.toLowerCase().includes(query) && (selectedLabel === "all" || issue.labels.includes(selectedLabel))).sort((a, b) => {
    if (sort.value === "oldest") return new Date(a.created) - new Date(b.created);
    if (sort.value === "number") return b.number - a.number;
    return new Date(b.created) - new Date(a.created);
  });
  list.innerHTML = visible.map((issue) => `<article class="issue-row"><div class="issue-number">#${issue.number}<span class="state-dot"></span></div><div class="issue-main"><a class="issue-title" href="${issue.url}" target="_blank" rel="noreferrer">${issue.title}</a><p>${issue.excerpt}</p><div class="issue-meta"><span>ouvert par <strong>${issue.author}</strong></span><span>${dateLabel(issue.created)}</span><span>${issue.comments} commentaire${issue.comments === 1 ? "" : "s"}</span></div></div><div class="issue-side"><div class="labels">${issue.labels.length ? issue.labels.map((label) => `<span class="label ${label === "bug" ? "label-bug" : ""}">${label}</span>`).join("") : "<span class=\"muted\">sans label</span>"}</div>${issue.assignee ? `<span class="assignee"><span class="avatar">${initials(issue.assignee)}</span>${issue.assignee}</span>` : "<span class=\"unassigned\">non assignée</span>"}</div></article>`).join("");
  resultCount.textContent = `${visible.length} résultat${visible.length === 1 ? "" : "s"}`;
  emptyState.hidden = visible.length !== 0;
}

[search, labelFilter, sort].forEach((control) => control.addEventListener("input", render));
render();