package com.fintech.validation;

public final class RequestValidation {

    private static final String SYMBOL_PATTERN = "^[A-Za-z0-9._-]{1,32}$";

    private RequestValidation() {
    }

    public static String requiredText(Object value, String field, int maxLength) {
        if (value == null || value.toString().isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }

        String normalized = value.toString().trim();
        if (normalized.length() > maxLength) {
            throw new IllegalArgumentException(field + " is too long");
        }
        return normalized;
    }

    public static String symbol(Object value) {
        String normalized = requiredText(value, "symbol", 32);
        if (!normalized.matches(SYMBOL_PATTERN)) {
            throw new IllegalArgumentException("symbol contains unsupported characters");
        }
        return normalized.toUpperCase(java.util.Locale.ROOT);
    }
}
