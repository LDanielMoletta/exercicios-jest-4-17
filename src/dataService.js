async function fetchData() {
  return { ok: true };
}

async function fetchDataWithError() {
  throw new Error('failed to fetch data');
}

module.exports = { fetchData, fetchDataWithError };
