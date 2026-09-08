# Task 1 Sécurisation itérative d'une faille d'injection SQL

## Vulnérabilité identifiée

`authenticateUser` construisait sa requête par concaténation directe
des paramètres `email` et `password` :

```js
const sql = "SELECT * FROM users WHERE email = '" + email + "' AND password = '" + password + "'";
```

Une apostrophe présente dans `email` ferme prématurément le littéral
SQL : la valeur cesse d'être une donnée pour devenir de la structure
de requête. Avec l'entrée `admin@entreprise.com' OR '1'='1`, une
clause toujours vraie s'insère dans la condition et le mot de passe
devient sans effet.

Frontière franchie entre données et code : c'est la définition même de
l'injection SQL.

## Prompt utilisé

```
Rôle
Tu es expert en sécurité applicative Node.js, spécialisé dans la
correction de vulnérabilités sur du code legacy.

Contexte
Le fichier #file:src/legacy_auth.js contient une fonction
authenticateUser qui construit une requête SQL par concaténation de
chaînes. Le connecteur db est un simulateur en mémoire dont le
contrat db.query(sql) n'accepte qu'un seul argument de type string
et ne supporte pas les requêtes paramétrées.
La suite #file:test_security.js valide deux comportements : le login
légitime doit continuer de réussir, et une tentative d'injection doit
échouer.

Tâche
Corrige la vulnérabilité d'injection SQL de la fonction
authenticateUser en neutralisant les caractères de contrôle SQL
présents dans les paramètres email et password avant leur
concaténation dans la requête.

Contraintes
- Ne modifie que le fichier src/legacy_auth.js
- Ne touche pas à test_security.js
- Ne modifie pas l'objet db ni la signature de db.query
- Conserve la signature authenticateUser(email, password)
- Conserve à l'identique l'objet retourné en cas de succès
  ({ success: true, user: results[0] }) et en cas d'échec
- Pour des identifiants ne contenant aucun caractère spécial, la
  requête générée doit rester strictement identique à la version
  actuelle
- Aucune dépendance externe
- Ajoute un commentaire expliquant la neutralisation appliquée

Format
Renvoie uniquement le code du fichier modifié, sans texte narratif.
```

## Modifications proposées par l'Agent

Trois lignes ajoutées, une modifiée, dans `src/legacy_auth.js`
uniquement :

- Ajout d'une fonction locale `neutralizeSql` doublant les apostrophes
  (`'` → `''`), convention d'échappement standard en SQL
- Application à `email` et `password` avant concaténation
- Concaténation des variables assainies à la place des paramètres bruts

Non modifiés : l'objet `db`, la signature `authenticateUser(email,
password)`, les objets de retour en succès comme en échec, et
`test_security.js`.

L'agent a ajouté de lui-même un `String(value)` avant le `replace`,
protection non demandée contre un paramètre non-string qui aurait
provoqué une exception.

## Résultats des tests

**Avant correction**

```
Test 1 : Connexion légitime...
[DB ENGINE] SELECT * FROM users WHERE email = 'dev@entreprise.com' AND password = 'password123'
-> OK
Test 2 : Tentative d'injection SQL...
[DB ENGINE] SELECT * FROM users WHERE email = 'admin@entreprise.com' OR '1'='1' AND password = 'hack'
❌ FAILED: FAILLE CRITIQUE DÉTECTÉE
```

**Après correction**

```
Test 1 : Connexion légitime...
[DB ENGINE] SELECT * FROM users WHERE email = 'dev@entreprise.com' AND password = 'password123'
-> OK
Test 2 : Tentative d'injection SQL...
[DB ENGINE] SELECT * FROM users WHERE email = 'admin@entreprise.com'' OR ''1''=''1' AND password = 'hack'
-> OK
✅ PASSED
```

La requête du Test 1 est inchangée au caractère près : aucune
régression fonctionnelle. Celle du Test 2 montre les apostrophes
doublées, qui empêchent la fermeture du littéral.

## Limites de la solution

L'échappement manuel n'est pas la bonne pratique en production : la
réponse correcte à une injection SQL est la requête paramétrée, où le
moteur reçoit structure et données par deux canaux distincts.

Cette solution a été retenue ici parce que le connecteur simulé expose
un contrat `db.query(sql)` à argument unique, incapable de recevoir des
paramètres liés. Passer au paramétrage aurait exigé de modifier `db`,
donc de sortir du périmètre fixé par l'énoncé, et aurait rompu
l'égalité stricte de chaîne dont dépend le Test 1.

Sur un vrai driver, la correction serait `db.query(sql, [email,
password])` avec des placeholders dans la requête.