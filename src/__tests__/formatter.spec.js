const { formatName } = require('../formatter');

describe('formatName', () => {
  it('should capitalize a lowercase name', () => {
    // Act
    const result = formatName('maria');

    // Assert
    expect(result).toBe('Maria');
  });

  it('should trim surrounding spaces and capitalize the name', () => {
    // Act
    const result = formatName(' joão ');

    // Assert
    expect(result).toBe('João');
  });

  it('should lowercase the remaining letters of an uppercase name', () => {
    // Act
    const result = formatName('ANA');

    // Assert
    expect(result).toBe('Ana');
  });

  it('should return an empty string when the name is empty', () => {
    // Act
    const result = formatName('');

    // Assert
    expect(result).toBe('');
  });
});
