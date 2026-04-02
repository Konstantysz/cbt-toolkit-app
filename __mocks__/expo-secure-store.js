const store = {};

module.exports = {
  setItemAsync: jest.fn(async (key, value) => {
    store[key] = value;
  }),
  getItemAsync: jest.fn(async (key) => store[key] ?? null),
  deleteItemAsync: jest.fn(async (key) => {
    delete store[key];
  }),
  __store: store,
  __reset: () => {
    Object.keys(store).forEach((k) => delete store[k]);
  },
};
