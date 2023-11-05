import {useState, useEffect} from 'react';
import Landing from './layouts/landing';
import '@mantine/core/styles.css';
import { MantineProvider, Button, Table, ScrollArea, ActionIcon } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';


function App() {
  const [portfolio, setPortfolio] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    let port_name = prompt('Enter portfolio name');
    let port_sect = prompt('Enter portfolio sector');
    let port_date_created = prompt('Enter portfolio creation date');
    let port_date_to = prompt('Enter when portfolio should calculate statistics to');
    fetch('http://localhost:3001/portfolio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({port_name, port_date_created, port_date_to, port_sect}),
    })
      .then(response => {
        return response.text();
      })
      .then(data => {
        alert(data);
        getPortfolio();
      });
  }

  useEffect(() => {
    getPortfolio();
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
          <Button className='bg-emerald-400' onClick={createPortfolio}> 
            Add Portfolio
          </Button>
        </div>
        {portfolio ?         
        <ScrollArea h={300} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={700}>
        <Table.Thead>
          <Table.Tr>  
            <Table.Th>Portfolio Name</Table.Th>
            <Table.Th>Portfolio Type</Table.Th>
            <Table.Th># of Stocks</Table.Th>
            <Table.Th># of Holdings</Table.Th>
            <Table.Th>Date Created</Table.Th>
            <Table.Th>Date To</Table.Th>

          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>                
          {portfolio.map((row) => (
                  <Table.Tr key={row.port_name}>
                    <Table.Td>{row.port_name}</Table.Td>
                    <Table.Td className='uppercase'>{row.port_sect}</Table.Td>
                    <Table.Td>{row.num_of_stocks}</Table.Td>
                    <Table.Td>{row.num_of_holdings}</Table.Td>
                    <Table.Td>{row.date_created}</Table.Td> 
                    <Table.Td>{row.date_to}</Table.Td> 
                    <Table.Td> 
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="fill-green-400 w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
</svg>
                    </Table.Td> 
                    <Table.Td> 
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="fill-red-400 w-6 h-6">
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

      </div>
    </MantineProvider>
  );
}
export default App;