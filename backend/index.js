require('dotenv').config({path: __dirname + '/.env'})
const express = require('express')
const app = express()
const port = process.env.PORT;
const cors = require("cors")


const portfolioModel = require('./portfolioModel')

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    portfolioModel.getPortfolios()
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => {
      res.status(500).send(error);
    })
})

app.get('/dates/:id', (req, res) => {
  portfolioModel.getDates(req.params.id)
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.get('/update_p/:id', (req, res) => {
  portfolioModel.updatePortfolio(req.params.id)
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})


app.get('/industry', (req, res) => {
  portfolioModel.getIndustry()
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.get('/stocks/:id', (req, res) => {
  portfolioModel.getStocks(req.params.id)
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})


app.get('/stocks', (req, res) => {
  const port_sect = req.query.port_sect; // Use req.query to get query parameters
  portfolioModel.getSearchStocks(port_sect)
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => {
      res.status(500).send(error);
    });
});



app.put('/stocks/:id', (req, res) => {
  const id = req.params.id;
  const newData = req.body;  // Extract symbol from req.body
  const symbol = newData.symbol;
  const num = newData.num_of_stocks;

  console.log("TO UPDATE: ", id, symbol, num)

  // Ensure that the id is parsed as an integer
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId) || parsedId <= 0) {
    return res.status(400).json({ error: 'Invalid or missing ID parameter' });
  }

  portfolioModel.updateStock(parsedId, symbol, num)
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => {
      console.error('Error updating stock:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});


app.post('/stocks/:id', (req, res) => {
  portfolioModel.createStocks(req.body)
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.post('/portfolio', (req, res) => {
    portfolioModel.createPortfolio(req.body)
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => {
      res.status(500).send(error);
    })
})

app.delete('/portfolio/:id', async (req, res) => {
  try {
    const result = await portfolioModel.deletePortfolioAndHoldings(req.params.id);
    res.status(200).send(result);
  } catch (error) {
    console.error('Error deleting portfolio and holdings:', error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.delete('/stocks/:id/:symbol', (req, res) => {
  const id = req.params.id;
  const symbol = req.params.symbol;
  
  portfolioModel.deleteStocks(id, symbol)
  .then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })

});

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})