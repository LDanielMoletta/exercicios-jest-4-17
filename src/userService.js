function createUserService(repository) {
  return {
    getUser(id) {
      return repository.findById(id);
    },

    async getUserAsync(id) {
      return repository.findById(id);
    },
  };
}

module.exports = { createUserService };
