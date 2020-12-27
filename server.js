const express = require('express');

const connectDB = require('./config/db');

// const router = require('./routes/api/users');

const app = express();

connectDB();

app.get('/', (req, res) => res.send('API running'));

//Init middleware for post request body content display in json - instead of "bodyParser.json => express.json"
app.use(express.json({ extented: false }));

app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/post', require('./routes/api/post'));

const PORT = process.env.port || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
