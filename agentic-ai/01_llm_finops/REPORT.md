# REPORT Task 0 : La Confrontation des Modèles

## 1. Demande technique volontairement floue

```
Écris un script pour scraper une page web et sauvegarder les données,
en gérant les erreurs
```

Ni langage, ni source, ni données à extraire, ni format de sortie précisés.

## 2. Modèles testés

Voici les deux modèles utilisés :

- **Spécialisé code** : Claude Code
- **Généraliste** : ChatGPT

## 3. Différences observées

Les deux modèles convergent sur la même pile technique : Python, avec les
bibliothèques `requests` et BeautifulSoup. Cette convergence ne traduit pas
une évaluation de pertinence, mais la reproduction du schéma le plus
fréquent dans les données d'entraînement.

| Critère | Claude Code | ChatGPT |
|---|---|---|
| Données extraites | Titre + tous les `<a>` | Balises `<h2>` |
| Format de sortie | JSON (CSV en option) | CSV imposé |
| Cible | URL en argument CLI | URL hardcodée |
| Retry | 3 essais + backoff | Aucun |
| Journalisation | `logging` | `print()` |
| Code de sortie | 1 / 130 | Toujours 0 |

Le point décisif : le **contrat de données**. Même prompt, deux sorties
mutuellement incompatibles : des liens en JSON contre des titres en CSV.

## 4. Choix arbitraires identifiés

**Invention du contrat de données.** ChatGPT écrit `find_all("h2")` pour une
page dont il ignore la structure, et hardcode `example.com`, page qui ne
contient aucun `<h2>`. Le script s'exécute, retourne une liste vide et
affiche "Aucune donnée à sauvegarder". Claude Code décide de son côté que "les données"
désignent les liens.

**Aucune sécurité ni conformité.** Ni `robots.txt`, ni rate limiting, ni
identification honnête (Claude usurpe un `User-Agent` Mozilla). Risque de
blocage IP et exposition juridique en production.

**Gestion d'erreurs en trompe-l'œil (ChatGPT).** Le `except Exception`
retourne `[]`, sans `sys.exit()` : le script sort avec le code 0 même en cas
d'échec total.

## 5. Auto-évaluation

Deux hypothèses arbitraires ressortent. D'abord **l'invention du contrat de
données** : les deux modèles ont décidé seuls quoi extraire, et ont abouti à
deux réponses incompatibles. C'est la preuve que l'on recherche : là où
un moteur de recherche renvoie un résultat stable, deux moteurs de prédiction
produisent deux architectures différentes à partir d'une entrée identique.
Ensuite **l'absence de garde-fous de sécurité** : les modèles n'ont rien
oublié, ils n'avaient aucune raison d'ajouter une contrainte absente du prompt.

Un prompt flou est dangereux en production parce que la dette qu'il génère
est silencieuse. Une erreur de syntaxe arrête le compilateur ; une décision
comblée par probabilité produit du code qui s'exécute, passe le linter et
semble terminé. ChatGPT admet lui-même que `h2` n'est qu'un exemple, tout en
livrant un script exécutable qui masque cette lacune. La dette
sémantique ne se signale pas : elle se déguise en travail fini, et son coût
de correction explose une fois le code intégré et déployé.