const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, 'db.json');
const seedFile = path.join(__dirname, 'seed.json');

function ensureDb() {
  if (!fs.existsSync(dbFile)) {
    const seed = fs.readFileSync(seedFile, 'utf8');
    fs.writeFileSync(dbFile, seed);
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
}

function writeDb(db) {
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

module.exports = { readDb, writeDb };
