# Task 0 Contexte implicite et architecture

## Prompt utilisé

```
Rôle
Tu es développeur senior Node.js, chargé de maintenir la cohérence
architecturale d'une base de code existante.

Contexte
Projet Node.js en CommonJS, sans framework et sans dépendance externe.
L'architecture sépare les services (src/services/) des repositories
(src/repositories/).
Fichiers de référence : #file:src/services/user.service.js
et #file:src/repositories/user.repository.js

Tâche
Crée le fichier src/services/export.service.js.
Il expose une classe ExportService avec une méthode
async exportUserProfile(email) qui :
- récupère l'utilisateur via le repository existant
- lève une erreur si l'utilisateur est introuvable
- retourne un objet contenant les données de l'utilisateur et un champ
  exportedAt au format ISO

Contraintes
- Reproduis exactement le pattern de user.service.js : import du
  repository en tête de fichier, classe sans constructeur, export d'une
  instance via module.exports = new ExportService()
- N'utilise que la méthode findByEmail : c'est la seule que le
  repository expose
- Aucune dépendance externe, aucun import Node natif
- Aucune écriture de fichier sur le disque
- Pas de try/catch : la gestion d'erreur se fait par throw
- Messages d'erreur en français

Format
Renvoie uniquement le code JavaScript du fichier, sans commentaire
explicatif ni texte narratif.
```

## Fichiers fournis comme contexte

| Fichier | Opérateur | Rôle dans le prompt |
|---|---|---|
| `src/services/user.service.js` | `#file:` | Modèle du pattern de service à reproduire |
| `src/repositories/user.repository.js` | `#file:` | Contrat d'accès aux données (méthodes disponibles) |

## Service généré

`src/services/export.service.js`

## Éléments d'architecture repris par l'IA

**Repris sous contrainte explicite du prompt :**

- Import du repository en tête de fichier, chemin relatif `../repositories/`
- Classe sans constructeur, aucune injection de dépendance
- Export d'une instance : `module.exports = new ExportService()`
- Gestion d'erreur par `throw new Error()`, sans `try/catch`
- Appel limité à `findByEmail`, seule méthode exposée par le repository
- Message d'erreur en français

**Déduit seul du fichier de référence, sans instruction :**

- Indentation par tabulation
- Guillemets doubles pour les chaînes
- Méthode déclarée `async` bien qu'aucune opération asynchrone ne soit
  nécessaire
- Formulation du message d'erreur proche de l'existant

## Observations

La première génération présentait un écart au pattern :
`await userRepository.findByEmail(email)`, alors que la méthode est
synchrone et que `user.service.js` n'utilise pas `await`. Le réflexe
statistique « méthode async donc await sur l'appel » a pris le pas sur
la copie du modèle fourni, malgré la contrainte « reproduis exactement
le pattern ».

Correction obtenue par un second prompt ciblé sur `#editor`, énonçant
le fait technique (méthode synchrone), la référence (`user.service.js`)
et une contrainte de non-régression : « Ne modifie rien d'autre ».
L'agent a retiré l'`await` sans toucher au reste du fichier.

Ce cycle illustre la stratégie de correction itérative : le prompt
s'enrichit là où il a échoué plutôt que d'anticiper toutes les dérives
possibles. La contrainte de périmètre est l'élément décisif ; sans
elle, une demande de correction ponctuelle déclenche fréquemment une
réécriture complète du fichier.