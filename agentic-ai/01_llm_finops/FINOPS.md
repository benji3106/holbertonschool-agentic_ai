# FINOPS Task 1 : L'Audit du Gouffre

## 1. Mesure du System Prompt

| Élément | Valeur |
|---|---|
| Outil | OpenAI Tokenizer |
| Modèle / encodage | GPT-5.x & O1/3 (`o200k_base`) |
| **Tokens** | **75** (332 caractères) |

Ratio de 4,4 caractères par token, au-dessus de la règle empirique anglaise
(~4) : le prompt est rédigé en français, donc plus fragmenté.

## 2. Hypothèses

L'énoncé indique que l'historique est conservé et que chaque réponse de 500
tokens s'ajoute au contexte suivant, sans mentionner de message utilisateur
supplémentaire. D'où :

- Contexte de base : `75 + 15 000 = 15 075` tokens
- Input itération *n* : `15 075 + (n − 1) × 500`
- Output constant : `500` tokens
- Tarifs : 5 $ / 1M input, 15 $ / 1M output

## 3. Coût d'une exécution unique

```
Coût = (15 075 × 5 / 1M) + (500 × 15 / 1M)
     = 0,075375 + 0,007500
     = 0,082875 $
```

L'input représente 91 % du coût malgré un tarif trois fois inférieur : le
volume écrase le prix unitaire.

## 4. Boucle de 10 itérations

| Itération | Input | Coût ($) | Cumul ($) |
|---:|---:|---:|---:|
| 1 | 15 075 | 0,082875 | 0,082875 |
| 2 | 15 575 | 0,085375 | 0,168250 |
| 3 | 16 075 | 0,087875 | 0,256125 |
| 4 | 16 575 | 0,090375 | 0,346500 |
| 5 | 17 075 | 0,092875 | 0,439375 |
| 6 | 17 575 | 0,095375 | 0,534750 |
| 7 | 18 075 | 0,097875 | 0,632625 |
| 8 | 18 575 | 0,100375 | 0,733000 |
| 9 | 19 075 | 0,102875 | 0,835875 |
| 10 | 19 575 | 0,105375 | **0,941250** |

**Coût cumulé : 0,9413 $** pour 178 250 tokens (173 250 input + 5 000 output).

## 5. Auto-évaluation

**Vérification.** Recalcul indépendant du tableau via la progression
arithmétique :

```
Σ Input = 10 × 15 075 + 500 × (0+1+...+9) = 150 750 + 22 500 = 173 250
Coût = (173 250 × 5 / 1M) + (5 000 × 15 / 1M) = 0,86625 + 0,075 = 0,941250 $
```

Les deux méthodes concordent.

**Nature de la croissance.** L'input par itération croît de façon **linéaire**
(+500 tokens, soit +0,0025 $ par tour). C'est le **cumul** qui évolue en
**O(N²)**, matérialisé par le terme `500 × 45 = 22 500` tokens d'historique
payés en pure perte. Le travail utile, lui, reste linéaire : 500 tokens
générés par tour. Sur 10 itérations le surcoût n'est que de 13,6 % par
rapport à un contexte constant — cette faiblesse du signal initial est
précisément ce qui rend la fuite dangereuse.

**Optimisation : troncature du contexte.** En ne conservant que la dernière
réponse au lieu de tout l'historique, l'input se stabilise à 15 575 tokens :
`10 × (15 575 × 5 / 1M + 500 × 15 / 1M) = 0,8538 $`, soit **9,3 % d'économie**
et surtout un coût redevenu linéaire. Deux leviers complémentaires : le
**prompt caching** sur les 15 075 tokens constants, et un **plafond
d'itérations** (arrêt après 3 échecs) ; redémarrer avec une consigne resserrée
coûte moins cher que laisser l'agent s'entêter sur un historique pollué.