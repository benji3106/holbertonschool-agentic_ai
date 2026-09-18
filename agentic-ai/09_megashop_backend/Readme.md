# MegaShop-B2B — L'Usine Logicielle Auditable

Projet final du module Agentic AI. Trois fonctionnalités backend livrées sans écrire
la logique métier à la main : le code est produit par une équipe de trois agents
(PO, Dev, QA) pilotée depuis GitHub Copilot en mode Agent.

Mon rôle : Lead Agentic Engineer. Je rédige les System Prompts, j'arbitre les
questions ouvertes, je relis et je teste ce que les agents produisent, et je
surveille le budget.

---

## 1. Architecture

```
banque --HTTP--> webhook (Express) --lpush--> Redis --brpop--> worker
                                                                 |
                                                          analyse LLM (Gemini)
                                                                 |
                                                          traces + scores Langfuse
```

| Service | Rôle |
|---|---|
| `webhook` | Reçoit la notification, l'horodate, lui attribue un UUID, la dépose en file, répond `200 OK` |
| `worker` | Consomme la file, analyse la transaction via LLM, applique le garde-fou HITL |
| `redis` | File d'attente `payment_notifications`, avec healthcheck |

Stack : Node.js 20 (alpine), Express, ioredis, Redis 7, Docker Compose,
Gemini (`gemini-3.6-flash`) via endpoint compatible OpenAI, Langfuse v4.

---

## 2. L'équipe d'agents

Trois personas dans `.github/`, chargés explicitement au début de chaque session :

| Fichier | Rôle | Interdits |
|---|---|---|
| `PO-instructions.md` | User Stories INVEST, critères Gherkin, questions ouvertes | Aucun code, aucun choix technique |
| `DEV-instructions.md` | Implémentation, référence des US dans le code | Rien hors de `specifications.md` |
| `QA-instructions.md` | Audit sécurité, tests, preuves | Modifier une règle métier pour faire passer un test |

**Amélioration par rapport au projet 6** : le persona décrit uniquement le rôle,
jamais la mission. La fonctionnalité à traiter arrive dans le prompt, ce qui permet
de réutiliser les mêmes trois agents sur les trois sprints.

**Isolation des contextes** : un nouveau chat à chaque changement de rôle, pour que
`specifications.md` reste la source unique de vérité entre les agents.

---

## 3. Sprint 1 — Webhook de paiement

Route `POST /webhook`. Réponse `200 OK` immédiate, trace console complète
(horodatage UTC, méthode, corps brut, statut).

**Point technique** : le Dev a évité `express.json()`, qui renvoie `400` sur un JSON
malformé et contredirait la règle « toujours 200 ». Il lit le corps brut lui-même et
parse dans un `try/catch`.

**Validation**

| Cas | Attendu | Résultat |
|---|---|---|
| JSON valide | 200 | ✅ |
| Corps vide | 200 | ✅ |
| JSON malformé | 200 | ✅ |
| JSON non-objet | 200 | ✅ |
| Corps > 1 Mo | 413 | ✅ |
| `whoami` dans le conteneur | `node` | ✅ |

---

## 4. Sprint 2 — Worker asynchrone

Le webhook ne fait plus aucun traitement lourd : il dépose dans Redis et répond.
Le worker consomme avec `brpop` et produit une décision `conforme`, `non_conforme`
ou `a_verifier`.

**Optimisation** : un corps vide ou non JSON produit `a_verifier` **sans appeler le
LLM**. Aucune trace Langfuse n'est créée pour ces cas, donc aucun coût.

**Résilience Redis** : healthcheck sur Redis, `depends_on` avec
`condition: service_healthy` sur les deux services, plus un retry applicatif au
démarrage.

**Validation**

- webhook → Redis → worker : même `notificationId` des deux côtés ✅
- corps vide et non JSON : `a_verifier`, aucune trace Langfuse ✅
- corps > 1 Mo : `413`, rien en file ✅
- Redis arrêté puis redémarré : les services se reconnectent seuls ✅
- notification en attente pendant l'arrêt du worker : rattrapée au redémarrage ✅
- trace Langfuse avec modèle, tokens et coût ✅

---

## 5. Sprint 3 — Garde-fou HITL

Une notification dont le corps contient `"action": "refund"` suspend le traitement.
Le worker pose la question via `readline/promises` :

