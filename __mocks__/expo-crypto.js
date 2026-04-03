module.exports = {
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn(async (_algorithm, input) => `hashed:${input}`),
  getRandomValues: jest.fn((array) => {
    for (let i = 0; i < array.length; i++) array[i] = i % 256;
    return array;
  }),
};
