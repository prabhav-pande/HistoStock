require('dotenv').config({path: __dirname + '/.env'})
const Pool = require('pg').Pool

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PWD,
  port: process.env.PG_PORT,
});

//get all portfolios our database
const getPortfolios = async () => {
    try {
      return await new Promise(function (resolve, reject) {
        pool.query("SELECT * FROM portfolios", (error, results) => {
          if (error) {
            reject(error);
          }
          if (results && results.rows) {
            resolve(results.rows);
          } else {
            reject(new Error("No results found"));
          }
        });
      }); 
    } catch (error_1) {
      console.error(error_1);
      throw new Error("Internal server error");
    }
  };

  const createPortfolio = (body) => {
    return new Promise(function (resolve, reject) {
      const { port_name, port_date_created, port_date_to, port_sect } = body;
      pool.query(
        "INSERT INTO portfolios (port_name, date_created, date_to, port_sect) VALUES ($1, $2, $3, $4) RETURNING *",
        [port_name, port_date_created, port_date_to, port_sect],
        (error, results) => {
          if (error) {
            console.log("database error", error)
            reject(error);
          }
          if (results && results.rows) {
            resolve(
              `A new portfolio has been added: ${JSON.stringify(results.rows[0])}`
            );
          } else {
            reject(new Error("No results found"));
          }
        }
      );
    });
  };

  module.exports = {
    getPortfolios,
    createPortfolio,
  };