```
Notification <id> : remboursement détecté. Autoriser le remboursement ? [o/n]
```

La décision est enregistrée dans Langfuse comme score `human_refund_confirmation`,
rattaché à la trace du traitement.

**Validation** (mode interactif, `docker compose run --rm worker`)

| Réponse | Décision | Statut | Score Langfuse |
|---|---|---|---|
| `o` | `remboursement_autorise` | succès | `True` ✅ |
| `n` | `remboursement_annule` | echec | `False` ✅ |
| `xyz` | `remboursement_annule` | echec | `False` ✅ |
| (sans `action`) | décision LLM directe, aucune question | — | — ✅ |

---

## 6. Décisions de Lead

Chaque arbitrage est tracé dans `specifications.md` (section « Décisions validées
par le lead ») et dans les prompts donnés au PO.

| Décision | Raison |
|---|---|
| Payload invalide → `200 OK` | Un code d'erreur déclenche des relances inutiles côté banque |
| Corps > 1 Mo → `413` | Aucune notification légitime n'atteint cette taille ; protection mémoire |
| Trace du `413` : taille du corps, pas le corps brut | Tracer 2 Mo annule la protection et sature les journaux |
| Corps vide ou non JSON → `a_verifier` sans LLM | Résultat certain et coût nul |
| Identifiant attribué par le webhook | Une notification invalide n'en contient aucun |
| Toute réponse ≠ `o` vaut refus | Choix prudent pour une opération financière |
| Hors périmètre | Déduplication, indisponibilité de Redis en cours de service, délai max du worker |

---

## 7. Incidents et enseignements

Ce que ce projet m'a appris sur le pilotage d'agents, avec les cas réels rencontrés.

### L'agent a lu mon `.env` sans y être invité

Dès le premier sprint, la trace du Dev montrait `Read .env` alors qu'aucune clé
n'était nécessaire au webhook. Les clés ont été régénérées et une interdiction
explicite ajoutée aux personas Dev et QA. Une consigne dans un prompt réduit le
risque mais ne l'empêche pas techniquement.

### Le QA a modifié une règle métier sans le signaler

En corrigeant l'absence de limite de taille, le QA a introduit un `413` alors que la
spec n'autorisait que `200`. Son persona lui impose pourtant de signaler l'écart au
lieu de trancher. La décision technique était bonne, mais c'était à moi de la
prendre : la spec a été mise à jour ensuite par le PO, avec l'arbitrage tracé.

### Trois rapports « corrigé » pour un bug jamais corrigé

Le blocage du worker en mode détaché a donné lieu à trois corrections successives,
chacune annoncée comme validée avec « tests au vert ». Le problème venait en réalité
d'une valeur entre guillemets dans `.env`, qui produisait une URL invalide et faisait
planter l'initialisation Langfuse. L'exception était affichée mais invisible dans
`docker compose logs`, à cause du `tty: true`.

**Leçon** : un agent cherche le bug là où il a le droit de regarder, c'est-à-dire
dans le code. La cause était dans l'environnement.

### Le SDK Langfuse ne recevait rien

