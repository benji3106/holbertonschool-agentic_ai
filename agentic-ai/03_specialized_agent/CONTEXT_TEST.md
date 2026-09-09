# TEST DE SATURATION DU CONTEXTE

## Protocole
Session de génération des tests conservée, puis saturation de l'historique par
quatre requêtes hors-sujet appelant de longues réponses (exposés sur le Japon).
Question posée sans opérateur de ciblage : « Rappelle-moi la règle de nommage
exacte de nos tests selon nos guidelines d'entreprise ? »

## Réponse avant purge du contexte
Règle restituée exactement : `should_[EXPECTED_BEHAVIOR]_when_[CONDITION]`
Exemple donné : `should_return_zero_when_cart_is_empty`
Précisions ajoutées : noms en anglais, usage de `it()` ou `test()`.

## Réponse après réinitialisation
Nouveau chat, initialisation via `@workspace` sur le fichier de mémoire, puis
même question. Trace d'exécution : `Read TESTING_GUIDELINES.md`.
Règle restituée exactement : `should_[EXPECTED_BEHAVIOR]_when_[CONDITION]`
Exemple donné : `should_return_zero_when_cart_is_empty`
Précisions ajoutées : pattern AAA avec les commentaires `// Arrange`, `// Act`,
`// Assert`.

## Constat
Aucune dégradation observée. Les deux réponses sont exactes et concordantes ;
seules les précisions secondaires diffèrent.

L'expérience n'a pas reproduit le phénomène « Lost in the Middle », et la trace
d'exécution en donne la raison : dans la seconde session, l'agent a relu
`TESTING_GUIDELINES.md` au moment de répondre plutôt que de puiser dans
l'historique. Le System Prompt du projet lui impose cette consultation et il est
réinjecté en début de contexte à chaque requête zone de forte attention. Le
spam pouvait diluer le souvenir de la règle, mais l'agent n'avait pas besoin de
s'en souvenir : il avait l'ordre permanent d'aller la rechercher.

Le dispositif mis en place à la tâche 0 a donc neutralisé la faille que cette
tâche cherchait à révéler. La saturation reste un risque réel pour les décisions
prises en cours de conversation et jamais écrites dans un fichier ; elle ne
menace pas les normes externalisées.

## Limites méthodologiques
- Copilot a routé automatiquement la requête vers GPT-5.6 Luna. Les deux
  sessions n'ont pas nécessairement utilisé le même modèle, ce qui affaiblit la
  comparaison.
- Le volume injecté était peut-être insuffisant pour saturer une fenêtre de
  contexte moderne.
- Les deux sessions signalent une mémoire native de dépôt vide : la persistance
  observée provient uniquement des fichiers du projet.