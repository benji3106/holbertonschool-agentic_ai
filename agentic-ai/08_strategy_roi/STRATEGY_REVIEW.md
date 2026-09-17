# Strategy Review Agentic AI & MegaShop-B2B

## Recommandation
**Adopter l'IA agentique pour l'équipe de 5 développeurs**, à condition de réinvestir le temps gagné dans la relecture et la conception système. L'IA accélère la production ; la valeur vient de la validation humaine.

## 1. Rentabilité (Task 0)
- Coût des 3 tâches : **4 800 € en classique contre 989,50 € en agentique**, soit **−79 %**.
- **71 heures libérées** sur 88, soit l'équivalent de deux semaines de travail d'un développeur.
- Économie la plus forte : refactoring legacy (1 775 €). Meilleur rendement : module d'authentification (×6,9 par euro investi).
- **Enseignement clé :** les tokens ne pèsent que 4 % du coût agentique. Le vrai poste de coût reste le temps humain de supervision.

## 2. Architecture proposée (Task 1)
Une plateforme de services stateless derrière un CDN et une API Gateway, où **chaque contrainte métier est traitée par un stockage dédié** (persistance polyglotte) :

| Contrainte | Choix technique majeur |
|---|---|
| Panier < 50 ms, résilient à une panne de base | Redis Cluster répliqué, indépendant de PostgreSQL |
| Audit légal inaltérable | Bus Kafka alimenté par tous les services, archivé en stockage WORM |
| API bancaire lente (4 s) | Paiement asynchrone : RabbitMQ, worker avec circuit breaker, notification client |
| Données métier | PostgreSQL (ACID) avec réplicas en lecture |

## 3. Travail avec l'IA : conservé vs corrigé
**Conservé : le bus d'événements et le stockage WORM pour l'audit.**
Copilot l'a proposé dès sa première version. Je l'ai gardé parce qu'une table SQL peut être modifiée par un administrateur, alors qu'un stockage à verrouillage d'objet ne le permet pas. C'est la seule réponse crédible à l'exigence légale.

**Corrigé : la dépendance du panier à la base principale.**
Une version générée reliait le Cart Service directement à la base principale. J'ai supprimé ce lien, car il contredit la contrainte C1 : si la base tombe, le panier tombe aussi.

**Corrigé : plusieurs erreurs de cohérence.**
- Les événements du panier n'étaient pas reliés à l'audit. L'exigence porte sur *toutes* les actions, donc j'ai ajouté le lien.
- La notification partait de l'API bancaire. C'est notre service de paiement qui notifie le client, pas la banque.
- Copilot avait inventé une contrainte « C4 » et utilisait des technologies vagues (« store dédié »). Un document de décision doit nommer ses choix.

**Remis en question : l'Idempotency Store et la hash chain.**
Ces deux propositions sont pertinentes, mais je ne les ai pas intégrées dans cette première version pour garder une architecture lisible. Elles sont à ajouter avant la mise en production : l'idempotence est indispensable pour éviter un double débit lors des retries.

## 4. Compromis assumés
- **Coût et complexité :** 4 technologies à exploiter et à superviser, contre une seule base.
- **Cohérence :** le panier et la commande ne sont synchronisés qu'à terme (cohérence éventuelle).
- **Expérience utilisateur :** la confirmation de paiement est différée, en échange d'un site qui ne se bloque jamais.
- **Sécurité et conformité :** l'audit est robuste, mais son stockage coûte de plus en plus cher avec le temps. Il faut une politique de rétention.

## 5. Conclusion
**Oui, je recommande cette approche**, sous trois conditions :
1. **Supervision humaine systématique.** L'IA a produit des erreurs d'architecture qui auraient violé les contraintes métier sans relecture.
2. **Cibler les tâches structurées** (authentification, migrations) en priorité, puis étendre au reste.
3. **Mesurer le coût réel**, temps humain compris, et pas seulement les tokens (observabilité type Langfuse).

L'IA ne remplace pas l'architecte. Elle déplace son temps de l'écriture vers la décision.