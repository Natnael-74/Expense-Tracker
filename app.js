import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import expenseRouter from './routes/expenseRoutes.js';
import incomeRouter from './routes/incomeRoutes.js';
import userRouter from './routes/userRoutes.js';
import dashBoardRouter from './routes/dashBoardRoutes.js';
import globalErrorHandler from './controllers/errorController.js';
import AppError from './utils/appError.js';
import __dirname from './utils/directory.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

//Serving static files
app.use(express.static(path.join(__dirname, '../public')));

app.use(cookieParser());

app.use(morgan('dev'));

app.use('/api/v1/expenses', expenseRouter);
app.use('/api/v1/incomes', incomeRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/dashboard', dashBoardRouter);

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

export default app;
