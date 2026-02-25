/* eslint-disable import/first */
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.stack);
  process.exit(1);
});

import './config/env.js';
import mongoose from 'mongoose';
import app from './app.js';

const port = process.env.PORT || 3000;
let server;

try {
  const DB = process.env.DATABASE_LOCAL;
  await mongoose.connect(DB);
  console.log('Database connection successful!');

  server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
} catch (err) {
  console.error('Database connection error:', err.message);
  process.exit(1);
}

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.stack);

  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
