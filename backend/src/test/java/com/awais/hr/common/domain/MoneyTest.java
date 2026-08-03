package com.awais.hr.common.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Currency;

import static org.junit.jupiter.api.Assertions.*;

class MoneyTest {

    @Test
    @DisplayName("Should create Money object and scale to 2 decimal places")
    void createMoneySuccess() {
        Money money = Money.of(100.5, "USD");
        assertEquals(new BigDecimal("100.50"), money.amount());
        assertEquals(Currency.getInstance("USD"), money.currency());
    }

    @Test
    @DisplayName("Should add money with same currency")
    void addMoneySuccess() {
        Money m1 = Money.of(100.00, "USD");
        Money m2 = Money.of(50.25, "USD");
        Money result = m1.add(m2);

        assertEquals(new BigDecimal("150.25"), result.amount());
    }

    @Test
    @DisplayName("Should throw exception when adding different currencies")
    void addMoneyDifferentCurrencyThrows() {
        Money m1 = Money.of(100.00, "USD");
        Money m2 = Money.of(50.25, "EUR");

        assertThrows(IllegalArgumentException.class, () -> m1.add(m2));
    }
}
