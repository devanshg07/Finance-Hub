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
  const origin = req.headers.origin;
  
  console.log('CORS: Request from origin:', origin);
  console.log('CORS: Request method:', req.method);
  console.log('CORS: Request headers:', req.headers);
  
  // Allow localhost for local development
  if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log('CORS: Allowing origin:', origin);
  }
  // Allow Vercel domains
  else if (origin && origin.includes('vercel.app')) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log('CORS: Allowing Vercel origin:', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    console.log('CORS: Handling preflight request');
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
      username TEXT NOT NULL,
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

  db.run(`
    CREATE TABLE IF NOT EXISTS user_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating user_categories table:', err);
    } else {
      console.log('User categories table ready');
    }
  });
}

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Authentication Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('Registration attempt:', { username, email });

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Only check if email already exists (allow duplicate usernames)
    db.get('SELECT email FROM users WHERE email = ?', [email], (err, existingUser) => {
      if (err) {
        console.error('Database error during registration check:', err);
        return res.status(500).json({ error: 'Registration failed' });
      }

      if (existingUser) {
        console.log('Registration failed - email already exists:', existingUser.email);
        return res.status(400).json({ error: 'Email already exists' });
      }

      console.log('No existing user with this email, proceeding with registration');

      // If no existing user with this email, proceed with registration
      db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword],
        function(err) {
          if (err) {
            console.error('Database error during user insertion:', err);
            return res.status(500).json({ error: 'Registration failed' });
          }

          const userId = this.lastID;
          console.log('User registered successfully with ID:', userId);
          
          // Create default categories for the new user
          createDefaultCategories(userId);

          res.status(201).json({
            message: 'User registered successfully',
            user: { id: userId, username, email }
          });
        }
      );
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Function to create default categories for a new user
function createDefaultCategories(userId) {
  const defaultCategories = [
    // Income categories
    { name: 'Salary', color: '#22c55e', type: 'income' },
    { name: 'Freelance', color: '#3b82f6', type: 'income' },
    { name: 'Investments', color: '#8b5cf6', type: 'income' },
    { name: 'Business Income', color: '#06b6d4', type: 'income' },
    
    // Expense categories
    { name: 'Food & Dining', color: '#ef4444', type: 'expense' },
    { name: 'Transportation', color: '#f97316', type: 'expense' },
    { name: 'Shopping', color: '#ec4899', type: 'expense' },
    { name: 'Bills & Utilities', color: '#eab308', type: 'expense' },
    { name: 'Rent / Mortgage', color: '#dc2626', type: 'expense' },
    { name: 'Healthcare', color: '#7c3aed', type: 'expense' },
    { name: 'Entertainment', color: '#059669', type: 'expense' },
    { name: 'Savings', color: '#0891b2', type: 'expense' }
  ];

  const stmt = db.prepare('INSERT INTO user_categories (user_id, name, color, type) VALUES (?, ?, ?, ?)');
  
  defaultCategories.forEach(category => {
    stmt.run([userId, category.name, category.color, category.type], (err) => {
      if (err) {
        console.error('Error creating default category:', err);
      }
    });
  });

  stmt.finalize((err) => {
    if (err) {
      console.error('Error finalizing default categories:', err);
    } else {
      console.log('Created default categories for user:', userId);
    }
  });
}

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
  
  // Allow empty description, use empty string if not provided
  const finalDescription = description || '';

  db.run(
    'INSERT INTO tasks (category, description, amount, date, user) VALUES (?, ?, ?, ?, ?)',
    [category, finalDescription, amount, date, user],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create task' });
      }
      
      const task = { 
        id: this.lastID, 
        category, 
        description: finalDescription, 
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

// Save user categories
app.post('/api/user-categories', (req, res) => {
  const { userId, categories } = req.body;
  
  console.log('Received save categories request:', { userId, categoriesCount: categories?.length });
  
  if (!userId || !categories || !Array.isArray(categories)) {
    console.log('Invalid request data:', { userId, categories });
    return res.status(400).json({ error: 'Invalid request data' });
  }

  // First, delete existing categories for this user
  db.run('DELETE FROM user_categories WHERE user_id = ?', [userId], (err) => {
    if (err) {
      console.error('Error clearing existing categories:', err);
      return res.status(500).json({ error: 'Failed to clear existing categories' });
    }

    console.log('Cleared existing categories for user:', userId);

    // Then insert new categories
    const stmt = db.prepare('INSERT INTO user_categories (user_id, name, color, type) VALUES (?, ?, ?, ?)');
    let insertErrors = [];
    
    categories.forEach((category, index) => {
      stmt.run([userId, category.name, category.color, category.type], (err) => {
        if (err) {
          console.error('Error inserting category:', err, category);
          insertErrors.push({ category, error: err.message });
        }
      });
    });

    stmt.finalize((err) => {
      if (err) {
        console.error('Error finalizing statement:', err);
        return res.status(500).json({ error: 'Failed to save categories' });
      }
      
      if (insertErrors.length > 0) {
        console.error('Some categories failed to insert:', insertErrors);
        return res.status(500).json({ 
          error: 'Some categories failed to save',
          details: insertErrors 
        });
      }
      
      console.log('Successfully saved categories for user:', userId);
      res.json({ message: 'Categories saved successfully' });
    });
  });
});

// Get user categories
app.get('/api/user-categories/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all('SELECT * FROM user_categories WHERE user_id = ? ORDER BY type, name', [userId], (err, categories) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
    
    const incomeCategories = categories.filter(cat => cat.type === 'income');
    const expenseCategories = categories.filter(cat => cat.type === 'expense');
    
    res.json({
      incomeCategories,
      expenseCategories
    });
  });
});

// Debug endpoint to list all users (remove in production)
app.get('/api/debug/users', (req, res) => {
  db.all('SELECT id, username, email, created_at FROM users', [], (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json({ users });
  });
});

// Create default categories for existing user
app.post('/api/user-categories/:userId/default', (req, res) => {
  const { userId } = req.params;
  
  // Check if user already has categories
  db.get('SELECT COUNT(*) as count FROM user_categories WHERE user_id = ?', [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to check existing categories' });
    }
    
    if (result.count > 0) {
      return res.status(400).json({ error: 'User already has categories' });
    }
    
    // Create default categories
    createDefaultCategories(userId);
    res.json({ message: 'Default categories created successfully' });
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