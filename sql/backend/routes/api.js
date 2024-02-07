const express = require('express');
const db = require('../db')
const { Parser } = require('node-sql-parser');
const parser = new Parser();
const router = express.Router();

router.post('/sql_query_syntax_check', async (req, res) => {
    try {
      const { sqlQuery } = req.body;
      const ast = parser.astify(sqlQuery);  
      res.json({ success: true });
    } catch (error) {
      let errorMessage = `SQL Syntax Error: ${error.message}`;
      res.status(400).json({ success: false, error: errorMessage });
    }
    
  });
  
  function sanitizeTableName(tableName) {
    return tableName.replace(/[^a-zA-Z0-9_]/g, ''); 
  }
  
  function sanitizeSchemaName(schemaName) {
    return schemaName.replace(/[^a-zA-Z0-9_]/g, ''); 
  }
  router.post('/sql_query', async (req, res) => {
    try {
        const { sqlQuery, ruleName ,table , schema} = req.body;
        const sanitizedTable = sanitizeTableName(table);
        const sanitizedSchema = sanitizeSchemaName(schema);
        const insertQuery = `INSERT INTO "${sanitizedSchema}"."${sanitizedTable}" (rule_name, sql_query)VALUES ($1, $2)`;
        await db.query(insertQuery, [ ruleName,sqlQuery]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });
  
  router.post('/update_row', async (req, res) => {
    try {
      const { id, editedSqlQuery, editedRuleName, table, schema } = req.body;
      const sanitizedTable = sanitizeTableName(table);
      const sanitizedSchema = sanitizeSchemaName(schema);
  
      const updateQuery = `
        UPDATE "${sanitizedSchema}"."${sanitizedTable}"
        SET rule_name = $1, sql_query = $2, updated_at = TO_CHAR(CURRENT_TIMESTAMP, 'YYYY-MM-DD HH24:MI:SS.US')
        WHERE id = $3
      `;
  
      await db.query(updateQuery, [editedRuleName, editedSqlQuery, id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });
  
  
  router.post('/createSchema', async (req, res) => {
    const { schemaName } = req.body;
    try {
      if (!schemaName || schemaName.trim() === '') {
        return res.status(400).json({ success: false, error: 'Invalid schema name' });
      }
      await db.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
      return res.status(200).json({ success: true, message: 'Schema created successfully' });
    } catch (error) {
      console.error('Error creating schema:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });
  
  router.get('/get_schemas', async (req, res) => {
    try {
      const result = await db.query("SELECT schema_name FROM information_schema.schemata");
      const schemas = result.rows.map(row => row.schema_name);
      res.json({ schemas });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });
  
  router.get('/get_tables/:schema', async (req, res) => {
    try {
      const schema = req.params.schema;
      const result = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = $1", [schema]);
      const tables = result.rows.map(row => row.table_name);
      res.json({ success: true, tables });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });
  
  router.get('/get_data/:schema/:table', async (req, res) => {
    try {
      const { schema, table } = req.params;
  
      const sanitizedTable = sanitizeTableName(table);
      const sanitizedSchema = sanitizeSchemaName(schema);
  
      const selectQuery = `
        SELECT * FROM "${sanitizedSchema}"."${sanitizedTable}"
      `;
  
      const result = await db.query(selectQuery);
  
      res.json({ success: true, data: result.rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  router.delete('/delete_row/:schema/:table/:id', async (req, res) => {
    try {
      const { schema, table, id } = req.params;
      const sanitizedTable = sanitizeTableName(table);
      const sanitizedSchema = sanitizeSchemaName(schema);
      const deleteQuery = `
        DELETE FROM "${sanitizedSchema}"."${sanitizedTable}"
        WHERE id = $1
      `;
      await db.query(deleteQuery, [id]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

module.exports = router;