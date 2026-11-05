const { increment, getValue, reset } = require('../counter');

describe('counter with beforeEach', () => {
  beforeEach(() => {
    reset();
  });

  afterEach(() => {
    console.log('value at the end of the test:', getValue());
  });

  it('should return 1 after one increment', () => {
    // Act & Assert
    expect(increment()).toBe(1);
  });

  it('should return 3 after three increments', () => {
    // Act
    increment();
    increment();

    // Assert
    expect(increment()).toBe(3);
  });

  it('should return 0 after reset', () => {
    // Act
    increment();
    reset();

    // Assert
    expect(getValue()).toBe(0);
  });
});
