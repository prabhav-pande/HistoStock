require('dotenv').config({path: __dirname + '/.env'})
const Pool = require('pg').Pool

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PWD,
  port: process.env.PG_PORT,
});

const getStocks = async (id) => {
  try {
    return await new Promise(function (resolve, reject) {
      pool.query("SELECT * FROM portfolio_holdings WHERE portfolio_id = $1",[id], (error, results) => {
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

const getIndustry = async () => {
  try {
    return await new Promise(function (resolve, reject) {
      pool.query("SELECT distinct industry FROM company", (error, results) => {
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


const updateStock = async (id, symbol, num) => {
  console.log("IN UPDATE STOCK: ", id, symbol, num)
  try {
    await new Promise(function (resolve, reject) {
      pool.query(
        "UPDATE portfolio_holdings SET num_of_stocks = $1 WHERE portfolio_id = $2 AND symbol = $3",
        [num, id, symbol],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(`Portfolio updated with ID and Stock: ${id},${symbol} with new number of stocks ${num}`);
          }
        }
      );
    });
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error");
  }  
};


const updatePortfolio = async (id) => {
  try {
    await new Promise(function (resolve, reject) {
      pool.query(
        "CALL update_portfolio($1)",
        [id],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(``);
          }
        }
      );
    });
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error");
  }  
};

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

  const createPortfolio = async (body) => {
    return new Promise(function (resolve, reject) {
      const { port_name, port_industry } = body;
      pool.query(
        "INSERT INTO portfolios (port_name, port_sect) VALUES ($1, $2) RETURNING *",
        [port_name, port_industry],
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




  const deletePortfolioAndHoldings = async (portfolioId) => {
    try {
      await pool.query('BEGIN');
      await pool.query('DELETE FROM portfolio_holdings WHERE portfolio_id = $1', [portfolioId]);
      await pool.query('DELETE FROM portfolios WHERE port_id = $1', [portfolioId]);
      await pool.query('COMMIT');
      return `Portfolio and associated holdings deleted with ID: ${portfolioId}`;
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  };

  // delete a portfolio
  const deleteStocks = async (id, symbol) => {
    return new Promise(function (resolve, reject) {
      pool.query(
        "DELETE FROM portfolio_holdings WHERE portfolio_id = $1 AND symbol = $2",
        [id, symbol],
        (error, results) => {
          if (error) {
            reject(error);
          }
          resolve(`Stock in portfolio ${id} deleted with symbol: ${symbol}`);
        }
      );
    });
  };
  
  const createStocks = (body) => {
    return new Promise(function (resolve, reject) {
      const { id, symbol, num } = body;
      pool.query(
        "INSERT INTO portfolio_holdings (portfolio_id, symbol, num_of_stocks) VALUES ($1, $2, $3) RETURNING *",
        [id, symbol, num],
        (error, results) => {
          if (error) {
            console.log("database error", error)
            reject(error);
          }
          if (results && results.rows) {
            resolve(
              `A new stock has been added: ${JSON.stringify(results.rows[0])}`
            );
            
          } else {
            reject(new Error("No results found"));
          }
        }
      );
    });
  };

  //get all portfolios our database
const getSearchStocks = async (port_sect) => {
  try {
    return await new Promise(function (resolve, reject) {
      if (port_sect != 'ALL') {
        pool.query("SELECT Ticker FROM company WHERE Industry = $1",[port_sect], (error, results) => {
          if (error) {
            reject(error);
          }
          if (results && results.rows) {
            resolve(results.rows);
          } else {
            reject(new Error("No results found"));
          }
        });
      } else {
        pool.query("SELECT Ticker FROM company", (error, results) => {
          if (error) {
            reject(error);
          }
          if (results && results.rows) {
            resolve(results.rows);
          } else {
            reject(new Error("No results found"));
          }
        });
      }

    }); 
  } catch (error_1) {
    console.error(error_1);
    throw new Error("Internal server error");
  }
};


const getDates = async (id) => {
  try {
    const result = await new Promise(function (resolve, reject) {
      pool.query(
        "CALL find_range_date_in_port($1, null, null)",
        [id],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            const { p_min_date, p_max_date } = results.rows[0];

            if (p_min_date !== null && p_max_date !== null) {
              resolve({ min_date: p_min_date, max_date: p_max_date });
            } else {
              reject(new Error("No results found"));
            }
          }
        }
      );
    });

    return result; 
  } catch (error) {
    console.error(error);
    throw new Error(error.message || 'Internal server error');
  }
};



  module.exports = {
    getPortfolios,
    createPortfolio,
    getStocks,
    updateStock,
    deleteStocks,
    createStocks,
    getIndustry,
    getSearchStocks,
    updatePortfolio,
    deletePortfolioAndHoldings,
    getDates
  };