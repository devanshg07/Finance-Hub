const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const { expenseDescriptions, incomeDescriptions } = require('./categories');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// Enable CORS for frontend
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

function initDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('Users table ready');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      user TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating tasks table:', err);
    } else {
      console.log('Tasks table ready');
    }
  });
}

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Authentication Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }

        res.status(201).json({
          message: 'User registered successfully',
          user: { id: this.lastID, username, email }
        });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Login failed' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      res.json({
        message: 'Login successful',
        user: { id: user.id, username: user.username, email: user.email }
      });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });
});

// Endpoint to get allowed categories/descriptions
app.get('/api/categories', (req, res) => {
  res.json({
    expenseDescriptions,
    incomeDescriptions
  });
});

// Create a new task
app.post('/api/tasks', (req, res) => {
  const { category, description, amount, date, user } = req.body;
  
  if (!description || description.trim() === '') {
    return res.status(400).json({ error: 'Description is required' });
  }

  db.run(
    'INSERT INTO tasks (category, description, amount, date, user) VALUES (?, ?, ?, ?, ?)',
    [category, description, amount, date, user],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create task' });
      }
      
      const task = { 
        id: this.lastID, 
        category, 
        description, 
        amount, 
        date, 
        user 
      };
      res.status(201).json(task);
    }
  );
});

// Import tasks from CSV
app.post('/api/tasks/import', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      // Validate description
      if (
        (data.category === 'expense' && !expenseDescriptions.includes(data.description)) ||
        (data.category === 'income' && !incomeDescriptions.includes(data.description))
      ) {
        // skip invalid
        return;
      }
      results.push({
        category: data.category,
        description: data.description,
        amount: Number(data.amount),
        date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        user: data.user
      });
    })
    .on('end', () => {
      // Insert all results into database
      const stmt = db.prepare('INSERT INTO tasks (category, description, amount, date, user) VALUES (?, ?, ?, ?, ?)');
      results.forEach(task => {
        stmt.run([task.category, task.description, task.amount, task.date, task.user]);
      });
      stmt.finalize();
      
      fs.unlinkSync(req.file.path); // Clean up uploaded file
      res.json({ message: 'Tasks imported', count: results.length });
    })
    .on('error', (err) => {
      res.status(500).json({ error: err.message });
    });
});

// Get all tasks
app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY date DESC', [], (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
    res.json(tasks);
  });
});

// Export tasks as CSV
app.get('/api/tasks/export', (req, res) => {
  try {
    db.all('SELECT * FROM tasks ORDER BY date DESC', [], (err, tasks) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch tasks' });
      }

      const csvStringifier = createCsvWriter({
        header: [
          { id: 'category', title: 'category' },
          { id: 'description', title: 'description' },
          { id: 'amount', title: 'amount' },
          { id: 'date', title: 'date' },
          { id: 'user', title: 'user' }
        ]
      });
      
      const records = tasks.map(task => ({
        category: task.category,
        description: task.description,
        amount: task.amount,
        date: task.date,
        user: task.user
      }));
      
      const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="tasks.csv"');
      res.send(csv);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single task by ID
app.get('/api/tasks/:id', (req, res) => {
  db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id], (err, task) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch task' });
    }
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  });
});

// Update a task by ID
app.put('/api/tasks/:id', (req, res) => {
  const { category, description, amount, date, user } = req.body;
  
  // Validate description
  if (category === 'expense' && !expenseDescriptions.includes(description)) {
    return res.status(400).json({ error: 'Invalid expense description' });
  }
  if (category === 'income' && !incomeDescriptions.includes(description)) {
    return res.status(400).json({ error: 'Invalid income description' });
  }

  db.run(
    'UPDATE tasks SET category = ?, description = ?, amount = ?, date = ?, user = ? WHERE id = ?',
    [category, description, amount, date, user, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update task' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ message: 'Task updated successfully' });
    }
  );
});

// Delete a task by ID
app.delete('/api/tasks/:id', (req, res) => {
  db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete task' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send('Finance Tracker API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 