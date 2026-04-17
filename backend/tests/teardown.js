// Purpose: Jest global teardown — stop in-memory MongoDB after integration tests
'use strict';

module.exports = async () => {
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
  }
};
