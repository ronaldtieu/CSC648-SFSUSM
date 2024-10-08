const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();  // Load environment variables from .env file

const sessionMiddleware = require('./config/session').sessionMiddleware;  // Import the session middleware
const userRoutes = require('./routes/userRoutes');  // Import the user routes

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000',  // Allow the frontend to connect
    credentials: true  // Enable cookies and other credentials to be sent from the frontend
}));

app.use(sessionMiddleware);  // Use the session middleware

// Use the user routes for all /users/* endpoints
app.use('/users', userRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});