package com.awais.hr.module.verticals;

import com.awais.hr.module.verticals.controller.BFSIServicesController;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class Iso20022XmlTest {

    private final BFSIServicesController controller = new BFSIServicesController(null);

    @Test
    @DisplayName("ISO 20022 XML export produces dynamic CreDtTm timestamp and valid structure")
    void testIso20022XmlStructure() {
        ResponseEntity<?> response = controller.generateIso20022Xml(Map.of("batchId", "BATCH-TEST-001"));
        assertEquals(200, response.getStatusCode().value());

        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertNotNull(body);
        assertTrue((Boolean) body.get("success"));

        String xml = (String) body.get("xmlContent");
        assertNotNull(xml);

        // Verify XML contains Pain.001.001.03 header
        assertTrue(xml.contains("<Document xmlns=\"urn:iso:std:iso:20022:tech:xsd:pain.001.001.03\">"));
        assertTrue(xml.contains("<GrpHdr>"));

        // Verify CreDtTm is ISO-8601 instant string, not hardcoded 2026-08-15
        assertTrue(xml.contains("<CreDtTm>"));
        assertFalse(xml.contains("<CreDtTm>2026-08-15T20:00:00Z</CreDtTm>"));

        // Confirm timestamp parses as valid Instant
        int startIdx = xml.indexOf("<CreDtTm>") + "<CreDtTm>".length();
        int endIdx = xml.indexOf("</CreDtTm>");
        String timestampStr = xml.substring(startIdx, endIdx);

        assertDoesNotThrow(() -> Instant.parse(timestampStr));
    }
}
