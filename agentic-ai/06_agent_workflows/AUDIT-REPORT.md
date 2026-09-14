# Rapport d'audit DevSecOps et QA

**Projet :** `06_agent_workflows`  
**Date :** 2026-09-14  
**Périmètre :** `scheduler.js`, `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `tasks.json` et `specifications.md`

## Résumé

L'audit a porté sur le code JavaScript, l'image Docker, le contexte de build, le montage de `tasks.json` et la résilience du service face à une corruption transitoire du fichier.

Les protections principales étaient déjà présentes dans l'infrastructure Docker. Deux problèmes ont été corrigés :

1. `tasks.json` était copié dans l'image alors qu'il est fourni par un volume.
2. Une erreur de lecture ou de parsing après un démarrage réussi arrêtait définitivement le service.

## Constats et interventions

| Domaine | Constat | État | Intervention |
| --- | --- | --- | --- |
| Exécution privilégiée | Le conteneur utilise l'utilisateur `node` et l'UID effectif vérifié est `1000`. | Conforme | Aucune modification supplémentaire nécessaire. |
| Image de base | `node:22-alpine` est légère et son digest est figé. | Conforme | Le digest déjà présent a été conservé. |
| Contexte de build | `.dockerignore` exclut notamment `.git`, `node_modules`, les fichiers de logs et les documents Markdown. | Conforme | Aucune modification nécessaire. |
| Données runtime | `tasks.json` est monté depuis l'hôte en lecture seule par Compose. | Corrigé | Suppression de `COPY tasks.json` dans `Dockerfile` pour éviter une copie statique redondante. |
| Durcissement du conteneur | Filesystem en lecture seule, capacités supprimées, `no-new-privileges`, `/tmp` durci et init activé. | Conforme | Mesures déjà présentes conservées. |
| Résilience du scheduler | Une erreur après le premier cycle faisait sortir la boucle et échouer le processus. | Corrigé | Les erreurs runtime sont journalisées ; le scheduler attend le cycle suivant et relit le fichier. |
| Erreur initiale | Un fichier absent, illisible ou invalide au démarrage doit rester fatal. | Conforme | Le premier cycle relance l'erreur et conserve le code de sortie `1`. |

## Modifications appliquées

### `Dockerfile`

- Suppression de la ligne qui copiait `tasks.json` dans l'image.
- Conservation de `COPY --chown=node:node` pour les fichiers applicatifs.
- Conservation de `USER node`.

### `scheduler.js`

- Ajout d'un suivi du premier cycle.
- Une erreur lors du premier chargement arrête le service avec un état d'échec.
- Une erreur détectée après un démarrage réussi est envoyée sur stderr, puis la boucle reprend au cycle suivant.
- Le comportement nominal reste inchangé : une seule tâche `pending` est affichée toutes les 5 secondes.

### `specifications.md`

La spécification a été mise à jour car le comportement de reprise après une erreur transitoire était incompatible avec les anciennes phrases indiquant que toute erreur devait arrêter le service. Elle distingue désormais :

- les erreurs au démarrage, qui sont fatales ;
- les erreurs transitoires après démarrage, qui sont journalisées et récupérées.

## Vérifications exécutées

- `node --check scheduler.js` : réussi.
- `git diff --check` : réussi.
- `docker compose config --quiet` : réussi.
- `docker compose build --no-cache` : réussi.
- Vérification de l'image : `/app/tasks.json` n'est pas présent.
- Vérification de l'utilisateur du conteneur : UID `1000`.
- Démarrage Docker avec le volume réel : plusieurs cycles ont affiché `sync_database`.
- Test de corruption runtime : erreur JSON journalisée, restauration du fichier, puis reprise de `sync_database` sans arrêt définitif.
- Test de JSON invalide au démarrage : message d'erreur explicite et code de sortie `1`.

## Conclusion

Le service respecte les exigences de sécurité Docker auditées et son cycle de vie des données est maintenant cohérent avec le montage en volume. Les erreurs transitoires de `tasks.json` ne provoquent plus l'arrêt définitif du service, tandis que les erreurs présentes dès le démarrage restent signalées comme des échecs de lancement.
