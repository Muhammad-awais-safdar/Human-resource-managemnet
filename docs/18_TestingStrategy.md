# Quality Assurance & Testing Strategy: Awais HR

This document details the testing methodologies, tools, automation configurations, and performance testing strategies for **Awais HR**.

---

## 1. The Test Automation Pyramid

We follow a structured testing model to ensure high reliability, fast feedback loops, and low maintenance overhead.

```
       / \
      /   \      E2E (Playwright) - 5% of coverage
     / E2E \
    /-------\
   / Integr  \   Integration (Testcontainers) - 25% of coverage
  /------------\
 /    Unit      \ Unit Tests (JUnit 5 + Mockito) - 70% of coverage
/________________\
```

---

## 2. Unit Testing Standard

*   **Libraries:** JUnit 5, Mockito, AssertJ.
*   **Target Scope:** Test business logic in isolation without starting Spring application contexts.
*   **Mocking:** Use `@ExtendWith(MockitoExtension.class)` to mock repositories, external clients, and message queues.

```java
@ExtendWith(MockitoExtension.class)
class LeaveAccrualServiceTest {

    @Mock
    private LeaveBalanceRepository balanceRepository;

    @InjectMocks
    private LeaveAccrualServiceImpl accrualService;

    @Test
    void calculateAccrual_shouldCalculateDaysProRata() {
        // Arrange
        Employee employee = createMockEmployee();
        given(balanceRepository.findByEmployeeId(employee.getId()))
            .willReturn(Optional.of(new LeaveBalance(10.0)));

        // Act
        double calculatedDays = accrualService.calculateAccrualDays(employee, 12); // 12 months

        // Assert
        assertThat(calculatedDays).isEqualTo(18.0);
    }
}
```

---

## 3. Integration Testing with Testcontainers

We avoid memory-based databases (like H2) for integration tests because they behave differently from production databases (such as missing Postgres JSONB support or different indexing behaviors).
Instead, we use **Testcontainers** to spin up lightweight, ephemeral Docker instances of PostgreSQL 16 and Redis.

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
public class EmployeeControllerIntegrationTest {

    @Container
    private static final PostgreSQLContainer<?> postgreSQLContainer = 
        new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void setDatasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgreSQLContainer::getJdbcUrl);
        registry.add("spring.datasource.username", postgreSQLContainer::getUsername);
        registry.add("spring.datasource.password", postgreSQLContainer::getPassword);
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void createEmployee_shouldReturn201Created() {
        EmployeeCreateRequestDTO request = createValidEmployeeRequest();
        ResponseEntity<SuccessResponse> response = restTemplate.postForEntity(
            "/api/${api.version}/employees", request, SuccessResponse.class
        );
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }
}
```

---

## 4. End-to-End (E2E) UI Testing with Playwright

E2E tests validate cross-system integrations, UI state transitions, and browser compatibility.
*   **Framework:** **Playwright (JavaScript)**.
*   **Scope:** Validates onboarding flows, shift dragging, and leave submissions.

```javascript
import { test, expect } from '@playwright/test';

test('HR Admin should successfully create dynamic custom field', async ({ page }) => {
  await page.goto('https://acme.awais-hr.local/login');
  await page.fill('#email', 'admin@acme.com');
  await page.fill('#password', 'SecurePassword123!');
  await page.click('button[type="submit"]');

  await page.goto('https://acme.awais-hr.local/settings/custom-fields');
  await page.click('#add-field-btn');
  await page.fill('#field-label', 'Shirt Size');
  await page.selectOption('#field-type', 'ENUM');
  await page.fill('#enum-options', 'S,M,L,XL');
  await page.click('#save-field-btn');

  // Verify field is displayed in UI
  const fieldLabel = page.locator('text=Shirt Size');
  await expect(fieldLabel).toBeVisible();
});
```

---

## 5. Performance & Load Verification (K6 Profiles)

Load tests run in the pre-production environment to verify application performance under stress.
*   **Tool:** **k6 (JavaScript)**.
*   **Metrics targets:**
    *   **Peak Load:** 2,000 concurrent request sessions/second.
    *   **P95 Response Latency:** Under 200ms.
    *   **Max Error Rate:** Under 0.01%.

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp-up
    { duration: '5m', target: 1000 }, // Steady high-load
    { duration: '1m', target: 0 },    // Cool-down
  ],
};

export default function () {
  const params = {
    headers: { 'Authorization': 'Bearer test-jwt-token-key' },
  };
  const res = http.get('https://acme.awais-hr.local/api/${api.version}/employees', params);
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
```
 Josephson.
