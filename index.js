import express from 'express';
import { db } from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();


app.get('/', (req, res) => {
  res.send(`You have reached at GDG Campus Solution Backend 😊`);
});

const port = parseInt(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
}); 