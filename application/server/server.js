const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Import cookie-parser

require('dotenv').config();  // Load environment variables from .env file

const userRoutes = require('./routes/userRoutes');  // Import the user routes
const postRoutes = require('./routes/postRoutes');  // Import the post routes

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000',  // Allow the frontend to connect
    credentials: true  // Enable cookies and other credentials to be sent from the frontend
}));

app.use(cookieParser()); // Use cookie-parser middleware

// Use the user routes for all /users/* endpoints
app.use('/users', userRoutes);

// Use the post routes for all /posts/* endpoints
app.use('/posts', postRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});