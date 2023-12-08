CREATE OR REPLACE PROCEDURE find_range(
    IN p_portfolio_id INT,
    OUT p_min_date DATE,
    OUT p_max_date DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT
        MIN(date), MAX(date)
    INTO
        p_min_date, p_max_date
    FROM market
    WHERE name IN (
        SELECT symbol FROM portfolio_holdings WHERE portfolio_id = p_portfolio_id
    );

    IF p_min_date IS NULL OR p_max_date IS NULL THEN
        RAISE EXCEPTION 'No stocks found in the given portfolio';
    END IF;
END;
$$;


CREATE OR REPLACE PROCEDURE update_portfolio(IN p_portfolio_id INT)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update num_of_stocks in portfolio
  UPDATE portfolios
  SET num_of_holdings = (
    SELECT SUM(num_of_stocks)
    FROM portfolio_holdings
    WHERE portfolio_id = p_portfolio_id
  )
  WHERE port_id = p_portfolio_id;

  -- Check if num_of_holdings is NULL and set it to 0
  UPDATE portfolios
  SET num_of_holdings = 0
  WHERE port_id = p_portfolio_id AND num_of_holdings IS NULL;

  -- Update num_of_holdings in portfolio
  UPDATE portfolios
  SET num_of_stocks = (
    SELECT COUNT(DISTINCT symbol)
    FROM portfolio_holdings
    WHERE portfolio_id = p_portfolio_id
  )
  WHERE port_id = p_portfolio_id;

  -- Check if num_of_stocks is NULL and set it to 0
  UPDATE portfolios
  SET num_of_stocks = 0
  WHERE port_id = p_portfolio_id AND num_of_stocks IS NULL;
END;
$$;

CREATE OR REPLACE PROCEDURE find_stock_min(
    IN p_id INT,
    IN start_date DATE,
    IN end_date DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    DROP TABLE IF EXISTS stock_min;

    CREATE TABLE stock_min (
        portfolio_id INTEGER,
        symbol VARCHAR(255),
        min_date DATE,
        min_price NUMERIC
    );

    INSERT INTO stock_min
    SELECT
        ph.portfolio_id,
        ph.symbol,
        m.date AS min_date,
        m.low AS min_price
    FROM
        portfolio_holdings ph
    JOIN market m ON ph.symbol = m.name
    JOIN (
        SELECT
            ph.portfolio_id,
            ph.symbol,
            MIN(m.low) AS min_price
        FROM
            portfolio_holdings ph
        JOIN market m ON ph.symbol = m.name
        WHERE
            ph.portfolio_id = p_id
            AND m.date BETWEEN start_date AND end_date
        GROUP BY
            ph.portfolio_id, ph.symbol
    ) AS subquery ON ph.portfolio_id = subquery.portfolio_id AND ph.symbol = subquery.symbol AND m.low = subquery.min_price
    WHERE
        ph.portfolio_id = p_id
        AND m.date BETWEEN start_date AND end_date;

END;
$$;

CREATE OR REPLACE PROCEDURE find_stock_max(
    IN p_id INT,
    IN start_date DATE,
    IN end_date DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    DROP TABLE IF EXISTS stock_max;

    CREATE TABLE stock_max (
        portfolio_id INTEGER,
        symbol VARCHAR(255),
        max_date DATE,
        max_price NUMERIC
    );

    INSERT INTO stock_max
    SELECT
        ph.portfolio_id,
        ph.symbol,
        m.date AS max_date,
        m.high AS max_price
    FROM
        portfolio_holdings ph
    JOIN market m ON ph.symbol = m.name
    JOIN (
        SELECT
            ph.portfolio_id,
            ph.symbol,
            MAX(m.high) AS max_price
        FROM
            portfolio_holdings ph
        JOIN market m ON ph.symbol = m.name
        WHERE
            ph.portfolio_id = p_id
            AND m.date BETWEEN start_date AND end_date
        GROUP BY
            ph.portfolio_id, ph.symbol
    ) AS subquery ON ph.portfolio_id = subquery.portfolio_id AND ph.symbol = subquery.symbol AND m.high = subquery.max_price
    WHERE
        ph.portfolio_id = p_id
        AND m.date BETWEEN start_date AND end_date;

END;
$$;

CREATE OR REPLACE PROCEDURE calculate_portfolio_value(
    IN p_id INT,
    IN start_date DATE,
    IN end_date DATE
)
LANGUAGE plpgsql
AS $$
DECLARE
    start_value NUMERIC;
    end_value NUMERIC;
    profit NUMERIC;
BEGIN
    DROP TABLE IF EXISTS port_value;

    CREATE TABLE port_value (
        start_value NUMERIC,
        end_value NUMERIC,
        profit NUMERIC
    );

    SELECT SUM(ph.num_of_stocks * m.close)
    INTO start_value
    FROM portfolio_holdings ph
    JOIN market m ON ph.symbol = m.name
    WHERE ph.portfolio_id = p_id
      AND m.date = (SELECT MIN(date) FROM market WHERE date >= start_date);

    SELECT SUM(ph.num_of_stocks * m.close)
    INTO end_value
    FROM portfolio_holdings ph
    JOIN market m ON ph.symbol = m.name
    WHERE ph.portfolio_id = p_id
      AND m.date = (SELECT MAX(date) FROM market WHERE date <= end_date);

    profit := end_value - start_value;

    INSERT INTO port_value VALUES (start_value, end_value, profit);
END;
$$;


CREATE OR REPLACE PROCEDURE rank_by_avg_high(
    IN p_id INT,
    IN start_date DATE,
    IN end_date DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    DROP TABLE IF EXISTS stocks_avg_high;

    CREATE TABLE stocks_avg_high (
        symbol VARCHAR(255),
        avg_high NUMERIC
    );
    INSERT INTO stocks_avg_high
    SELECT
        ph.symbol,
        AVG(m.high) AS avg_high
    FROM
        portfolio_holdings ph
    LEFT JOIN market m ON ph.symbol = m.name
    WHERE
        ph.portfolio_id = p_id
        AND m.date BETWEEN start_date AND end_date
    GROUP BY
        ph.symbol
    ORDER BY
        avg_high DESC;
END;
$$;

CREATE OR REPLACE PROCEDURE most_improved_stock(
    IN p_id INT,
    IN start_date DATE,
    IN end_date DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    DROP TABLE IF EXISTS mis;

    CREATE TABLE mis (
        symbol VARCHAR(255),
        p_increase NUMERIC,
        c_name VARCHAR(255),
        indus VARCHAR(255),
        sub_indus VARCHAR(255),
        date_a VARCHAR(255),
        founded VARCHAR(255)
    );

    INSERT INTO mis
    SELECT
        ph.symbol,
        (MAX(m.close) - MIN(m.close)) AS p_increase,
        c.name AS c_name_result,
        c.industry as indus,
        c.sub as sub_indus,
        c.date_a,
        c.founded
    FROM
        portfolio_holdings ph
    JOIN market m ON ph.symbol = m.name
    JOIN company c ON ph.symbol = c.ticker
    WHERE
        ph.portfolio_id = p_id
        AND m.date BETWEEN start_date AND end_date
    GROUP BY
        ph.symbol,
        c.name,
        c.industry,
        c.sub,
        c.date_a,
        c.founded
    ORDER BY
        p_increase DESC;
END;
$$;




