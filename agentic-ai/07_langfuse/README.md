# Agentic Ops, FinOps & Langfuse (La Tour de Contrôle)

Instrumenter un agent SysAdmin en Node.js avec Langfuse, puis y greffer les deux
briques de gouvernance de l'Agentic Ops : le **Post-Hook** (observer, noter) et le
**Pre-Hook** (bloquer, exiger une validation humaine).

**Le problème posé par l'énoncé :** un agent qui boucle ne crashe pas, il consomme.
Et s'il propose une commande destructrice, rien ne l'empêche de l'exécuter.

---

## Sommaire

- [Tâche 0 Configuration de la Tour de Contrôle](#tâche-0--configuration-de-la-tour-de-contrôle)
- [Tâche 1 L'instrumentation du code (Tracing)](#tâche-1--linstrumentation-du-code-tracing)
- [Tâche 2 Le Post-Hook (FinOps & Scoring)](#tâche-2--le-post-hook-finops--scoring)
- [Tâche 3 Le Pre-Hook (Gouvernance & HITL)](#tâche-3--le-pre-hook-gouvernance--hitl)
- [Installation et lancement](#installation-et-lancement)
- [Bilan](#bilan)

---

## Tâche 0 Configuration de la Tour de Contrôle

**Objectif :** préparer les récepteurs télémétriques avant d'écrire la moindre ligne.

Création d'un projet `Agentic-Ops-TP7` sur Langfuse Cloud, puis génération des clés
dans *Settings → API Keys*.

| Clé | Forme | Nature |
|---|---|---|
| Public Key | `pk-lf-…` | identifiant du projet, non secret |
| Secret Key | `sk-lf-…` | **affichée une seule fois** |
| Host | `https://cloud.langfuse.com` | région EU |

**Points d'attention rencontrés**

- La Secret Key n'est plus consultable après fermeture de la modale. Si elle n'est
  pas copiée immédiatement, il faut régénérer une paire.
- La région compte : un compte US avec un `LANGFUSE_BASEURL` pointant sur l'EU
  envoie les traces dans le vide, sans erreur bloquante.

---

## Tâche 1 L'instrumentation du code (Tracing)

**Objectif :** rendre visible un agent aveugle, sans toucher à sa logique.

### Le wrapper

```javascript
const rawClient = new OpenAI({ baseURL, apiKey });

const openai = observeOpenAI(rawClient, {
    traceId,
    traceName: "agent-sysadmin",
    generationName: "proposition-commande-linux",
    tags: ["tp7", "sysadmin"],
    metadata: { environnement: "dev", fournisseur: "gemini" }
});
```

`observeOpenAI` retourne un **Proxy** autour du client. Chaque appel à
`chat.completions.create()` est intercepté : chronomètre démarré, génération
Langfuse créée, `usage` capturé, mise en file puis la main est passée au vrai
SDK. Le code métier n'a pas changé d'une ligne. C'est le sens du terme
« instrumentation non-intrusive ».

Choix des options : `tags` est le seul champ qui permette de filtrer efficacement
dans l'interface une fois les traces nombreuses ; `metadata` porte le contexte que
le SDK ne peut pas deviner, ici le fournisseur réellement utilisé.

### Le piège du flush

Le wrapper envoie ses données de façon asynchrone et bufferisée. Un script Node
court se termine, le process quitte et le buffer part avec.

```javascript
await openai.flushAsync();
```

Sans cet appel, aucune trace n'apparaît, alors que le terminal affiche un résultat
parfaitement normal. C'est le premier bug à anticiper sur ce TP.

### Résultat

![Trace Langfuse](screenshots/langfuse_proof_task1.png)

La trace `agent-sysadmin` contient la génération `proposition-commande-linux` avec
le prompt, la réponse complète, l'usage en tokens, la latence et le coût estimé.

---

## Tâche 2 Le Post-Hook (FinOps & Scoring)

**Objectif :** surveiller la dépense et noter la dangerosité, après coup.

### Le seuil FinOps

```javascript
const totalTokens = response.usage.total_tokens;

if (totalTokens > 150) {
    console.error("ALERTE FINOPS : Seuil de tokens dépassé !");
}
```

Un prompt de ~40 tokens produit une réponse de ~1650. Le seuil de 150 est dépassé
d'un facteur 10 dès le premier appel  ce n'est pas un bug, c'est le constat que
l'énoncé veut faire observer : **la facture part du côté sortie**, pas entrée.

Le seuil porte sur `total_tokens` et non sur un montant : robuste au changement de
fournisseur et aux variations de tarif.

### Le scoring

```javascript
const estDangereux = intentionIA.includes("rm -rf");

langfuse.score({
    traceId,
    name: "securite_commande",
    value: estDangereux ? 0 : 1,
    comment: estDangereux ? "Commande destructrice détectée (rm -rf)" : "…"
});
```

### Le vrai obstacle de cette tâche : rattacher le score à la trace

`langfuse.score()` exige un `traceId`. Or la trace est créée **en interne** par le
wrapper. Deux approches :

| Approche | Principe | Verdict |
|---|---|---|
| Lire l'identifiant après coup | extraire le traceId généré par le wrapper | fragile |
| **Imposer l'identifiant** | le générer soi-même et le passer au wrapper | retenu |

```javascript
const traceId = randomUUID();          // décidé AVANT que la trace existe
```

Piège fréquent : utiliser `response.id`. C'est l'identifiant de complétion du
fournisseur (`chatcmpl-…`), sans aucun lien avec Langfuse. Le score part alors vers
un traceId inexistant et devient orphelin sans erreur visible.

### Deux buffers, deux flush

```javascript
await openai.flushAsync();     // trace + génération (wrapper)
await langfuse.flushAsync();   // scores (instance)
```

Oublier le second donne un terminal vert et un panneau *Scores* vide. `score()` est
synchrone : il met en file, c'est le flush qui envoie.

### Résultat

![Score rattaché à la trace](screenshots/langfuse_proof_task2.png)

Le score `securite_commande` apparaît directement sous la trace dans l'arbre
d'exécution, preuve que le rattachement par `traceId` fonctionne.

---

## Tâche 3 Le Pre-Hook (Gouvernance & HITL)

**Objectif :** geler l'exécution et exiger une validation humaine avant toute action
destructrice.

### La fonction de validation

```javascript
async function demanderValidationHumaine(action) {
    const rl = readline.createInterface({ input, output });
    const reponse = await rl.question("\nAutoriser ? (o/n) : ");
    rl.close();
    return reponse.trim().toLowerCase() === "o";
}
```

`rl.close()` n'est pas décoratif : sans lui, l'interface garde `stdin` ouvert et le
process ne rend jamais la main.

### L'ordre imposé : flush, puis exit

```javascript
if (!estAutorise) {
    console.log("\nExécution refusée par l'administrateur.");
    await envoyerTelemetrie();   // ← AVANT
    process.exit(1);
}
```

`process.exit()` tue le process immédiatement et perd toute écriture asynchrone en
vol. Écrire le flush après l'exit revient à perdre la trace du refus c'est-à-dire
**l'évènement précisément le plus important à auditer**. La dernière phrase de
l'énoncé est un avertissement sur ce point.

Les deux chemins de sortie devant flusher les deux buffers, la logique est extraite
dans une fonction dédiée pour éviter d'en oublier un sur la branche de refus.

### Refus par défaut

`reponse === "o"` signifie que `Entrée`, `oui`, `y` ou une faute de frappe bloquent
l'exécution. Dans un garde-fou, l'ambiguïté doit toujours pencher du côté sûr : un
mécanisme qui laisse passer sur un appui de touche hasardeux n'est pas un
mécanisme de sécurité.

### Ajout hors énoncé : tracer la décision

```javascript
langfuse.score({
    traceId,
    name: "validation_humaine",
    value: estAutorise ? 1 : 0
});
```

Sans cela, la trace enregistre ce que l'IA a proposé mais jamais ce qu'un humain en
a fait. Dans une tour de contrôle, c'est l'information la plus précieuse.

### Résultat

**Branche autorisée** — l'opérateur valide, le script poursuit :

![Exécution autorisée](screenshots/langfuse_proof_task3_autorise.png)

**Branche refusée** — l'opérateur bloque, le script sort en code 1 :

![Exécution refusée](screenshots/langfuse_proof_task3_refuse.png)

Les deux traces portent leur paire de scores. La présence de `validation_humaine`
à 0.00 sur la branche refusée est la preuve que le flush a bien eu lieu **avant**
`process.exit(1)` : sans lui, cette trace n'existerait pas.

---

## Installation et lancement

```bash
npm install
cp .env.example .env    # puis renseigner les clés
npm start
```

| Variable | Où l'obtenir |
|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) → Create API key |
| `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` | Langfuse → Settings → API Keys |
| `LANGFUSE_BASEURL` | `https://cloud.langfuse.com` |

`.env` est ignoré par Git. Aucune clé ne doit être poussée sur le dépôt.

---

## Bilan

### Le SDK OpenAI n'est pas OpenAI

Le projet tourne sur Gemini via son endpoint compatible
(`/v1beta/openai/`). Le SDK `openai` est un client HTTP qui parle un protocole
devenu standard de fait ; changer de fournisseur coûte deux lignes, sans toucher au
code métier ni à l'instrumentation Langfuse, qui s'appuie sur ce même SDK.

### SDK Langfuse v3 et non v4

Syntaxe impérative : `new Langfuse()`, `traceId` en chaîne libre, `score()` à plat,
flush explicite. Le SDK v4 est bâti sur OpenTelemetry imports scopés `@langfuse/*`,
décorateur `@observe`, identifiants hexadécimaux générés par le runtime. Les deux
syntaxes sont incompatibles et ne se mélangent pas.

### Limite du scoring par mot-clé

`includes("rm -rf")` détecte une chaîne de caractères, pas une intention. Le modèle
cite fréquemment `rm -rf / --no-preserve-root` **en contre-exemple explicitement
déconseillé**, et propose parfois des usages légitimes comme `rm -rf /tmp/*`. Dans
les deux cas le score sort à 0 : faux positifs.

C'est ce qui justifie le Pre-Hook humain. Puisque l'évaluation automatique se trompe
dans les deux sens, c'est l'opérateur qui tranche. Une parade plus fine serait un
LLM-as-a-judge évaluant l'intention plutôt que la présence d'une sous-chaîne.

### Ce que l'observabilité a révélé

Langfuse enregistre le modèle **réellement servi**, pas celui demandé : un alias
peut être résolu vers une autre version. Sans tour de contrôle, on facture et on
évalue sur un modèle qu'on n'a jamais choisi et cette dérive reste invisible.