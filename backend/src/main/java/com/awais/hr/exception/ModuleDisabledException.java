package com.awais.hr.exception;

public class ModuleDisabledException extends RuntimeException {
    public ModuleDisabledException(String message) {
        super(message);
    }
}
