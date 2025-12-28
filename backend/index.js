import webRouter from './router/web.js';
import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import connection from './database/connection.js';
import UserTableSeeder from './database/seeder/UserTableSeeder.js';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/api', webRouter);

const startServer = async () => {
  await connection(); 
  await UserTableSeeder.run(); 

  const port = process.env.PORT || 5000;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

startServer();
