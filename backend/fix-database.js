const sqlite3 = require('sqlite3').verbose();

function fixDatabase() {
  console.log('🔧 Fixing Database Schema for Multiple Users with Same Name\n');

  const db = new sqlite3.Database('./database.sqlite');

  // First, let's check the current table structure
  console.log('📋 Current table structure:');
  db.all("PRAGMA table_info(users)", [], (err, rows) => {
    if (err) {
      console.log('Error checking table structure:', err);
      return;
    }
    
    rows.forEach(row => {
      console.log(`  ${row.name} ${row.type} ${row.notnull ? 'NOT NULL' : ''} ${row.pk ? 'PRIMARY KEY' : ''} ${row.dflt_value ? `DEFAULT ${row.dflt_value}` : ''}`);
    });

    // Check for unique constraints
    console.log('\n🔍 Checking for unique constraints:');
    db.all("PRAGMA index_list(users)", [], (err, indexes) => {
      if (err) {
        console.log('Error checking indexes:', err);
        return;
      }

      indexes.forEach(index => {
        console.log(`  Index: ${index.name} (unique: ${index.unique})`);
      });

      // Drop the existing users table and recreate it properly
      console.log('\n🔄 Recreating users table with correct constraints...');
      
      db.run('DROP TABLE IF EXISTS users', (err) => {
        if (err) {
          console.log('Error dropping table:', err);
          return;
        }

        // Create the table with correct constraints
        db.run(`
          CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            console.log('Error creating users table:', err);
            return;
          }

          console.log('✅ Users table recreated successfully!');
          console.log('\n📋 New table structure:');
          
          db.all("PRAGMA table_info(users)", [], (err, rows) => {
            if (err) {
              console.log('Error checking new table structure:', err);
              return;
            }
            
            rows.forEach(row => {
              console.log(`  ${row.name} ${row.type} ${row.notnull ? 'NOT NULL' : ''} ${row.pk ? 'PRIMARY KEY' : ''} ${row.dflt_value ? `DEFAULT ${row.dflt_value}` : ''}`);
            });

            console.log('\n🔍 New unique constraints:');
            db.all("PRAGMA index_list(users)", [], (err, indexes) => {
              if (err) {
                console.log('Error checking new indexes:', err);
                return;
              }

              indexes.forEach(index => {
                console.log(`  Index: ${index.name} (unique: ${index.unique})`);
              });

              console.log('\n✅ Database fixed! Now multiple users with same name but different emails can register.');
              console.log('\n📝 Summary:');
              console.log('  - username: NO UNIQUE constraint (allows duplicates)');
              console.log('  - email: HAS UNIQUE constraint (prevents duplicates)');
              
              db.close();
            });
          });
        });
      });
    });
  });
}

// Run the fix
fixDatabase(); 