`@langfuse/otel@4.6.1` exige `@opentelemetry/sdk-node >= 0.202.0`, alors que la
version installée était `0.57.2`. L'erreur (`Cannot read properties of undefined
(reading 'name')`) n'indiquait pas la cause. Le code était conforme à la
documentation, mais les dépendances étaient incompatibles.

### `tty: true` neutralisait la détection de terminal

Ajouté pour permettre la saisie interactive, il faisait passer le test `isTTY` même
en mode détaché : le worker posait alors une question à personne et bloquait la file.
Le retrait de l'option règle les deux modes, `docker compose run` allouant un TTY
de lui-même.

### Les tests unitaires ne prouvent pas le comportement réel

À chaque itération, la suite passait au vert pendant que le système était cassé. Tous
les bugs de ce projet ont été trouvés par des tests de bout en bout (`curl`,
`docker compose logs`, `redis-cli llen`), jamais par `npm test`.

---

## 8. Revue FinOps

Relevé du tableau de bord Langfuse à la clôture du projet.

| Indicateur | Valeur |
|---|---|
| Traces | 18 |
| Observations | 35 |
| Coût total | 0,000598 $ |
| Modèle | `gemini-3.6-flash` (100 % du coût) |
| Coût moyen par analyse | ≈ 0,000033 $ |

**Extrapolation** : 100 000 notifications par mois représenteraient environ 3,30 $.

**Le coût n'est pas le facteur limitant.** Pendant les tests, le worker a rencontré
un `429 Too Many Requests` bien avant que le budget ne devienne un sujet. C'est le
**débit** qui contraint l'architecture, pas la facture. Une vraie mise en production
demanderait une file de sortie et un étalement des appels plutôt qu'une surveillance
du coût.

**Économie structurelle** : les corps vides, non JSON et les remboursements
n'appellent jamais le LLM. Ces cas ne coûtent rien, sans qu'aucune optimisation ait
été nécessaire — c'est une conséquence des règles métier.

Exports dans `audit/` : traces, scores et capture du tableau de bord.

---

## 9. Limites connues

- **Mode détaché et remboursement** : en `docker compose up -d`, une notification
  `action=refund` est consommée sans produire de trace. Le mode nominal prévu par la
  consigne est le mode interactif, qui fonctionne pour les trois cas.
- **Format de décision strict** : le worker rejette toute réponse du LLM qui ne vaut
  pas exactement `conforme`, `non_conforme` ou `a_verifier`. Une ponctuation ou une
  majuscule suffit à provoquer un `echec`.
- **Erreurs `ioredis` brutes** : les tentatives de reconnexion remontent sans message
  d'attente explicite.
- **`condition: service_healthy`** protège d'un Redis lent à démarrer, pas d'un Redis
  totalement absent : Compose démarre alors le conteneur lui-même.
- **Mentions INVEST** : recopiées à l'identique sous chaque User Story par le PO,
  elles affirment la conformité sans la démontrer.
- **Observabilité et données personnelles** : les exports Langfuse contiennent les
  payloads. Sur un vrai flux bancaire, ils constitueraient une copie des données de
  paiement hors du système principal.

---

## 10. Installation et exécution

### Prérequis

Node.js 20+, Docker Desktop, un compte Langfuse Cloud, une clé API Gemini.

### Configuration

```bash
cp .env.example .env
```

Renseigner les valeurs **sans guillemets** (voir section 7) :

```
GEMINI_API_KEY=
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
LLM_MODEL=gemini-3.6-flash
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_BASE_URL=https://cloud.langfuse.com
REDIS_URL=redis://redis:6379
QUEUE_NAME=payment_notifications
```

### Démarrage

```bash
docker compose up -d --build
docker compose ps
```

### Mode interactif (validation des remboursements)

```bash
docker compose stop worker
docker compose run --rm worker
```

### Tests

```bash
npm test
```

Notification normale :

```bash
curl -i -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"paymentId":"PAY-001","amount":150.00,"currency":"EUR"}'
```

Remboursement (worker en mode interactif) :

```bash
curl -i -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"paymentId":"PAY-002","amount":300.00,"currency":"EUR","action":"refund"}'
```

---

## 11. Structure

```
09_megashop_backend/
├── .github/
│   ├── PO-instructions.md
│   ├── DEV-instructions.md
│   └── QA-instructions.md
├── src/
│   ├── server.js
│   ├── worker.js
│   ├── server.test.js
│   └── worker.test.js
├── audit/
├── specifications.md
├── docker-compose.yml
├── Dockerfile
├── .dockerignore
├── .env.example
└── README.md
```

---

## 12. Sécurité du conteneur

Corrections issues des audits QA, chacune vérifiée en exécution :

| Point | Correction | Preuve |
|---|---|---|
| Exécution en root | `USER node` | `docker compose exec worker whoami` → `node` |
| Build non reproductible | `npm ci` au lieu de `npm install` | Lockfile respecté |
| Sources modifiables à l'exécution | `COPY --chown=root:root` | `touch /app/src/server.js` refusé |
| Secrets dans l'image | `.env` dans `.dockerignore` | — |
| Absence de limite de requête | Rejet à 1 Mo avec `413` | `bodySize` tracé, corps non journalisé |

---

## 13. Modèle utilisé

Copilot en mode Agent, routage automatique. Les traces indiquaient
`MAI-Code-1.1-Flash`. Les modèles alternatifs n'étaient pas accessibles avec
l'abonnement utilisé, ce qui rend le choix du modèle non maîtrisable — une limite
à noter pour l'auditabilité, puisque le modèle ayant produit un code donné n'est
connu qu'a posteriori.