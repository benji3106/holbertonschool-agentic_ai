# Standards de code — Projet Sentinel

## Stack
- JavaScript natif (ES2022+), HTML5 et CSS3 purs.
- Le dashboard n'utilise aucune dépendance npm et aucun script ou feuille de style chargé depuis un CDN.

## Réseau et asynchrone
- Les appels HTTP utilisent uniquement `fetch` natif avec `async/await`. Pas d'axios, pas de chaînes de `.then()`.
- Tout appel réseau est placé dans un bloc `try/catch`.
- `fetch` ne lève pas d'exception sur une erreur HTTP : tu DOIS vérifier `response.ok` et traiter explicitement les statuts 401, 403 (rate limit) et 404.
- Tout appel réseau a un délai maximal via `AbortSignal.timeout()`.
- Une panne réseau ne fait jamais crasher l'application : elle produit un message d'erreur exploitable.

## Sécurité
- Le token est lu uniquement côté Node, depuis `process.env.GITHUB_TOKEN`. Il n'apparaît jamais dans le code du dashboard ni dans les logs.
- Les données issues de l'API (titres, labels, auteurs) sont insérées dans le DOM avec `textContent`, jamais avec `innerHTML`.

## Nommage
- Variables et fonctions en camelCase, constantes en UPPER_SNAKE_CASE.
- Une fonction = une responsabilité.