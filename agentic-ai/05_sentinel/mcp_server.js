import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const server = new Server(
  { name: "github-ops", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "fetch_github_issues",
      description: "Récupère les 5 dernières issues d'un dépôt GitHub public.",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Propriétaire du dépôt (ex: microsoft)" },
          repo: { type: "string", description: "Nom du dépôt (ex: vscode)" }
        },
        required: ["owner", "repo"]
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "fetch_github_issues") {
    throw new Error(`Outil inconnu : ${request.params.name}`);
  }

  const { owner, repo } = request.params.arguments;

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    if (!response.ok) {
      return {
        content: [{ type: "text", text: `Erreur GitHub ${response.status} (${response.statusText}) pour ${owner}/${repo}.` }],
        isError: true
      };
    }

    const items = await response.json();
    const issues = items.filter((item) => !item.pull_request).slice(0, 5);

    return { content: [{ type: "text", text: JSON.stringify(issues, null, 2) }] };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Erreur réseau : ${error.message}` }],
      isError: true
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Serveur MCP github-ops démarré sur stdio");