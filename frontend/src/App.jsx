import {useState, useEffect} from 'react';
import '@mantine/core/styles.css';
import { MantineProvider, Button, Table, ScrollArea, Modal, TextInput, Select, NumberInput, Text } from '@mantine/core';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IconCalendarStats } from '@tabler/icons-react';
import moment from 'moment'

function App() {
  const [portfolio, setPortfolio] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [opened, setOpened] = useState(false)
  const [openedPort, setOpenedPort] = useState(false)
  const [stocks, setStocks] = useState(false);
  const [searchStocks, setSearchStocks] = useState([]);
  const [currPortfolio, setCurrentPortfolio] = useState(0);
  const [industry, setIndustry] = useState([]);
  const [port_name, setPortName] = useState('');
  const [port_industry, setPortIndustry] = useState('');
  const [symbol, setSymbol] = useState('') 
  const [num, setNum] = useState(1)
  const [statsOpen, setStatsOpen] = useState(false)
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [minDate, setMinDate] = useState(new Date())
  const [maxDate, setMaxDate] = useState(new Date())
  const [minStock, setMinStock] = useState([])
  const [maxStock, setMaxStock] = useState([])
  const [avgHigh, setavgHigh] = useState([])
  const [mis, setMIS] = useState([])
  const [portValue, setPortValue] = useState([])
  const [reportPort, setReportPort] = useState(null)

  // use effect
  useEffect(() => {
    getPortfolio()
  }, [openedPort]);

  // Adding a portfolio (Opening Modal and fetching industries available)
  function addPortfolio() {
    setOpenedPort(true)
    // Fetching industries available in database
    fetch('http://localhost:3001/industry')
    .then(response => response.json())
    .then(data => {
      const industryNames = data.map(item => item.industry);
      industryNames.push('ALL');
      setIndustry(industryNames);
    });
  }

  // Getting portfolios from the database
  function getPortfolio() {
    fetch('http://localhost:3001')
      .then(response => {
        return response.text();
      })
      .then(data => {
        setPortfolio(JSON.parse(data));
      });
  }

  // Creating a new portfolio in database
  function createPortfolio() {
    fetch('http://localhost:3001/portfolio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({port_name, port_industry}),
    })
      .then(response => {
        return response.text();
      })
      .then(data => {
        alert(data);
        setPortName('');
        setPortIndustry('');
        setOpenedPort(false)
      });
  }
  
  // deleting a portfolio
  function deletePortfolio(id) {
    fetch(`http://localhost:3001/portfolio/${id}`, {
      method: 'DELETE',
    })
      .then(response => {
        return response.text();
      })
      .then(data => {
        alert(data);
        getPortfolio();
    });
  }

  // Opening a portfolio (Opening Modal to add stocks)
  async function openPortfolio(id, port_sect) {
    try {
      // Set the current portfolio being observed
      setCurrentPortfolio(id);

      // Fetch stocks in that portfolio
      const stocksResponse = await fetch(`http://localhost:3001/stocks/${id}`);
      const stocksData = await stocksResponse.text();
      setStocks(JSON.parse(stocksData));
      
      // Fetch the stocks pertaining to the portfolio's sector
      const allStocksResponse = await fetch(`http://localhost:3001/stocks?port_sect=${port_sect}`);
      const allStocksData = await allStocksResponse.json();

      const stockNames = allStocksData.map(item => item.ticker);
      setSearchStocks(stockNames);

      // Open the modal after fetching data
      setOpened(true);
    } catch (error) {
      console.error('Error updating portfolio:', error);
    }
  }

  // Adding a new stock to the portfolio
  async function addStock() {
    try {
      const id = currPortfolio;
      // Create a new stock
      const createStockResponse = await fetch(`http://localhost:3001/stocks/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, symbol, num: num }),
      });
  
  
      // Open the portfolio and update it after creating the stock
      const stocksResponse = await fetch(`http://localhost:3001/stocks/${id}`);
      const stocksData = await stocksResponse.text();
      setStocks(JSON.parse(stocksData));
  
      // Update the portfolio
      await fetch(`http://localhost:3001/update_p/${id}`);
  
      // Fetch the updated portfolio
      await getPortfolio();
    } catch (error) {
      console.error('Error creating stock or updating portfolio:', error);
    }
  }
  
  // updating a stock number
  async function updateStock(id, symbol) {
    try {
      let num = prompt('Enter new # of stocks');
      // Ensure num is a valid integer
      num = parseInt(num);
      if (isNaN(num)) {
        console.error('Invalid value for num:', num);
        return; // You may want to handle this error case differently
      }
      // Update the stock number
      const updateStockResponse = await fetch(`http://localhost:3001/stocks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, symbol, num_of_stocks: num }),
      });
  
      // Open the portfolio and update it after updating the stock
      const stocksResponse = await fetch(`http://localhost:3001/stocks/${id}`);
      const stocksData = await stocksResponse.text();
      setStocks(JSON.parse(stocksData));

      // // Update the portfolio
      await fetch(`http://localhost:3001/update_p/${id}`);

      // Fetch the updated portfolio
      await getPortfolio();
    } catch (error) {
      console.error('Error updating stock or portfolio:', error);
    }
  }

  // deleting a stock
  async function deleteStock(id, symbol) {
    try {
        // Delete the stock
        const deleteStockResponse = await fetch(`http://localhost:3001/stocks/${id}/${symbol}`, {
            method: 'DELETE',
        });
        const deleteStockData = await deleteStockResponse.text();
        alert(deleteStockData);


        // Open the portfolio and update it after updating the stock
        const stocksResponse = await fetch(`http://localhost:3001/stocks/${id}`);
        const stocksData = await stocksResponse.text();
        setStocks(JSON.parse(stocksData));

        // Update the portfolio
        await fetch(`http://localhost:3001/update_p/${id}`);

        // Get the updated portfolio
        await getPortfolio();
    } catch (error) {
        console.error('Error deleting stock:', error);
    }
}

  // open a report to generate
  function openReport(id) {
    setStatsOpen(true);
    setCurrentPortfolio(id);
    fetch(`http://localhost:3001/dates/${id}`)
      .then(response => response.json())
      .then(data => {
        const { min_date, max_date } = data;
        const minDateObj = new Date(min_date);
        const maxDateObj = new Date(max_date);
        const formattedMinDate = minDateObj.toISOString().split('T')[0]; // "2013-02-08"
        const formattedMaxDate = maxDateObj.toISOString().split('T')[0]; // "2018-02-07"
        setMinDate(new Date(formattedMinDate));
        setMaxDate(new Date(formattedMaxDate));
        setStartDate(new Date(formattedMinDate));
        setEndDate(new Date(formattedMaxDate));
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  async function createReport() {

    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();
    console.log(currPortfolio, formattedStartDate, formattedEndDate);
  
    try {
      const stock_min = await fetch(`http://localhost:3001/report1/${currPortfolio}?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
      const stock_min_data = await stock_min.text();
      setMinStock(JSON.parse(stock_min_data));

      const stock_max = await fetch(`http://localhost:3001/report2/${currPortfolio}?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
      const stock_max_data = await stock_max.text();
      setMaxStock(JSON.parse(stock_max_data));

      const port_value = await fetch(`http://localhost:3001/report3/${currPortfolio}?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
      const port_value_data = await port_value.text();
      setPortValue(JSON.parse(port_value_data));
  
      const avg_high = await fetch(`http://localhost:3001/report4/${currPortfolio}?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
      const avg_high_data = await avg_high.text();
      setavgHigh(JSON.parse(avg_high_data));

      const most_improved = await fetch(`http://localhost:3001/report5/${currPortfolio}?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
      const most_improved_data = await most_improved.text();
      setMIS(JSON.parse(most_improved_data));
  
      console.log(stock_min_data);
      console.log(stock_max_data);
      console.log(port_value_data)
      console.log(avg_high_data)
      console.log(most_improved_data)

      setReportPort(portfolio.find(port => port.port_id === currPortfolio));

    } catch (error) {
      console.error(error);
      // Handle errors as needed
    }
  }

  function closeReport() {
    setStatsOpen(false)
    setReportPort(null)
    setMinStock([])
    setMaxStock([])
    setavgHigh([])
    setMIS([])
    setPortValue([])
  }
  

  return (
    <MantineProvider>
      <div>
        <div className='container mx-auto place-content-center py-10'>
          <div className='text-6xl text-center'>
            HistoStock
          </div>
        </div>
        <div className="flex flex-row place-content-between px-2">
          <div className='text-lg font-bold'>
            Portfolios
          </div>
            <Button className='bg-emerald-400' onClick={addPortfolio}> 
              Add Portfolio
            </Button>          
        </div>
        {portfolio ?         
        <ScrollArea h={300} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={700}>
        <Table.Thead>
          <Table.Tr>  
            <Table.Th>Portfolio Id</Table.Th>
            <Table.Th>Portfolio Name</Table.Th>
            <Table.Th>Portfolio Type</Table.Th>
            <Table.Th># of Stocks</Table.Th>
            <Table.Th># of Holdings</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>                
          {portfolio.map((row) => (
                  <Table.Tr key={row.port_id}>
                    <Table.Td>{row.port_id}</Table.Td>
                    <Table.Td>{row.port_name}</Table.Td>
                    <Table.Td className='uppercase'>{row.port_sect}</Table.Td>
                    <Table.Td>{row.num_of_stocks}</Table.Td>
                    <Table.Td>{row.num_of_holdings}</Table.Td>
                    <Table.Td> 
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="fill-green-400 w-6 h-6" onClick={() => {openPortfolio(row.port_id, row.port_sect)}}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
</svg>
                    </Table.Td> 
                    <Table.Td> 
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="fill-red-400 w-6 h-6" onClick={() => {deletePortfolio(row.port_id)}}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </Table.Td> 
                  <Table.Td>
                  {row.num_of_stocks > 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-report-analytics" width="24" height="24" viewBox="0 0 24 24" onClick={() => {openReport(row.port_id)}} strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" /><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /><path d="M9 17v-5" /><path d="M12 17v-1" /><path d="M15 17v-3" /></svg>
                  ) : (
                  <span style={{ color: 'gray' }}>Cannot be generated</span>
                  )}
                  </Table.Td>
                  </Table.Tr>
          ))} 
          
          </Table.Tbody>
      </Table>
    </ScrollArea> 
    : 
    'There is no portfolio data available'
    }
    <>
      <Modal opened={opened} onClose={() => {setOpened(false)}} title="Portfolio Stocks">
        <div>
          <div className="flex flex-col place-content-between">
        <Select
            label="Insert New Stocks"
            placeholder="Pick stocks"
            data={searchStocks}
            value={symbol} onChange={setSymbol} 
            searchable
            nothingFoundMessage="Nothing found..."
          />
          <NumberInput
      label="Enter value"
      placeholder="1"
      min={1}
      value={num} onChange={setNum}
      />
        <Button className='bg-emerald-400' onClick={addStock}> 
              New Stock
        </Button>   
        </div>
        {stocks && stocks.length > 0 ?         
        <ScrollArea h={300} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={700}>
        <Table.Thead>
          <Table.Tr>  
          <Table.Th>Portfolio</Table.Th>
            <Table.Th>Stocks</Table.Th>
            <Table.Th># of Stock</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>                
          {stocks.map((row) => (
                  <Table.Tr key={row.symbol}>
                    <Table.Td>{row.portfolio_id}</Table.Td>
                    <Table.Td>{row.symbol}</Table.Td>
                    <Table.Td>{row.num_of_stocks}</Table.Td>
                    <Table.Td> 
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="fill-green-400 w-6 h-6" onClick={() => {updateStock(row.portfolio_id, row.symbol)}}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
</svg>
                    </Table.Td> 
                    <Table.Td> 
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="fill-red-400 w-6 h-6" onClick={() => {deleteStock(row.portfolio_id, row.symbol)}} >
  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </Table.Td> 
                  </Table.Tr>
          ))} 
          </Table.Tbody>
      </Table>
    </ScrollArea> 
    : 
    'There are no stocks in this portfolio'
    }
        </div>
      </Modal>
    </>

    <>
  <Modal opened={openedPort} onClose={() => { setOpenedPort(false) }} title="Create a new portfolio">
    <div className='flex flex-col place-content-between'>
        <>
          <TextInput
            label="Enter a portfolio name"
            placeholder="My Portfolio"
            value={port_name}
            onChange={(event) => setPortName(event.currentTarget.value)}
          />
          <Select
            label="Industries"
            placeholder="Pick industry"
            data={industry}
            value={port_industry} onChange={setPortIndustry} 
            searchable
            nothingFoundMessage="Nothing found..."
          />
           <Button className='bg-emerald-400 mt-4' onClick={createPortfolio}> 
              Create Portfolio
            </Button>  
        </>
    </div>
  </Modal>
  </>
  {minDate && maxDate && (
  <Modal opened={statsOpen} onClose={() => {closeReport()}} title="Set a from and to date for this portfolio" size="lg" fullScreen centered>
    <div className='flex flex-row justify-center place-content-around space-x-4'>
      <DatePicker 
        className='rounded-md border-2 border-black border-solid w-64'
        title="Start Date"
        isClearable
        selected={startDate} 
        onChange={(date) => setStartDate(date)}
        icon={<IconCalendarStats></IconCalendarStats>}
        showIcon
        minDate={new Date(minDate)}
        maxDate={new Date(maxDate)}
        placeholderText='Input Start Date'
      />
      <DatePicker 
        className='rounded-md border-2 border-black border-solid w-64'
        title="End Date"
        isClearable
        selected={endDate} 
        onChange={(date) => setEndDate(date)}
        icon={<IconCalendarStats></IconCalendarStats>}
        showIcon
        minDate={new Date(minDate)}
        maxDate={new Date(maxDate)}
        placeholderText='Input End Date'
      />
    </div>
    <Button className='bg-emerald-400 mt-4' onClick={createReport}> 
      Generate Report
    </Button>  
    <div>
    {reportPort && (
      <div className='flex flex-col place-content-evenly mt-4'>
        <div className='font-bold text-lg text-emerald-700'>
          Portfolio: 
          </div>
        <div className='flex flex-row place-content-evenly'>
          <Text>
            Portfolio ID: {reportPort.port_id}
          </Text>
          <Text>
            Portfolio Name: {reportPort.port_name}
          </Text>
          <Text>
            Portfolio Sector:  {reportPort.port_sect}
          </Text>
          <Text>
            # of Stocks: {reportPort.num_of_stocks}
          </Text>
          <Text>
            # of Holdings: {reportPort.num_of_holdings}
          </Text>
        </div>

        <div className='font-bold mt-4 text-lg text-emerald-700'>
          Portfolio Value: 
          </div>
          <div>
        <ScrollArea h={100} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={700}>
        <Table.Thead>
          <Table.Tr>  
          <Table.Th>Value at Start Date</Table.Th>
            <Table.Th>Value at End Date</Table.Th>
            <Table.Th>Profit Made</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>                
          {portValue.map((row) => (
                  <Table.Tr key={row.start_value}>
                    <Table.Td>{row.start_value}</Table.Td>
                    <Table.Td>{row.end_value}</Table.Td>
                    <Table.Td>{row.profit}</Table.Td>
                  </Table.Tr>
          ))} 
          </Table.Tbody>
      </Table>
      </ScrollArea> 
        </div>
        <div className='font-bold mt-4 text-lg text-emerald-700'>
          Company that generated most profit: 
          </div>
          <div>
        <ScrollArea h={100} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={700}>
        <Table.Thead>
          <Table.Tr>  
          <Table.Th>Symbol</Table.Th>
            <Table.Th>Increase in profit</Table.Th>
            <Table.Th>Company Name</Table.Th>
            <Table.Th>Industry</Table.Th>
            <Table.Th>Sub-Industry</Table.Th>
            <Table.Th>Date Added</Table.Th>
            <Table.Th>Founded</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>                
          {mis.map((row) => (
                  <Table.Tr key={row.symbol}>
                    <Table.Td>{row.symbol}</Table.Td>
                    <Table.Td>{row.p_increase}</Table.Td>
                    <Table.Td>{row.c_name}</Table.Td>
                    <Table.Td>{row.indus}</Table.Td>
                    <Table.Td>{row.sub_indus}</Table.Td>
                    <Table.Td>{row.date_a}</Table.Td>
                    <Table.Td>{row.founded}</Table.Td>
                  </Table.Tr>
          ))} 
          </Table.Tbody>
      </Table>
      </ScrollArea> 
        </div>
        <div className='font-bold mt-4 text-lg text-emerald-700'>
          Minimum Stocks: 
          </div>
        <div>
        <ScrollArea h={100} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={700}>
        <Table.Thead>
          <Table.Tr>  
          <Table.Th>Symbol</Table.Th>
            <Table.Th>Min Price</Table.Th>
            <Table.Th>Date of Min Price</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>                
          {minStock.map((row) => (
                  <Table.Tr key={row.symbol}>
                    <Table.Td>{row.symbol}</Table.Td>
                    <Table.Td>{row.min_price}</Table.Td>
                    <Table.Td>{row.min_date}</Table.Td>
                  </Table.Tr>
          ))} 
          </Table.Tbody>
      </Table>
    </ScrollArea> 
        </div>
        <div className='font-bold mt-4 text-lg text-emerald-700'>
          Maximum Stocks: 
          </div>
        <div>
        <ScrollArea h={100} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={700}>
        <Table.Thead>
          <Table.Tr>  
          <Table.Th>Symbol</Table.Th>
            <Table.Th>Max Price</Table.Th>
            <Table.Th>Date of Max Price</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>                
          {maxStock.map((row) => (
                  <Table.Tr key={row.symbol}>
                    <Table.Td>{row.symbol}</Table.Td>
                    <Table.Td>{row.max_price}</Table.Td>
                    <Table.Td>{row.max_date}</Table.Td>
                  </Table.Tr>
          ))} 
          </Table.Tbody>
      </Table>
    </ScrollArea> 
        </div>
        <div className='font-bold mt-4 text-lg text-emerald-700'>
          Average Price of Stocks: 
          </div>
        <div>
        <ScrollArea h={100} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={700}>
        <Table.Thead>
          <Table.Tr>  
          <Table.Th>Symbol</Table.Th>
            <Table.Th>Average Price Of Stock</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>                
          {avgHigh.map((row) => (
                  <Table.Tr key={row.symbol}>
                    <Table.Td>{row.symbol}</Table.Td>
                    <Table.Td>{row.avg_high}</Table.Td>
                  </Table.Tr>
          ))} 
          </Table.Tbody>
      </Table>
    </ScrollArea> 
        </div>
      </div>
    )}
    </div>

  </Modal>
)}
      </div>
    </MantineProvider>
  );
}
export default App;