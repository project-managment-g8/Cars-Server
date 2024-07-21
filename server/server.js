import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'; // Import cors
import userRoutes from './routes/userRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(bodyParser.json());
app.use(cors()); // Use cors

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Vehicle Social Platform API!');
});

// Ping endpoint
app.get('/ping', (req, res) => {
  res.send('pong <G8>');
});

// About endpoint
app.get('/about', (req, res) => {
  res.send('A platform that connects vehicle enthusiasts and people interested in the automotive world. Users can share photos of vehicles, discuss repairs and upgrades, receive maintenance tips, and organize meetings and events in the automotive field. Any user will be able to post reviews on spare parts, recommend garages, and share travel experiences.');
});

app.use('/api/users', userRoutes);

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Export the app for testing
export { app };
