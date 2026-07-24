package com.awais.hr.module.billing;

import com.awais.hr.module.billing.service.SubscriptionService;
import com.awais.hr.module.billing.service.SubscriptionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class SubscriptionBillingTest {

    @Mock
    private DataSource dataSource;

    private SubscriptionService subscriptionService;

    @BeforeEach
    public void setUp() {
        subscriptionService = new SubscriptionServiceImpl(dataSource);
    }

    @Test
    public void updatePlan_shouldThrowException_whenPlanNameIsBlank() {
        Map<String, Object> body = Map.of("planName", " ");
        assertThrows(IllegalArgumentException.class, () -> subscriptionService.updatePlan(body));
    }
}
