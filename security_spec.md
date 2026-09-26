# Security Specification: Mi Capricho Secreto (Firebase Firestore & Auth)

## 1. Data Invariants
1. **User Identity & Role Integrity**: A non-admin user can NEVER modify their `rol` or elevate privileges to `admin`. Only confirmed admins (or master admin `hernandez.yesid43@gmail.com`) can manage admin status.
2. **PII Isolation**: Contact data (phone, delivery address, order notes) in `/users/{userId}` can only be read by the owner user (`request.auth.uid == userId`) or verified administrative staff.
3. **Order Ownership & State Transitions**: A customer can only query and read their own orders. Only admin kitchen staff can change order statuses (`Pendiente` -> `En Preparación` -> `Listo` -> `Entregado`).
4. **Catalog Integrity**: Public users can read active products, but can NEVER create, edit, or delete items in the `/products` catalog.
5. **Anti-Poisoning & Boundary Enforcements**: All IDs, string fields, and numerics are bounded with strict length and format checks.

## 2. The Dirty Dozen Payloads (Targeting Exploits to Reject)
1. **Payload 1 (Privilege Escalation on Register)**: `POST /users/evil_user` with `{ "rol": "admin" }` -> REJECTED.
2. **Payload 2 (Shadow Field Injection on Update)**: `PATCH /users/uid123` with `{ "isSuperAdmin": true }` -> REJECTED.
3. **Payload 3 (Impersonated Order Retrieval)**: `GET /orders/order_456` by non-owner authenticated user -> REJECTED.
4. **Payload 4 (Unauthorized Status Forgery)**: `PATCH /orders/order_456` with `{ "estado": "Entregado" }` by customer -> REJECTED.
5. **Payload 5 (Unauthenticated Product Deletion)**: `DELETE /products/prod_1` -> REJECTED.
6. **Payload 6 (PII Harvesting Attack)**: Unauthenticated or non-admin query on collection `/users` -> REJECTED.
7. **Payload 7 (Massive String Exhaustion)**: `POST /users/uid123` with 2MB `nombre` string -> REJECTED.
8. **Payload 8 (Malformed Document ID Injection)**: `POST /users/../../../badpath` -> REJECTED.
9. **Payload 9 (Fake Payment Forgery)**: `PATCH /orders/order_789` modifying order `total` from client -> REJECTED.
10. **Payload 10 (Spoofed Admin Write)**: Write to `/admins` collection without verified admin identity -> REJECTED.
11. **Payload 11 (Catalog Manipulation)**: `POST /products/fake_product` by customer -> REJECTED.
12. **Payload 12 (Negative Price Injection)**: `POST /products/prod_hack` with `{ "precio": -50000 }` -> REJECTED.
