# Spécification fonctionnelle : webhook de notification de paiement bancaire

## 1. Objectif
Le système reçoit une notification de paiement envoyée par une banque. Il enregistre la trace de cette notification dans la console et répond immédiatement à la banque avec un statut HTTP 200 OK.

## 2. Décisions validées par le lead
- Payload invalide : un payload vide, non JSON ou structurellement invalide est accepté par le webhook pour la réception, tracé dans la console et suivi d'une réponse HTTP 200 OK. Le système ne doit pas bloquer la banque par un code d'erreur, afin d'éviter les relances inutiles.
- Taille du corps : un corps de requête supérieur à 1 Mo est rejeté avec le statut HTTP 413 Payload Too Large, afin de protéger le service contre la saturation mémoire. Ce cas ne correspond à aucune notification bancaire légitime.
- Contenu de la trace : chaque entrée de console contient, au minimum, le horodatage UTC de réception, la méthode HTTP, le corps brut reçu et le statut HTTP renvoyé. Pour les requêtes rejetées avec le statut HTTP 413 Payload Too Large, la trace contient la taille du corps reçue en octets à la place du corps brut, afin d'éviter la saturation mémoire et la pollution des journaux. Les traces sont destinées au diagnostic technique et à l'audit de réception.
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

### Scenario — Rejet d'un corps de requête trop volumineux
Given le webhook est disponible
When la banque envoie une requête dont le corps dépasse 1 Mo
Then le système rejette la requête avec le statut HTTP 413 Payload Too Large
And le système enregistre une trace dans la console contenant l'horodatage UTC, la méthode HTTP, la taille du corps reçue en octets et le statut HTTP 413
And la trace ne contient pas le corps brut reçu
And le service ne traite pas cette requête comme une notification bancaire légitime

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
- Pour les notifications acceptées, la trace doit inclure au minimum : horodatage UTC, méthode HTTP, corps brut reçu et statut HTTP renvoyé (200 OK).
- Pour les requêtes rejetées avec le statut HTTP 413 Payload Too Large, la trace doit inclure au minimum : horodatage UTC, méthode HTTP, taille du corps reçue en octets et statut HTTP 413, sans inclure le corps brut reçu.
- Le webhook doit répondre avec le statut HTTP 200 OK dans un délai maximal de 1 seconde après réception de la requête pour les notifications de paiement autorisées dans le périmètre du Sprint 1.
- Un corps de requête supérieur à 1 Mo est rejeté avec le statut HTTP 413 Payload Too Large et ne doit pas être traité comme une notification bancaire légitime. Le fait de tracer le corps brut d'un tel rejet annule la protection mémoire et peut saturer les journaux ; c'est pourquoi la taille du corps est tracée à la place.
- Le système ne doit pas renvoyer un statut différent de 200 OK pour les notifications de paiement traitées dans le périmètre du Sprint 1, sauf pour le cas de requête supérieure à 1 Mo explicitement rejetée avec HTTP 413.
- Les doublons ne sont ni détectés ni traités dans ce sprint et ne font pas partie des critères de validation.

## 6. Critère de réussite fonctionnel
La fonctionnalité est considérée comme satisfaite lorsque le webhook reçoit une notification provenant de la banque, enregistre une trace exploitable dans la console et répond systématiquement avec un statut HTTP 200 OK dans le délai défini, y compris pour les payloads invalides, sauf pour les requêtes dont le corps dépasse 1 Mo, qui doivent être rejetées avec le statut HTTP 413 Payload Too Large, sans prise en charge de la déduplication dans le Sprint 1.

## 7. Sprint 2 — Mise en file et analyse asynchrone

### 7.1 Objectif

Le webhook attribue un identifiant unique à chaque notification au moment de sa mise en file, puis la dépose dans une file d'attente Redis et répond immédiatement. Il ne réalise aucun traitement lourd et ne lance pas l'analyse IA. Un service Worker séparé consomme les notifications de la file et réalise l'analyse IA de la transaction.

### 7.2 Résultat attendu de l'analyse IA

La décision attendue pour chaque transaction consommée est l'une des trois valeurs suivantes : `conforme`, `non_conforme` ou `a_verifier`. Le LLM choisit cette décision à partir du corps brut de la notification. Un corps vide ou non JSON produit la décision `a_verifier` sans appel au LLM. Cette décision est un résultat d'analyse destiné au traitement interne de MegaShop ; elle ne constitue pas une autorisation bancaire, un remboursement ou un refus de paiement.

Le Worker écrit la décision dans sa console avec l'identifiant de la notification. Aucun résultat n'est conservé dans un stockage persistant. En cas d'échec de l'analyse, le Worker écrit dans sa console l'état `echec` avec l'identifiant de la notification et n'effectue aucune nouvelle tentative.

### 7.3 User Stories (INVEST)

#### US-04 — Mise en file immédiate de la notification

En tant que banque, je veux que ma notification soit déposée dans une file d'attente afin que le webhook puisse confirmer sa réception sans attendre l'analyse IA.

INVEST : Independent, Negotiable, Valuable, Estimable, Small, Testable.

#### US-05 — Analyse asynchrone de la transaction

