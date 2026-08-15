package com.awais.hr.common.domain;

import com.awais.hr.engine.commission.CommissionEngine;
import com.awais.hr.engine.piecerate.PieceRateEngine;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.junit.jupiter.api.Assertions.*;

class FinancialPrecisionTest {

    private final CommissionEngine commissionEngine = new CommissionEngine(null);
    private final PieceRateEngine pieceRateEngine = new PieceRateEngine(null);

    @Test
    @DisplayName("Zero sale amount returns zero commission")
    void testZeroSalesCommission() {
        BigDecimal commission = commissionEngine.calculateCommission(
                BigDecimal.ZERO, new BigDecimal("5.00"), BigDecimal.ONE
        );
        assertEquals(0, BigDecimal.ZERO.compareTo(commission));
    }

    @Test
    @DisplayName("Small decimal 0.01 calculation with precision retention")
    void testSmallDecimalPrecision() {
        BigDecimal commission = commissionEngine.calculateCommission(
                new BigDecimal("0.01"), new BigDecimal("10.00"), BigDecimal.ONE
        );
        assertEquals(new BigDecimal("0.00"), commission); // 0.001 rounded to 0.00
    }

    @Test
    @DisplayName("Standard decimal 0.10 sales calculation")
    void testStandardDecimalPrecision() {
        BigDecimal commission = commissionEngine.calculateCommission(
                new BigDecimal("100.00"), new BigDecimal("0.10"), BigDecimal.ONE
        );
        assertEquals(new BigDecimal("0.10"), commission);
    }

    @Test
    @DisplayName("Large monetary value 999999.99 calculation")
    void testLargeMonetaryValue() {
        BigDecimal commission = commissionEngine.calculateCommission(
                new BigDecimal("999999.99"), new BigDecimal("5.00"), BigDecimal.ONE
        );
        assertEquals(new BigDecimal("50000.00"), commission); // 49999.9995 -> HALF_UP -> 50000.00
    }

    @Test
    @DisplayName("Piece rate pay with quality multiplier")
    void testPieceRateQualityMultiplier() {
        BigDecimal pay = pieceRateEngine.calculatePiecePay(
                100, new BigDecimal("2.50"), new BigDecimal("1.10")
        );
        assertEquals(new BigDecimal("275.00"), pay);
    }

    @Test
    @DisplayName("Piece rate division and zero handling")
    void testPieceRateZeroQuantity() {
        BigDecimal pay = pieceRateEngine.calculatePiecePay(
                0, new BigDecimal("2.50"), BigDecimal.ONE
        );
        assertEquals(BigDecimal.ZERO, pay);
    }

    @Test
    @DisplayName("Division precision with RoundingMode.HALF_UP")
    void testDivisionRounding() {
        BigDecimal totalProfit = new BigDecimal("1000.00");
        BigDecimal points = new BigDecimal("3.00");
        BigDecimal totalPoints = new BigDecimal("7.00");

        BigDecimal dividend = totalProfit.multiply(points).divide(totalPoints, 2, RoundingMode.HALF_UP);
        assertEquals(new BigDecimal("428.57"), dividend);
    }

    @Test
    @DisplayName("Division by zero prevention check")
    void testDivisionByZeroHandled() {
        BigDecimal totalProfit = new BigDecimal("1000.00");
        BigDecimal totalPoints = BigDecimal.ZERO;

        assertThrows(ArithmeticException.class, () -> {
            totalProfit.divide(totalPoints, 2, RoundingMode.HALF_UP);
        });
    }
}
