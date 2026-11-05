let value = 0;

const increment = () => {
  value += 1;
  return value;
};

const getValue = () => value;

const reset = () => {
  value = 0;
};

module.exports = { increment, getValue, reset };
