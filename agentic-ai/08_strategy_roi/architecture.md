# Architecture — MegaShop-B2B

```mermaid
flowchart LR
    U["Clients B2B (50k simultanés)"] --> CDN["CDN + WAF"]
    CDN --> LB["Load Balancer"]
    LB --> GW["API Gateway (rate limiting, auth)"]

    subgraph APP["Services stateless (autoscaling)"]
        CART["Cart Service"]
        ORDER["Order Service"]
        PAY["Payment Service"]
    end

    GW --> CART
    GW --> ORDER
    GW --> PAY

    CART --> REDIS[("Redis Cluster - paniers en mémoire (C1)")]
    ORDER --> PG[("PostgreSQL primaire")]
    PG -.réplication.-> PGR[("Réplicas en lecture")]

    PAY --> MQ["File de messages RabbitMQ (C3)"]
    MQ --> WORKER["Payment Worker (timeout, retry, circuit breaker)"]
    WORKER --> BANK["API bancaire externe (~4 s)"]
    WORKER --> NOTIF["Notification client (WebSocket / webhook)"]

    CART --> BUS["Bus d'événements Kafka (C2)"]
    ORDER --> BUS
    WORKER --> BUS
    BUS --> AUDIT[("Stockage WORM - Object Lock (C2)")]
```

| Contrainte | Réponse |
|---|---|
| C1 — Panier < 50 ms et résilient | Redis Cluster répliqué, indépendant de PostgreSQL |
| C2 — Audit inaltérable | Événements Kafka archivés en stockage objet WORM |
| C3 — API bancaire lente | Traitement asynchrone via file de messages + notification |