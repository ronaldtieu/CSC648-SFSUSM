const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Import cookie-parser

require('dotenv').config();  // Load environment variables from .env file

// importing routes:
const userRoutes = require('./routes/userRoutes'); 
const postRoutes = require('./routes/postRoutes');  
const friendRoutes = require('./routes/friendRoute');
const messageRoute = require('./routes/messageRoute');
const groupsRoute = require('./routes/groupsRoute');
const feedRoute = require('./routes/feedRoute');
const searchRoute = require('./routes/searchRoute');

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000',  // Allow the frontend to connect
    credentials: true  // Enable cookies and other credentials to be sent from the frontend
}));

app.use(cookieParser()); // Use cookie-parser middleware


const http = require('http');
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

io.on('connection', (socket) => { 
    console.log('New client connected:', socket.id); 
    socket.on('sendMessage', (message) => { 
      io.emit('receiveMessage', message); 
    }); 
    socket.on('disconnect', () => { 
      console.log('Client disconnected:', socket.id); 
    }); 
  }); 



// routes:
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/friends', friendRoutes);
app.use('/messages', messageRoute);
app.use('/groups', groupsRoute);
app.use('/feed', feedRoute);
app.use('/search', searchRoute);



server.listen(port, () => { 
    console.log(`Server is running on http://localhost:${port}`); 
});