En tant qu'opérateur MegaShop, je veux qu'un service Worker séparé consomme les notifications et produise une décision d'analyse afin que les transactions soient examinées après leur réception.

INVEST : Independent, Negotiable, Valuable, Estimable, Small, Testable.

#### US-06 — Résultat exploitable de l'analyse IA

En tant qu'opérateur MegaShop, je veux obtenir pour chaque notification consommée une décision `conforme`, `non_conforme` ou `a_verifier`, ou un état d'échec explicite, afin de savoir quel traitement aval appliquer.

INVEST : Independent, Negotiable, Valuable, Estimable, Small, Testable.

#### US-07 — Architecture orchestrée du Sprint 2

En tant qu'équipe d'exploitation, je veux disposer du webhook, du Worker et d'un conteneur Redis orchestrés par `docker-compose.yml` afin de démarrer l'architecture complète du traitement asynchrone.

INVEST : Independent, Negotiable, Valuable, Estimable, Small, Testable.

### 7.4 Critères d'acceptation (Gherkin)

#### Scenario — Dépôt d'une notification dans la file

Given le webhook et Redis sont disponibles
When la banque envoie une notification dont le corps est compris entre 0 octet et 1 Mo inclus
Then le webhook attribue un identifiant unique à la notification
And le webhook dépose la notification reçue et son identifiant dans la file d'attente
And le webhook ne réalise aucune analyse IA ni autre traitement lourd
And le webhook renvoie le statut HTTP 200 OK dans un délai maximal de 1 seconde

#### Scenario — Corps dépassant la limite

Given le webhook est disponible
When la banque envoie une requête dont le corps brut dépasse 1 Mo
Then le webhook renvoie le statut HTTP 413 Payload Too Large
And la notification n'est pas déposée dans la file d'attente
And aucune analyse IA n'est déclenchée pour cette requête

#### Scenario Outline — Décision du Worker à partir du corps

Given une notification avec l'identifiant <identifiant> est présente dans la file Redis
When le Worker consomme cette notification
Then le Worker demande au LLM de choisir une décision à partir du corps de la notification
And le Worker écrit dans sa console l'identifiant <identifiant> et la décision <decision>
And le Worker ne conserve pas le résultat dans un stockage persistant

Examples:
| cas_notification | identifiant | corps | decision |
| corps_json_valide | NOTIF-001 | {"paymentId":"PAY-12345","amount":150.00,"currency":"EUR"} | conforme, non_conforme ou a_verifier selon le choix du LLM |

#### Scenario Outline — Corps vide ou non JSON sans appel au LLM

Given une notification avec l'identifiant <identifiant> et le corps <corps> est présente dans la file Redis
When le Worker consomme cette notification
Then le Worker ne fait pas appel au LLM
And le Worker écrit dans sa console l'identifiant <identifiant> avec la décision `a_verifier`

Examples:
| cas_notification | identifiant | corps |
| corps_vide | NOTIF-002 | (vide) |
| corps_non_json | NOTIF-003 | {"paymentId": |

#### Scenario — Échec de l'analyse IA

Given une notification est consommée par le Worker
When l'analyse IA échoue
Then le Worker écrit dans sa console l'identifiant de la notification avec l'état `echec`
And le Worker n'effectue aucune nouvelle tentative d'analyse

#### Scenario — Indépendance de la réponse du webhook

Given une notification est déposée dans la file Redis
When le Worker est lent ou indisponible
Then le webhook répond à la banque sans attendre le résultat de l'analyse IA

#### Scenario — Présence des services dans l'orchestration

Given le fichier `docker-compose.yml` est utilisé pour démarrer l'architecture
When l'équipe démarre l'ensemble des services
Then un service webhook, un service Worker séparé et un conteneur Redis sont déclarés
And le Worker peut consommer la file d'attente fournie par Redis

### 7.5 Critères mesurables

- Pour tout corps brut de 0 octet à 1 Mo inclus, le webhook dépose la notification dans Redis et répond HTTP 200 OK en au plus 1 seconde.
- Chaque notification reçoit un identifiant unique au moment de sa mise en file, et cet identifiant est transmis au Worker.
- Le webhook ne réalise aucune analyse IA ni traitement lourd avant d'envoyer sa réponse.
- Pour tout corps strictement supérieur à 1 Mo, le webhook répond HTTP 413 Payload Too Large et ne dépose pas la notification dans Redis.
- Pour un corps vide ou non JSON, le Worker écrit la décision `a_verifier` avec l'identifiant de la notification.
- Pour un corps vide ou non JSON, le Worker produit `a_verifier` sans appeler le LLM.
- Pour chaque notification consommée avec un corps JSON valide, le Worker écrit dans sa console l'identifiant de la notification avec la décision choisie par le LLM, ou l'état `echec` si l'analyse échoue.
- Aucun résultat d'analyse n'est conservé dans un stockage persistant et aucune nouvelle tentative n'est effectuée après un échec.
- Le Worker est un service séparé du webhook et le conteneur Redis est déclaré dans `docker-compose.yml`.

## 8. Hors périmètre du Sprint 2

- Indisponibilité de Redis pendant la réception.
- Délai maximal de traitement du Worker.
- Politique de conservation des messages.
- Déduplication.
