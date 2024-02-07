const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 5000;
const path = require('path');
const csvWriter = require('csv-writer');
const apiRoutes = require('./routes/api');
const cron = require('node-cron');
const db = require('./db');
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json("Server running");
});
app.use('/api', apiRoutes);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const executeSql = async () => {
    console.log('Cron job executed at:', new Date().toLocaleString());
    try {
        const result = await db.query("SELECT * FROM sql");
        const filteredData = result.rows.map(row => ({
            id: row.id,
            sql_query: row.sql_query,
            rule_name: row.rule_name
        }));

        const writer = csvWriter.createObjectCsvWriter({
            path: path.resolve(__dirname,'data', `${Date()}.csv`),
            header: [
            { id: 'id', title: 'ID' },
            { id: 'rule_name', title: 'Rule Name' },
            { id: 'sql_query', title: 'Sql Query' },
            ],
        });
        writer.writeRecords(filteredData).then(() => {
            console.log('CSV Generated!');
        });
    } catch (error) {
        console.error('Error executing SQL:', error);
    }
};
// cron.schedule('*/5 * * * *', () => {
//     executeSql().catch(error => console.error('Error in cron job:', error));
// });





