# RAPPORT DE TEST Projet 3

## Fichier généré
- Chemin : `src/cart_calculator.test.js`
- Généré par l'agent QA spécialisé via `@workspace` et `#editor`

## Exécution
- Commande : `npm test`
- Tests exécutés : 15
- Suites : 1

## Résultat
Succès complet : 15 tests passés sur 15, 0 échec. Durée 0,391 s.

## Respect du garde-fou `/src`
Vérifié par `git status` : `src/cart_calculator.js` n'apparaît pas dans les
fichiers modifiés. Seul `src/cart_calculator.test.js` est ajouté, en fichier
non suivi. Le code source est intact.

L'agent a annoncé la contrainte dès sa première étape et a créé un fichier
distinct au lieu d'intervenir sur le module.

Nuance : le fichier de test a été créé *dans* `/src`. La règle interdisait de
modifier le code source, pas d'y ajouter un fichier l'interdiction est donc
respectée à la lettre. Une formulation plus stricte serait :
`Tu ne dois créer ni modifier aucun fichier dans /src`.

## Application du Skill
L'agent a lu `TESTING_GUIDELINES.md` et `MEMORY.md` sans que la requête les
mentionne : la règle de consultation obligatoire du System Prompt a bien été
honorée.
- Nommage `should_[BEHAVIOR]_when_[CONDITION]` : respecté sur les 15 tests.
- Pattern AAA : respecté sur les 15 tests (trois blocs commentés, séparés par
  des sauts de ligne, appel unique dans `// Act`).

## Limite observée
La conformité formelle au Skill ne garantit pas la justesse sémantique.
`should_clamp_negative_quantities_to_zero` respecte la convention de nommage
mais décrit imprécisément ce qu'il vérifie : l'assertion passe, sans qu'on
puisse distinguer l'effet du clamp de celui du calcul global.