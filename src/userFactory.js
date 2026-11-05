let nextId = 1;

function createUser(name, age) {
  return {
    id: nextId++,
    name,
    age,
  };
}

module.exports = { createUser };
