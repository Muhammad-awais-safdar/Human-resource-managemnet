package com.awais.hr.common.domain;

import java.time.Instant;

public interface DomainEvent {
    Instant occurredOn();
}
