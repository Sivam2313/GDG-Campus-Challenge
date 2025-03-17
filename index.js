import express from 'express';
import { db } from './config/db.js';
import { patientRoutes } from './routes/patientRoutes.js';
import { doctorRoutes } from './routes/doctorRoutes.js';
import { ngoRoutes } from './routes/ngoRoutes.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();


app.use(express.json());

app.get('/', (req, res) => {
  res.send(`You have reached at GDG Campus Solution Backend 😊`);
});

app.use('/patient', patientRoutes);
app.use('/doctor', doctorRoutes);
app.use('/ngo', ngoRoutes);

const port = parseInt(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
}); 