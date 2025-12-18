const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Determine database path based on environment
const isProduction = process.env.NODE_ENV === 'production';
const dbPath = process.env.DB_PATH || (isProduction ? '/data/poladcyclet.db' : path.join(__dirname, '../data/poladcyclet.db'));
const dataDir = path.dirname(dbPath);

let db = null;
let SQL = null;

async function initDatabase() {
  SQL = await initSqlJs();
  
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  return db;
}

function getDatabase() {
  return db;
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Helper to prepare a statement-like object that matches better-sqlite3 API
function prepare(sql) {
  return {
    run: (...params) => {
      try {
        db.run(sql, params);
        saveDatabase();
        const lastId = db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0];
        return { changes: db.getRowsModified(), lastInsertRowid: lastId };
      } catch (error) {
        throw error;
      }
    },
    get: (...params) => {
      try {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        }
        stmt.free();
        return undefined;
      } catch (error) {
        throw error;
      }
    },
    all: (...params) => {
      try {
        const stmt = db.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params);
        }
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      } catch (error) {
        throw error;
      }
    }
  };
}

// Export functions that match better-sqlite3 API
module.exports = {
  initDatabase,
  getDatabase,
  saveDatabase,
  prepare
};
