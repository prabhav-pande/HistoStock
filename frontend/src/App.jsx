import {useState, useEffect} from 'react';
import Landing from './layouts/landing';
import '@mantine/core/styles.css';
import { MantineProvider, Button, Table, ScrollArea, ActionIcon, Modal, TextInput, Select, NumberInput } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useDisclosure } from '@mantine/hooks';

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

  function openPortfolio() {
    setOpenedPort(true)
      fetch('http://localhost:3001/industry')
      .then(response => response.json())  // Parse the response as JSON
      .then(data => {
        console.log(data);
        const industryNames = data.map(item => item.industry);
        industryNames.push('ALL');
        setIndustry(industryNames);
      });

  }

  function getPortfolio() {
    fetch('http://localhost:3001')
      .then(response => {
        return response.text();
      })
      .then(data => {
        setPortfolio(JSON.parse(data));
      });
  }

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
        setPortIndustry('')
        getPortfolio();
        setOpenedPort(false)
      });

  }

  function createStock() {
    const id = currPortfolio;  
    fetch(`http://localhost:3001/stocks/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, symbol, num: num }),
    })
      .then(response => response.text())
      .then(data => {
        alert(data);
        updatePortfolio(currPortfolio);
      })
      .catch(error => {
        console.error('Error creating stock:', error);
      });
    fetch(`http://localhost:3001/update_p/${id}`)
      .then(response => {
        return response.text();
      })
      .then(() => {
        getPortfolio();
    });
  }
  
  function updatePortfolio(id) {
    setOpened(true)
    setCurrentPortfolio(id)
    fetch(`http://localhost:3001/stocks/${id}`)
      .then(response => {
        return response.text();
      })
      .then(data => {
        setStocks(JSON.parse(data));
    });
    if (searchStocks.length == 0) {
      fetch(`http://localhost:3001/stocks`)
      .then(response => response.json())  // Parse the response as JSON
      .then(data => {
        console.log(data);
        const stockNames = data.map(item => item.ticker);
        setSearchStocks(stockNames);
      });
    }
  }

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

  function deleteStock(id, symbol) {
    fetch(`http://localhost:3001/stocks/${id}/${symbol}`, {
      method: 'DELETE',
    })
      .then(response => {
        return response.text();
      })
      .then(data => {
        alert(data);
        updatePortfolio(id);
      })
      .catch(error => {
        console.error('Error deleting stock:', error);
    });
    fetch(`http://localhost:3001/update_p/${id}`)
      .then(response => {
        return response.text();
      })
      .then(() => {
        getPortfolio();
    });
  }
  

  function updateStock(id, symbol) {
    let num = prompt('Enter new # of stocks');
    // Ensure num is a valid integer
    num = parseInt(num);
    if (isNaN(num)) {
      console.error('Invalid value for num:', num);
      return; // You may want to handle this error case differently
    }
  
    fetch(`http://localhost:3001/stocks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, symbol, num_of_stocks: num }),
    })
      .then(updatedData => {
        console.log("UPDATED DATA", updatedData);  // Corrected variable name
        updatePortfolio(id)
      })
      .catch(error => {
        console.error('Error updating data:', error);
    });

    fetch(`http://localhost:3001/update_p/${id}`)
    .then(response => {
      return response.text();
    })
    .then(() => {
      getPortfolio();
    });
  }
  

  useEffect(() => {
    getPortfolio()
  }, []);

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
            <Button className='bg-emerald-400' onClick={openPortfolio}> 
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="fill-green-400 w-6 h-6" onClick={() => {updatePortfolio(row.port_id)}}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
</svg>
                    </Table.Td> 
                    <Table.Td> 
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="fill-red-400 w-6 h-6" onClick={() => {deletePortfolio(row.port_id)}}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
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
        <Button className='bg-emerald-400' onClick={createStock}> 
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="fill-red-400 w-6 h-6" onClick={() => {deleteStock(row.portfolio_id, row.symbol)}}>
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

      </div>
    </MantineProvider>
  );
}
export default App;