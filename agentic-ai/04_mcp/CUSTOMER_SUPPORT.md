# Agent Support Client exécution d'un Tool de lecture

## Prompt utilisé

> Un client se plaint que sa commande est bloquée. Son email est
> `ceo@entreprise.com`. Exécute explicitement l'outil MCP nommé
> `get_customer_status` pour trouver le statut de sa commande et rédige un
> brouillon d'email d'excuses techniques.

Le ciblage explicite de l'outil par son nom évite que le modèle réponde de
mémoire ou choisisse un autre moyen d'obtenir l'information.

## Tool MCP exécuté

`get_customer_status`, exposé par le serveur `crm-server` (déclaré
`crm-mock-server` côté protocole).

Le modèle a extrait l'argument `{ "email": "ceo@entreprise.com" }` de la phrase
en langage naturel, conformément à l'`inputSchema` de l'outil. Aucune demande
d'approbation n'a été affichée : s'agissant d'un outil de lecture sans effet de
bord, le client l'a auto-approuvé.

## Statut retourné par le CRM

Commande n°102 - retardée, rupture de stock. Client classé VIP.

## Brouillon généré par l'Agent

> **Objet : Mise à jour concernant votre commande n°102**
>
> Bonjour,
>
> Nous vous présentons nos sincères excuses concernant le retard de votre
> commande n°102.
>
> Un problème d'approvisionnement a entraîné une rupture de stock sur l'un des
> articles commandés, ce qui bloque temporairement son expédition. Nos équipes
> travaillent à réapprovisionner le produit et à traiter votre commande dès sa
> disponibilité.
>
> Nous vous tiendrons informé dès que nous disposerons d'une date d'expédition
> confirmée. Nous regrettons cette situation et vous remercions pour votre
> patience.
>
> Cordialement,
> L'équipe support technique