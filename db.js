const sql = require('mssql');

const config = {
    user:     'sa',
    password: 'Research@123',
    server:   'localhost',
    port:      1433,
    database: 'UniversityResearchDB',
    options: {
        trustServerCertificate: true,
        enableArithAbort:       true,
        encrypt:                false
    }
};

let pool;

async function connectDB() {
    try {
        pool = await sql.connect(config);
        console.log('✅ Database Connected Successfully!');
    } catch (err) {
        console.error('❌ Failed:', err.message);
        process.exit(1);
    }
}

function getPool() { return pool; }
module.exports = { sql, connectDB, getPool };