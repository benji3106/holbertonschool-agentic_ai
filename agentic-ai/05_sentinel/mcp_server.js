import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Le token vient de l'environnement, jamais du code
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ISSUES_LIMIT = 5;

// Diagnostic lisible par l'agent pour chaque erreur HTTP connue
const HTTP_ERROR_HINTS = {
  401: "Token GitHub invalide ou expiré. Vérifie GITHUB_TOKEN dans .env, puis redémarre le serveur MCP.",
  403: "Accès refusé ou quota de requêtes dépassé. Vérifie les droits du token ou attends la réinitialisation du quota.",
  404: "Dépôt introuvable. Vérifie l'orthographe de owner et repo, ou le dépôt est peut-être privé.",
  429: "Trop de requêtes. Attends avant de relancer l'outil."
};

// 1. Initialisation du serveur
const server = new Server(
  { name: "github-ops", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// 2. Déclaration de l'outil (ce que Copilot peut voir)
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "fetch_github_issues",
      description: "Récupère les 5 dernières issues ouvertes d'un dépôt GitHub public (pull requests exclues).",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Propriétaire du dépôt (ex: microsoft)" },
          repo: { type: "string", description: "Nom du dépôt (ex: vscode)" }
        },
        required: ["owner", "repo"],
        additionalProperties: false
      }
    }
  ]
}));

// Résultat d'erreur renvoyé à l'agent (le processus ne crashe pas)
function errorResult(message) {
  return { content: [{ type: "text", text: message }], isError: true };
}

// Transforme n'importe quelle erreur en JSON structuré et exploitable par l'agent
function formatError(error, owner, repo) {
  let details;

  if (error.status) {
    details = {
      type: "HTTP_ERROR",
      status: error.status,
      githubMessage: error.message,
      diagnostic: HTTP_ERROR_HINTS[error.status] ?? "Erreur inattendue de l'API GitHub."
    };
  } else if (error.name === "TimeoutError") {
    details = { type: "TIMEOUT", diagnostic: "GitHub n'a pas répondu en moins de 10 secondes." };
  } else {
    details = { type: "NETWORK_ERROR", diagnostic: `Impossible de joindre GitHub : ${error.message}` };
  }

  return JSON.stringify({
    error: true,
    repository: `${owner}/${repo}`,
    ...details,
    instruction: "N'invente aucune donnée d'issue. Signale cette erreur à l'utilisateur avec son diagnostic."
  }, null, 2);
}

// 3. Appel réseau vers l'API GitHub
async function fetchGithubIssues(owner, repo) {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues?state=open&per_page=30`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "User-Agent": "sentinel-github-ops",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    // Le corps d'erreur GitHub contient un champ "message" (ex: "Bad credentials")
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.message ?? response.statusText);
    error.status = response.status;
    throw error;
  }

  const items = await response.json();

  return items
    .filter((item) => !item.pull_request)
    .slice(0, ISSUES_LIMIT)
    .map((issue) => ({
      number: issue.number,
      title: issue.title,
      author: issue.user?.login,
      labels: issue.labels.map((label) => label.name),
      comments: issue.comments,
      createdAt: issue.created_at,
      url: issue.html_url
    }));
}

// 4. Exécution de l'outil (ce que Copilot peut faire)
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "fetch_github_issues") {
    throw new Error(`Outil inconnu : ${request.params.name}`);
  }

  if (!GITHUB_TOKEN) {
    return errorResult("GITHUB_TOKEN absent : vérifie la clé envFile dans .vscode/mcp.json");
  }

  const { owner, repo } = request.params.arguments ?? {};

  try {
    const issues = await fetchGithubIssues(owner, repo);
    return { content: [{ type: "text", text: JSON.stringify(issues, null, 2) }] };
  } catch (error) {
    console.error(`[github-ops] Échec pour ${owner}/${repo} :`, error.message);
    return errorResult(formatError(error, owner, repo));
  }
});

// 5. Démarrage sur stdio
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Serveur MCP github-ops démarré sur stdio");
}

main().catch((error) => {
  console.error("Erreur fatale :", error);
  process.exit(1);
});