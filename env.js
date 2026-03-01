import dotenv from 'dotenv';
import path from 'path';
import __dirname from '../utils/directory.js';

dotenv.config({ path: path.join(__dirname, '../config.env') });
