const { calculateTotal } = require('./cart_calculator');

describe('calculateTotal', () => {
    test('should_return_zero_when_items_are_not_an_array', () => {
        // Arrange
        const items = null;

        // Act
        const result = calculateTotal(items);

        // Assert
        expect(result).toBe(0);
    });

    test('should_return_zero_when_cart_is_empty', () => {
        // Arrange
        const items = [];

        // Act
        const result = calculateTotal(items);

        // Assert
        expect(result).toBe(0);
    });

    test('should_calculate_total_with_default_tax_rate_when_tax_rate_is_omitted', () => {
        // Arrange
        const items = [{ price: 10, quantity: 2 }];

        // Act
        const result = calculateTotal(items);

        // Assert
        expect(result).toBe(24);
    });

    test('should_use_default_quantity_when_quantity_is_omitted', () => {
        // Arrange
        const items = [{ price: 10 }];

        // Act
        const result = calculateTotal(items, 0);

        // Assert
        expect(result).toBe(10);
    });

    test('should_use_default_quantity_when_quantity_is_zero', () => {
        // Arrange
        const items = [{ price: 10, quantity: 0 }];

        // Act
        const result = calculateTotal(items, 0);

        // Assert
        expect(result).toBe(10);
    });

    test('should_use_default_price_when_price_is_omitted', () => {
        // Arrange
        const items = [{ quantity: 3 }];

        // Act
        const result = calculateTotal(items, 0);

        // Assert
        expect(result).toBe(0);
    });

    test('should_calculate_total_for_multiple_items', () => {
        // Arrange
        const items = [
            { price: 12.5, quantity: 2 },
            { price: 7.5, quantity: 3 },
        ];

        // Act
        const result = calculateTotal(items, 0);

        // Assert
        expect(result).toBe(47.5);
    });

    test('should_apply_custom_tax_rate_when_tax_rate_is_provided', () => {
        // Arrange
        const items = [{ price: 100, quantity: 1 }];

        // Act
        const result = calculateTotal(items, 0.1);

        // Assert
        expect(result).toBe(110);
    });

    test('should_apply_default_discount_when_discount_is_omitted', () => {
        // Arrange
        const items = [{ price: 100, quantity: 1 }];

        // Act
        const result = calculateTotal(items, 0.2);

        // Assert
        expect(result).toBe(120);
    });

    test('should_apply_fixed_discount_before_tax', () => {
        // Arrange
        const items = [{ price: 100, quantity: 1 }];

        // Act
        const result = calculateTotal(items, 0.2, 25);

        // Assert
        expect(result).toBe(90);
    });

    test('should_return_zero_when_discount_exceeds_subtotal', () => {
        // Arrange
        const items = [{ price: 50, quantity: 1 }];

        // Act
        const result = calculateTotal(items, 0.2, 75);

        // Assert
        expect(result).toBe(0);
    });

    test('should_clamp_negative_prices_to_zero', () => {
        // Arrange
        const items = [{ price: -10, quantity: 2 }];

        // Act
        const result = calculateTotal(items, 0);

        // Assert
        expect(result).toBe(0);
    });

    test('should_clamp_negative_quantities_to_zero', () => {
        // Arrange
        const items = [{ price: 10, quantity: -2 }];

        // Act
        const result = calculateTotal(items, 0);

        // Assert
        expect(result).toBe(0);
    });

    test('should_round_total_to_two_decimal_places', () => {
        // Arrange
        const items = [{ price: 10, quantity: 1 }];

        // Act
        const result = calculateTotal(items, 0.333);

        // Assert
        expect(result).toBe(13.33);
    });

    test('should_preserve_items_when_calculating_total', () => {
        // Arrange
        const items = [{ price: 10, quantity: 2 }];
        const itemsBeforeCalculation = JSON.parse(JSON.stringify(items));

        // Act
        calculateTotal(items);

        // Assert
        expect(items).toEqual(itemsBeforeCalculation);
    });
});
