const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
const secretKey = 'secretKey';

let tasks = [];
let users = [];

//Register a new user
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ error: 'User already exists' });
  }

  users.push({ username, password });
  res.status(201).json({ message: 'User registered successfully' });
});

// Authenticate a user and return a token
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '1h' });
  res.json({ token });
});


// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403); 
    req.user = user;
    next();
  });
};


// Fetch all tasks and normalize the format
app.get('/tasks', authenticateToken, (req, res) => {
  const normalizedTasks = tasks.map(task => {
    if (typeof task.name === 'object' && task.name !== null) {
      return { name: task.name.name };
    }
    return { name: task.name };
  });

  res.json(normalizedTasks);
});

// Add a new task
app.post('/tasks', authenticateToken, (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Task name is required' });
  }

  const existingTask = tasks.find(task => task.name === name);
  if (existingTask) {
    return res.status(400).json({ error: 'Task already exists' });
  }

  const newTask = { id: tasks.length + 1, name };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
