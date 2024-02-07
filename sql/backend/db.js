const { Pool } = require('pg');

const pool = new Pool({
    user: 'akashs-chetiar',
    host: 'localhost',
    database: 'akashs-chetiar',
    password: '@Spvaaki88',
    port: 5432,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
