// jest.teardown.js
import mongoose from 'mongoose';

export default async function() {
  if (mongoose.connection.readyState) {
    await mongoose.connection.close();
  }
}
