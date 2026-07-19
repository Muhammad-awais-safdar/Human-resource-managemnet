# Backend Engineering Standards: Awais HR

This document details the coding guidelines and practices for all backend service development using Java 21 and Spring Boot 3.x.

---

## 1. Java 21 & Spring Boot Standards

*   **Immutable Types:** Use Java `record` declarations for all data structures (DTOs, event bodies) rather than standard classes.
*   **Virtual Threads:** Use Spring Boot's built-in Virtual Thread executor by setting:
    ```properties
    spring.threads.virtual.enabled=true
    ```
    Do not write custom thread pools using `ExecutorService` unless explicitly required.
*   **Pattern Matching:** Utilize pattern matching for switch blocks and instanceof assertions to write cleaner, more readable logic.

---

## 2. Database & JPA Rules (Hibernate)

*   **Fetch Strategies:** Enforce lazy loading by default on all relational collections:
    ```java
    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    ```
    Avoid `FetchType.EAGER` as it causes performance overhead. Use JPQL `JOIN FETCH` or EntityGraphs to load related entities in queries instead.
*   **Transaction Scope:** Annotate services with `@Transactional`. Methods that perform read-only database operations should use `@Transactional(readOnly = true)`.
*   **Primary Keys:** Use UUID v4 primary keys. Always use generator templates instead of manual ID assignments:
    ```java
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    ```

---

## 3. Libraries & Annotation Usage

*   **Lombok:** Limit Lombok usage to `@Getter`, `@Setter`, and `@Slf4j`. Do not use `@Data` or `@EqualsAndHashCode` on JPA entities because they can cause circular references and performance issues with lazy-loaded collections.
*   **DTO Mappings:** Use **MapStruct** for object mapping. Implement mappings using interface structures. Do not write manual mapping loops or use reflection-based libraries.
