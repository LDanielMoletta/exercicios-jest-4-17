const { getWelcomeMessage } = require('../message');

describe('getWelcomeMessage', () => {
  it('should generate the welcome message', () => {
    // Act
    const message = getWelcomeMessage('Maria');

    // Assert
    expect(message).toMatchSnapshot();
  });
});
