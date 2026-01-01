const { initDatabase, prepare, saveDatabase } = require('./database');

async function migrate() {
  console.log('🔄 Starting migration: Add media_type column to slides table...');
  
  await initDatabase();
  
  try {
    // Check if column already exists
    const tableInfo = prepare("PRAGMA table_info(slides)").all();
    const hasMediaType = tableInfo.some(col => col.name === 'media_type');
    
    if (hasMediaType) {
      console.log('✅ Column media_type already exists. Skipping migration.');
      return;
    }
    
    // Add media_type column with default value 'image'
    prepare("ALTER TABLE slides ADD COLUMN media_type TEXT DEFAULT 'image'").run();
    
    // Update existing rows to have 'image' as media_type
    prepare("UPDATE slides SET media_type = 'image' WHERE media_type IS NULL").run();
    
    saveDatabase();
    console.log('✅ Migration completed successfully!');
    console.log('   - Added media_type column to slides table');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();