require('dotenv').config();
const mysql = require('mysql');
const MYSQLPASS = process.env.MYSQLPASS;
const util = require('util');

// Connect to DB
const connection = mysql.createConnection({
  host: '34.133.182.114',
  user: 'root',
  password: MYSQLPASS,
  database: 'league'
});

// Convert Object to Promise
const query = util.promisify(connection.query).bind(connection);

// Universal Query Function
async function executeQuery(qry) {
  try {
    const x = await query(qry);
    console.log(x);
  }
  catch (e) {
    console.log(e);
  }
}

// Returns results
async function queryDB(qry, values) {
  try {
    const x = await query(qry, values);
    return x;
  }
  catch (e) {
    console.log(e);
  }
}

module.exports = {
  executeQuery, queryDB
};