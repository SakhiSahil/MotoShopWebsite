const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/poladcyclet.db');

(async () => {
  const SQL = await initSqlJs();
  let db;

  // Load existing DB or create new one
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    console.error('❌ Database file not found. Run init-db.js first.');
    process.exit(1);
  }

  console.log('🔄 Running videos table migration...');

  // Check if videos table exists
  const res = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='videos'");
  if (res.length === 0) {
    console.log('📦 Creating videos table...');
    db.run(`
      CREATE TABLE videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT,
        title TEXT DEFAULT '',
        title_fa TEXT DEFAULT '',
        sort_order INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Videos table created successfully!');
  } else {
    console.log('ℹ️ Videos table already exists. Skipping migration.');
  }

  // Save DB back to file
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));

  console.log('🎉 Migration completed!');
})();
