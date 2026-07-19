# Backend Design & Coding Standards: Awais HR

This document details the backend folder organization, design patterns, exception handling mechanisms, and coding guidelines for the **Awais HR** platform.

---

## 1. Backend Project Folder & Package Structure

We follow a **Modular Monolith** architecture. Code is organized by domain module (Feature boundary) rather than simple technical layer folders. This ensures high cohesion and makes it easy to split components into microservices later if necessary.

```
com.awaishr
├── core
│   ├── config             # System-wide configuration (Security, Redis, Broker)
│   ├── exception          # Global Exceptions & Error Handlers
│   ├── tenant             # Tenant resolution, context, routing configurations
│   └── util               # Shared utilities
│
└── modules
    ├── corehr             # Core HR feature module
    │   ├── controller
    │   ├── model          # Entities, DB Mappings
    │   ├── repository     # Spring Data interfaces
    │   ├── service
    │   └── dto
    │
    ├── leave              # Leave feature module
    ├── attendance         # Attendance feature module
    └── payroll            # Payroll feature module
```

---

## 2. Naming Conventions & Patterns

*   **Controllers:** Suffix with `Controller` (e.g., `EmployeeController`).
*   **Services:** Define an interface first (e.g., `EmployeeService`) and implement it in `EmployeeServiceImpl`.
*   **Repositories:** Suffix with `Repository` extending `JpaRepository` (e.g., `EmployeeRepository`).
*   **DTOs:** Suffix with `RequestDTO` or `ResponseDTO` (e.g., `EmployeeCreateRequestDTO`).

---

## 3. DTO & Entity Mapping Strategy

Direct entity exposure via API controllers is strictly forbidden.
*   **Tool Choice:** **MapStruct 1.5+** (compile-time code generation). We avoid runtime mapping libraries (like ModelMapper) because they introduce runtime reflection overhead and performance bottlenecks.
*   **Implementation Rule:** Define mappers as interfaces annotated with `@Mapper(componentModel = "spring")`.

```java
@Mapper(componentModel = "spring")
public interface EmployeeMapper {
    EmployeeResponseDTO toResponseDTO(Employee employee);
    Employee toEntity(EmployeeCreateRequestDTO dto);
}
```

---

## 4. Validation & Exception Handling

### 4.1. Request Validation
We use **Jakarta Validation (Hibernate Validator)**. Controllers must annotate DTO input parameters with `@Valid`.

```java
public class EmployeeCreateRequestDTO {
    @NotBlank(message = "First name is mandatory")
    @Size(max = 100)
    private String firstName;

    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is mandatory")
    private String email;
}
```

### 4.2. Global Exception Handler
All backend exceptions must map to a standardized error payload via a `@RestControllerAdvice` controller.

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        List<ValidationErrorDetail> details = ex.getBindingResult().getFieldErrors().stream()
            .map(err -> new ValidationErrorDetail(err.getField(), err.getDefaultMessage()))
            .collect(Collectors.toList());

        ErrorResponse response = ErrorResponse.builder()
            .code("VALIDATION_FAILED")
            .message("Invalid request payload")
            .details(details)
            .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(TenantNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleTenantNotFound(TenantNotFoundException ex) {
        ErrorResponse response = ErrorResponse.builder()
            .code("TENANT_NOT_FOUND")
            .message(ex.getMessage())
            .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
}
```

---

## 5. Pagination, Sorting & Filtering Contracts

All list query endpoints must support Spring Data's `Pageable` injection.

*   **Controller signature:**
    ```java
    @GetMapping
    public ResponseEntity<PaginatedResponse<EmployeeResponseDTO>> getEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(defaultValue = "lastName,asc") String[] sort,
            EmployeeFilterCriteria criteria) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(parseSortOrders(sort)));
        return ResponseEntity.ok(employeeService.findAll(criteria, pageable));
    }
    ```
*   **Filtering Mechanism:** Standardized filtering uses **Spring Data JPA Specifications** (Criteria API) to generate query predicates dynamically based on search parameters.

---

## 6. Database Transaction Guidelines

*   **Declarative Transactions:** Use Spring's `@Transactional`.
*   **Transaction Boundaries:** Apply `@Transactional` to the Service implementation layer, not the controller or repository layers.
*   **Read-Only Operations:** Explicitly set `@Transactional(readOnly = true)` for query methods. This allows Hibernate to skip dirty-checking checks, optimizing transaction performance.
*   **Propagation Rule:** Defaults to `REQUIRED`. Long-running tasks (like file conversions or third-party email notifications) must be run outside transactional contexts.
