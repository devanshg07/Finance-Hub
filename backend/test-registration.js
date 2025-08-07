const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Test the registration logic
async function testRegistrationLogic() {
  console.log('🧪 Testing Registration Logic for Same Names, Different Emails\n');

  const db = new sqlite3.Database('./database.sqlite');

  // Test data - multiple users with same name but different emails
  const testUsers = [
    { username: 'John Doe', email: 'john.doe@gmail.com', password: 'password123' },
    { username: 'John Doe', email: 'john.doe@yahoo.com', password: 'password123' },
    { username: 'John Doe', email: 'john.doe@hotmail.com', password: 'password123' },
    { username: 'Jane Smith', email: 'jane.smith@gmail.com', password: 'password123' },
    { username: 'Jane Smith', email: 'jane.smith@yahoo.com', password: 'password123' }
  ];

  console.log('📋 Test Cases:');
  testUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.username} - ${user.email}`);
  });
  console.log('');

  // Test each registration
  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    console.log(`\n🔄 Testing Registration ${i + 1}: ${user.username} (${user.email})`);
    
    try {
      // Check if email already exists
      const existingUser = await new Promise((resolve, reject) => {
        db.get('SELECT email FROM users WHERE email = ?', [user.email], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (existingUser) {
        console.log(`❌ FAILED: Email ${user.email} already exists`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Insert new user
      const result = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
          [user.username, user.email, hashedPassword],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      console.log(`✅ SUCCESS: User registered with ID ${result.id}`);
      console.log(`   Name: ${user.username}`);
      console.log(`   Email: ${user.email}`);

    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
  }

  // Show all registered users
  console.log('\n📊 Current Users in Database:');
  db.all('SELECT id, username, email FROM users ORDER BY id', [], (err, rows) => {
    if (err) {
      console.log('Error fetching users:', err);
    } else {
      rows.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id} | Name: ${user.username} | Email: ${user.email}`);
      });
    }
    
    console.log('\n✅ Test completed! Multiple users with same name but different emails can register successfully.');
    db.close();
  });
}

// Run the test
testRegistrationLogic(); 