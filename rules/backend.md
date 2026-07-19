# Rule: Backend Development (Spring Boot & Java 21)

This file details the development guidelines for Java 21 and Spring Boot 3.x backend components.

---

## 1. Java 21 Coding Conventions

*   **Records:** Use Java `record` declarations for all data structures (DTOs, Webhook payloads, Event logs). Do not use mutable standard classes.
*   **Virtual Threads:** Configure Spring Boot to run on virtual threads. Do not initialize standard pool managers unless specifically required.
*   **Switch Pattern Matching:** Leverage pattern matching for switch blocks when handling multiple implementation classes.

---

## 2. JPA & Hibernate Guidelines

*   **Lazy Fetching:** All relationship fields (`@OneToMany`, `@ManyToMany`, `@OneToOne`, `@ManyToOne`) must be annotated with `FetchType.LAZY`. `FetchType.EAGER` is strictly forbidden.
*   **Primary Keys:** Use UUID v4 primary keys generated dynamically using `@GeneratedValue(strategy = GenerationType.UUID)`.
*   **Transactions:** Service methods must be annotated with `@Transactional`. For query-only operations, enforce `@Transactional(readOnly = true)`.

---

## 3. Libraries & Mapper Settings

*   **Lombok Restriction:** Do not use `@Data` or `@EqualsAndHashCode` on database entities, as they can cause circular references and performance issues with lazy-loaded collections. Limit annotations to `@Getter`, `@Setter`, and `@Slf4j`.
*   **MapStruct:** Use MapStruct for DTO mappings. Implement mappings using interface structures. Do not write manual mapping loops or use reflection-based libraries.
