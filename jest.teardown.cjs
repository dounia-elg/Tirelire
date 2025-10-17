const mongoose = require('mongoose');

module.exports = async () => {
  if (mongoose.connection && mongoose.connection.readyState) {
    try {
      await mongoose.connection.close();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error closing mongoose connection in teardown:', err);
    }
  }
};
