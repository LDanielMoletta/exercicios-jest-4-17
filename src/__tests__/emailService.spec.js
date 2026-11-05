const { createEmailSender } = require('../emailService');

describe('sendEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call apiSend with the user email and subject', () => {
    // Arrange
    const apiSend = jest.fn().mockReturnValue(true);
    const sendEmail = createEmailSender(apiSend);
    const user = { name: 'Maria', email: 'maria@example.com' };

    // Act
    const result = sendEmail(user);

    // Assert
    expect(apiSend).toHaveBeenCalled();
    expect(apiSend).toHaveBeenCalledWith('maria@example.com', 'Bem-vindo!');
    expect(apiSend).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('should call apiSend exactly once per user', () => {
    // Arrange
    const apiSend = jest.fn().mockReturnValue(true);
    const sendEmail = createEmailSender(apiSend);

    // Act
    sendEmail({ name: 'Maria', email: 'maria@example.com' });

    // Assert
    expect(apiSend).toHaveBeenCalledTimes(1);
  });

  it('should send each user email to the corresponding address', () => {
    // Arrange
    const apiSend = jest.fn().mockReturnValue(true);
    const sendEmail = createEmailSender(apiSend);

    // Act
    sendEmail({ name: 'Maria', email: 'maria@example.com' });
    sendEmail({ name: 'John', email: 'john@example.com' });

    // Assert
    expect(apiSend).toHaveBeenNthCalledWith(1, 'maria@example.com', 'Bem-vindo!');
    expect(apiSend).toHaveBeenNthCalledWith(2, 'john@example.com', 'Bem-vindo!');
  });

  it('should propagate the error when the email API fails', async () => {
    // Arrange
    const apiSend = jest.fn().mockRejectedValue(new Error('send failed'));
    const sendEmail = createEmailSender(apiSend);
    const user = { name: 'Maria', email: 'maria@example.com' };

    // Act & Assert
    await expect(sendEmail(user)).rejects.toThrow('send failed');
    expect(apiSend).toHaveBeenCalledWith('maria@example.com', 'Bem-vindo!');
  });
});
