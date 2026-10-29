const { createUserService } = require('../userService');

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the user provided by the repository', () => {
    // Arrange
    const userMock = { id: 1, name: 'Maria', email: 'maria@example.com' };
    const repository = { findById: jest.fn().mockReturnValue(userMock) };
    const service = createUserService(repository);

    // Act
    const result = service.getUser(1);

    // Assert
    expect(result).toEqual(userMock);
  });

  it('should call the repository with the correct id', () => {
    // Arrange
    const repository = { findById: jest.fn().mockReturnValue(null) };
    const service = createUserService(repository);

    // Act
    service.getUser(42);

    // Assert
    expect(repository.findById).toHaveBeenCalledWith(42);
  });

  it('should call the repository exactly once', () => {
    // Arrange
    const repository = { findById: jest.fn().mockReturnValue(null) };
    const service = createUserService(repository);

    // Act
    service.getUser(1);

    // Assert
    expect(repository.findById).toHaveBeenCalledTimes(1);
  });

  it('should return null when the user does not exist', () => {
    // Arrange
    const repository = { findById: jest.fn().mockReturnValue(null) };
    const service = createUserService(repository);

    // Act
    const result = service.getUser(99);

    // Assert
    expect(result).toBeNull();
    expect(repository.findById).toHaveBeenCalled();
  });

  it('should resolve the user when using the asynchronous version', async () => {
    // Arrange
    const userMock = { id: 1, name: 'Maria', email: 'maria@example.com' };
    const repository = { findById: jest.fn().mockResolvedValue(userMock) };
    const service = createUserService(repository);

    // Act
    const result = await service.getUserAsync(1);

    // Assert
    expect(result).toEqual(userMock);
    expect(repository.findById).toHaveBeenCalledWith(1);
  });
});
