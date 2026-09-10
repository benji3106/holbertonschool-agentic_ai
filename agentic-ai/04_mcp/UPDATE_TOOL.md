# Développement d'un Tool MCP en écriture

## Tool ajouté

`update_customer_status`, déclaré dans `mcp_server.js` aux côtés de
`get_customer_status`.

Deux arguments obligatoires : `email` (string) et `new_status` (string
restreint par un `enum` aux valeurs `Active`, `VIP`, `Inactif`). La description
exposée à l'IA signale explicitement qu'il s'agit d'une action en écriture,
afin que le modèle puisse arbitrer entre les deux outils.

La liste des statuts autorisés est déclarée une seule fois dans la constante
`ALLOWED_STATUSES`, utilisée à la fois par le JSON Schema exposé au modèle et
par la validation côté serveur. Le schéma et le contrôle ne peuvent donc pas
diverger.

## Paramètres transmis lors du test

Prompt :

> Exécute explicitement l'outil MCP `update_customer_status` pour passer le
> client `dev@entreprise.com` en statut Inactif

Payload construit par le modèle à partir de cette phrase :

```json
{
  "email": "dev@entreprise.com",
  "new_status": "Inactif"
}
```

## Résultat retourné par le Tool

```
Statut du client dev@entreprise.com mis à jour : "Active" → "Inactif"
```

Le message de succès contient l'ancienne et la nouvelle valeur. C'est ce qui
permet à l'agent de reformuler fidèlement le résultat (« Active → Inactif »)
sans rien inventer : toute l'information nécessaire est dans le `content`
renvoyé par l'outil.

## Vérification Human-in-the-Loop

Une boîte de dialogue d'autorisation est apparue avant l'exécution, à l'issue
du premier prompt envoyé à Copilot. Trois points ont été contrôlés avant de
valider :

- le nom de l'outil appelé correspondait bien à `update_customer_status` ;
- les deux arguments transmis étaient conformes à la demande, sans paramètre
  supplémentaire ;
- la valeur `Inactif` appartenait à la liste des statuts autorisés.

Cette validation manuelle sépare l'intention de l'exécution : le client gèle
la requête `tools/call` et ne la transmet au serveur qu'après approbation
explicite. Elle ne dispense pas pour autant des contrôles codés dans le
serveur (vérification de l'existence du client et validation de `new_status`
contre `ALLOWED_STATUSES`) qui restent la seule garantie indépendante du
comportement du client.