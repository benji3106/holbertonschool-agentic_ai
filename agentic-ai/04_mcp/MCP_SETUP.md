# Configuration du serveur MCP CRM

## Serveur configuré

- Clé déclarée dans `.vscode/mcp.json` : `crm-server`
- Nom annoncé par le serveur à l'initialisation : `crm-mock-server` (version 1.0.0)
- Transport : `stdio`, lancement via `/usr/bin/env node` sur le chemin absolu de `mcp_server.js`

La clé de configuration est une étiquette locale à VS Code. Le nom qui circule
dans le protocole est celui que le serveur déclare lui-même, ce qui explique
l'écart entre les deux.

## Tool détecté

`mcp_crm-mock-serv_get_customer_status`

Le nom réel côté serveur est `get_customer_status`. Le client le préfixe avec
`mcp_` et le nom du serveur (tronqué) pour éviter les collisions entre plusieurs
serveurs exposant un outil homonyme.

L'outil attend un argument `email` de type `string`, déclaré `required` dans son
`inputSchema`, et renvoie le statut du client ainsi que l'état de sa commande.

## Résultat de la vérification

Deux niveaux de contrôle ont été effectués :

1. **Chargement côté client** : l'outil apparaît dans le sélecteur d'outils de
   Copilot Chat, ce qui confirme que VS Code a lancé le serveur et obtenu une
   réponse à `tools/list`.
2. **Présence dans le contexte du modèle** : interrogé sur ses outils externes,
   Copilot a listé `mcp_crm-mock-serv_get_customer_status` en le décrivant
   correctement, et a précisé n'avoir aucun autre serveur MCP exposé.

Le second point est le plus significatif : il prouve que la description de
l'outil est injectée dans la fenêtre de contexte à chaque requête, condition
nécessaire pour que le modèle puisse décider de l'appeler.