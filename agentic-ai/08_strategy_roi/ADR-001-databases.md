# ADR-001 : Stratégie de stockage multi-bases (Polyglot Persistence)

**Statut :** Accepté
**Date :** 2026-09-16

## Contexte
MegaShop-B2B doit supporter 50 000 utilisateurs simultanés avec trois exigences
incompatibles avec une base unique :
- C1 : panier < 50 ms, disponible même si la base principale tombe ;
- C2 : historique complet et inaltérable des actions (obligation légale) ;
- C3 : paiements dépendant d'une API bancaire lente (~4 s).

## Décision
Adopter une persistance polyglotte, chaque stockage répondant à une contrainte :

| Stockage | Usage | Justification |
|---|---|---|
| Redis Cluster | Paniers | Lecture/écriture en mémoire (< 1 ms), réplication et persistance AOF, découplé de PostgreSQL (C1) |
| PostgreSQL + réplicas | Commandes, clients, catalogue | Transactions ACID et intégrité référentielle pour les données financières ; réplicas pour absorber la lecture |
| Kafka + stockage objet WORM | Journal d'audit | Log append-only, rejouable ; Object Lock empêche toute modification ou suppression (C2) |
| RabbitMQ | Paiements en attente | Découple la requête utilisateur de l'API bancaire ; messages persistants et rejouables (C3) |

## Conséquences
**Positives**
- Chaque contrainte est traitée par l'outil adapté.
- Une panne de PostgreSQL n'empêche pas la constitution des paniers.
- Traçabilité légale garantie et auditable.
- L'utilisateur n'attend pas 4 s bloqué sur le paiement.

**Négatives**
- Complexité opérationnelle accrue (4 technologies à maintenir et superviser).
- Cohérence à terme (eventual consistency) entre panier et commande.
- Coût d'infrastructure plus élevé qu'une base unique.

## Alternatives écartées
- **PostgreSQL seul** : ne garantit ni la latence sous charge ni la disponibilité du panier en cas de panne.
- **Table d'audit dans PostgreSQL** : modifiable par un administrateur, donc non conforme à l'exigence d'inaltérabilité.
- **Appel bancaire synchrone** : bloque les connexions pendant 4 s et sature les serveurs à 50 000 utilisateurs.