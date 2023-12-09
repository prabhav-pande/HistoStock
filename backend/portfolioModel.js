require('dotenv').config({path: __dirname + '/.env'})
const Pool = require('pg').Pool

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PWD,
  port: process.env.PG_PORT,
});

// Creates a portfolio
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

// Update a portfolio
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

// Get all portfolios our database
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

  // Delete portfolio and all its holdings
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

  // create a stock
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

// get stocks for that portfolio
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
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error");
  }
};

// Update a stock number
const updateStock = async (id, symbol, num) => {
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



// Get the industry to dynamically build the industry search
const getIndustry = async () => {
  try {
    return await new Promise(function (resolve, reject) {
      pool.query("SELECT DISTINCT industry FROM company", (error, results) => {
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

// get dates
const getDates = async (id) => {
  try {
    const result = await new Promise(function (resolve, reject) {
      pool.query(
        "CALL find_range($1, null, null)",
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
    throw new Error('Internal server error');
  }
};

// get portfolio value
const getPortfolioValue = async (id, startDate, endDate) => {
  try {
    const result = await new Promise(function (resolve, reject) {
      pool.query(
        "CALL calculate_portfolio_value($1, $2, $3)",
        [id, startDate, endDate],
        async (error, results) => {
          if (error) {
            reject(error);
          } else {
            const portfolio_value_results = await pool.query(
              "SELECT * FROM port_value"
            );

            if (portfolio_value_results.rows.length > 0) {
              resolve(portfolio_value_results.rows);
            } else {
              reject(new Error("No results found for minimum stock price"));
            }
          }
        }
      );
    });

    return result; 
  } catch (error) {
    console.error(error);
    throw new Error('Internal server error');
  }
};

// get minimum price of the stock
const getStockMinPrice = async (id, startDate, endDate) => {
  try {
    const result = await new Promise(function (resolve, reject) {
      pool.query(
        "CALL find_stock_min($1, $2, $3)",
        [id, startDate, endDate],
        async (error, results) => {
          if (error) {
            reject(error);
          } else {
            const minPriceResult = await pool.query(
              "SELECT * FROM stock_min"
            );

            if (minPriceResult.rows.length > 0) {
              resolve(minPriceResult.rows);
            } else {
              reject(new Error("No results found for minimum stock price"));
            }
          }
        }
      );
    });

    return result;
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error");
  }
};

// get stock max price
const getStockMaxPrice = async (id, startDate, endDate) => {
  try {
    const result = await new Promise(function (resolve, reject) {
      pool.query(
        "CALL find_stock_max($1, $2, $3)",
        [id, startDate, endDate],
        async (error, results) => {
          if (error) {
            reject(error);
          } else {
            // Query the created table to get the results
            const maxPriceResult = await pool.query(
              "SELECT * FROM stock_max"
            );

            if (maxPriceResult.rows.length > 0) {
              resolve(maxPriceResult.rows);
            } else {
              reject(new Error("No results found for maximum stock price"));
            }
          }
        }
      );
    });

    return result;
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error");
  }
};

// get average high
const getAvgHigh = async (id, startDate, endDate) => {
  try {
    const result = await new Promise(function (resolve, reject) {
      pool.query(
        "CALL rank_by_avg_high($1, $2, $3)",
        [id, startDate, endDate],
        async (error, results) => {
          if (error) {
            reject(error);
          } else {
            // Query the created table to get the results
            const avgPriceResult = await pool.query(
              "SELECT * FROM stocks_avg_high"
            );

            if (avgPriceResult.rows.length > 0) {
              resolve(avgPriceResult.rows);
            } else {
              reject(new Error("No results found for avg stock price"));
            }
          }
        }
      );
    });

    return result;
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error");
  }
};

// get most improved company
const getMICompany = async (id, startDate, endDate) => {
  try {
    const result = await new Promise(function (resolve, reject) {
      pool.query(
        "CALL most_improved_stock($1, $2, $3)",
        [id, startDate, endDate],
        async (error, results) => {
          if (error) {
            reject(error);
          } else {
            // Query the created table to get the results
            const most_improved_stock = await pool.query(
              "SELECT * FROM mis"
            );

            if (most_improved_stock.rows.length > 0) {
              resolve(most_improved_stock.rows);
            } else {
              reject(new Error("No results found for most improved stock"));
            }
          }
        }
      );
    });

    return result; 
  } catch (error) {
    console.error(error);
    throw new Error('Internal server error');
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
    getDates,
    getStockMinPrice,
    getStockMaxPrice, 
    getPortfolioValue,
    getAvgHigh,
    getMICompany
  };