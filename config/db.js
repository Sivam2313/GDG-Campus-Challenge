import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Get the MongoDB URI from the environment variables
const mongoURI = process.env.MONGO_URI;

//Check if mongoURI exists
if (!mongoURI) {
  console.error("MONGO_URI is not defined in the environment variables.");
  process.exit(1);
}

mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

export const db = mongoose.connection;

