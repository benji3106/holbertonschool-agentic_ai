# Spécification fonctionnelle : webhook de notification de paiement bancaire

## 1. Objectif
Le système reçoit une notification de paiement envoyée par une banque. Il enregistre la trace de cette notification dans la console et répond immédiatement à la banque avec un statut HTTP 200 OK.

## 2. Décisions validées par le lead
- Payload invalide : un payload vide, non JSON ou structurellement invalide est accepté par le webhook pour la réception, tracé dans la console et suivi d'une réponse HTTP 200 OK. Le système ne doit pas bloquer la banque par un code d'erreur, afin d'éviter les relances inutiles.
- Contenu de la trace : chaque entrée de console contient, au minimum, le horodatage UTC de réception, la méthode HTTP, le corps brut reçu et le statut HTTP renvoyé. Les traces sont destinées au diagnostic technique et à l'audit de réception.
- Doublons : hors périmètre du Sprint 1. Le système ne fait ni déduplication ni filtrage de doublons.

## 3. User Stories (INVEST)

### US-01 — Réception de notification de paiement
En tant que banque, je veux envoyer une notification de paiement au webhook afin d'informer MegaShop de la réception d'un paiement.

INVEST : Independent, Negotiable, Valuable, Estimable, Small, Testable.

### US-02 — Trace de réception
En tant qu'opérateur ou équipe support, je veux que chaque notification reçue soit tracée dans la console afin de pouvoir consulter l'événement et diagnostiquer une anomalie de réception.

INVEST : Independent, Negotiable, Valuable, Estimable, Small, Testable.

### US-03 — Accusé de réception
En tant que banque, je veux recevoir immédiatement un statut HTTP 200 OK après l'envoi de la notification afin de confirmer la bonne réception sans déclencher de tentative de renvoi.

INVEST : Independent, Negotiable, Valuable, Estimable, Small, Testable.

## 4. Critères d'acceptation (Gherkin)

### Scenario Outline — Réception d'une notification envoyée par la banque
Given le webhook est disponible
When la banque envoie une notification de paiement au webhook avec <corps_envoye>
Then le système enregistre une trace dans la console contenant l'horodatage UTC, la méthode HTTP, le corps brut reçu et le statut HTTP 200 OK
And le système renvoie le statut HTTP 200 OK
And la réponse est envoyée dans un délai maximum de 1 seconde après la réception

Examples:
| cas_payload | corps_envoye |
| objet_json_valide | {"paymentId":"PAY-12345","amount":150.00,"currency":"EUR"} |
| corps_vide | (vide) |
| json_mal_formé | {"paymentId":"PAY-67890","amount": |
| json_non_objet | ["PAY-67890",150.00,"EUR"] |

(vide) signifie qu'aucun corps n'est envoyé dans la requête.

## 5. Critères mesurables
- Le système doit enregistrer une trace dans la console pour chaque requête reçue, y compris lorsque le payload est vide, invalide ou non conforme au format attendu.
- La trace doit inclure au minimum : horodatage UTC, méthode HTTP, corps brut reçu et statut HTTP 200 OK.
- Le webhook doit répondre avec le statut HTTP 200 OK dans un délai maximal de 1 seconde après réception de la requête.
- Le système ne doit pas renvoyer un statut différent de 200 OK pour les notifications de paiement traitées dans le périmètre du Sprint 1.
- Les doublons ne sont ni détectés ni traités dans ce sprint et ne font pas partie des critères de validation.

## 6. Critère de réussite fonctionnel
La fonctionnalité est considérée comme satisfaite lorsque le webhook reçoit une notification provenant de la banque, enregistre une trace exploitable dans la console et répond systématiquement avec un statut HTTP 200 OK dans le délai défini, y compris pour les payloads invalides, sans prise en charge de la déduplication dans le Sprint 1.
