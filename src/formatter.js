function formatName(name) {
  const trimmed = String(name).trim();

  if (!trimmed) {
    return '';
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

module.exports = { formatName };
