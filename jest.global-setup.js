// Pin the test timezone so date-dependent assertions are deterministic (Polish users).
module.exports = async () => {
  process.env.TZ = 'Europe/Warsaw';
};
