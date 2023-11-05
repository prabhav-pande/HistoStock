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
  
app.post('/portfolio', (req, res) => {
    portfolioModel.createPortfolio(req.body)
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => {
      res.status(500).send(error);
    })
})

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})