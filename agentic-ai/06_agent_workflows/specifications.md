# Spécifications fonctionnelles

## Objectif

Mettre à disposition un service conteneurisé qui lit périodiquement `tasks.json` et affiche dans la console l’action de la première tâche dont le statut est `pending`.

## Entrées

Le fichier `tasks.json` contient une liste de tâches avec les propriétés :

- `id` : identifiant numérique obligatoire
- `action` : nom de l’action à afficher
- `status` : statut de la tâche

Exemple actuel :

- `sync_database` est la première tâche `pending`
- `clear_cache` est également `pending`
- `send_daily_reports` est `done`

## Fonctionnement attendu

1. Le service charge `tasks.json` au démarrage.
2. Il recherche la première tâche dans l’ordre du fichier dont `status` vaut exactement `pending`.
3. Il affiche la valeur de `action` dans la sortie standard.
4. Il attend 5 secondes.
5. Il relit entièrement le fichier et recommence indéfiniment.
6. Toute modification de l’ordre ou du statut des tâches doit être prise en compte au cycle suivant.

Le service ne modifie jamais `tasks.json` et ne change pas le statut des tâches.

## Cas particuliers

- Aucune tâche `pending` : afficher un message explicite indiquant qu’aucune tâche n’est disponible.
- Fichier absent ou illisible : afficher une erreur explicite et arrêter le service avec un état d’échec.
- JSON invalide : afficher une erreur explicite et arrêter le service avec un état d’échec.
- Tâche sans `action` ou sans `status` : considérer le fichier comme invalide.
- Les statuts différents de `pending` doivent être ignorés.

## Exigences Docker

- Le service doit être exécuté dans un conteneur Docker.
- `tasks.json` doit être fourni au conteneur par montage de volume ou être intégré à l’image.
- Le processus principal du conteneur doit rester actif afin d’assurer la boucle périodique.
- Les messages doivent être écrits sur la sortie standard ou la sortie d’erreur du conteneur.
- L’arrêt du conteneur doit interrompre proprement la boucle.
- Aucun service externe ni base de données ne doit être nécessaire.

## Critères d’acceptation

- Au démarrage avec le fichier actuel, la console affiche `sync_database`.
- Le fichier est relu toutes les 5 secondes environ.
- Si `sync_database` passe à `done`, le cycle suivant affiche `clear_cache`.
- Si toutes les tâches sont terminées, un message “aucune tâche pending” est affiché.
- Une modification du fichier est visible sans redémarrer le conteneur.
- Le conteneur démarre avec une seule commande documentée.
- Une erreur de fichier ou de format est clairement visible dans les logs et provoque l’arrêt du conteneur.
- Le comportement reste identique après plusieurs cycles successifs.