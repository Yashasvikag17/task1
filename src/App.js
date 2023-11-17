import React, { useState, useEffect } from 'react';
import './App.css'

const App = () => {
  const [prizes, setPrizes] = useState([]);
  const [filteredPrizes, setFilteredPrizes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedYear, setSelectedYear] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [multiTimeWinners, setMultiTimeWinners] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8081/http://api.nobelprize.org/v1/prize.json');
    
      
        const rawData = await response.text();
        console.log('Raw Response:', rawData);
    
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
  
        const data = JSON.parse(rawData);
    
    
        if (!data || !data.prizes) {
          setErrorMessage('Invalid data format');
          return;
        }
    
        setPrizes(data.prizes);
        const uniqueCategories = [...new Set(data.prizes.map((prize) => prize.category))];
        setCategories(uniqueCategories);
    
  
        const multiTimeWinners = findMultiTimeWinners(data.prizes);
        setMultiTimeWinners(multiTimeWinners);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('An error occurred while fetching data.');
      } finally {
        setIsLoading(false);
      }
    };
    

    fetchData();
  }, []);

  const findMultiTimeWinners = (prizes) => {
    const laureatesMap = new Map();
  
    prizes.forEach((prize) => {
      if (prize.laureates) {
        prize.laureates.forEach((laureate) => {
          if (laureate.id) {
            if (laureatesMap.has(laureate.id)) {
              const count = laureatesMap.get(laureate.id);
              laureatesMap.set(laureate.id, count + 1);
            } else {
              laureatesMap.set(laureate.id, 1);
            }
          }
        });
      }
    });
  
    const multiTimeWinners = [];
    laureatesMap.forEach((count, id) => {
      if (count > 1) {
        const winner = prizes.find((prize) => prize.laureates && prize.laureates.some((l) => l.id === id));
        if (winner) {
          multiTimeWinners.push({ count, winner });
        }
      }
    });
  
    return multiTimeWinners;
  };
  
  

  const filterPrizes = () => {
    const filtered = prizes.filter(prize => (
      (!selectedCategory || prize.category === selectedCategory) &&
      (selectedYear === null || prize.year === selectedYear)
    ));
    setFilteredPrizes(filtered);
  };

  return (
    <div className='container'>
      <h1>Nobel Prize Winners</h1>

      <div>
        <label htmlFor="category">Category:</label>
        <select
          id="category"
          onChange={e => setSelectedCategory(e.target.value)}
        >
          <option value="">All</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <label htmlFor="year">Year:</label>
        <select
          id="year"
          onChange={e => setSelectedYear(parseInt(e.target.value, 10))}
        >
          <option value={null}>All</option>
          {Array.from({ length: 2019 - 1900 + 1 }, (_, index) => 1900 + index).map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <button className='btn' onClick={filterPrizes}>Filter</button>
      </div>

      {isLoading && <p>Loading...</p>}

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

    

<ul>
  {(filteredPrizes.length ? filteredPrizes : prizes).map((prize) => (
    <li key={prize.year}>
      <strong>{prize.year}</strong>
      <p>Category: {prize.category}</p>
      <p>Motivation: {prize.motivation}</p>
      <ul>
        {prize.laureates && Array.isArray(prize.laureates) ? (
          prize.laureates.map((laureate) => (
            <li key={laureate.id}>
              {laureate.firstname} {laureate.surname}
            </li>
          ))
        ) : (
          <li>No laureates available</li>
        )}
      </ul>
    </li>
  ))}
</ul>

<h2>Multi-Time Winners</h2>
<ul>
  {multiTimeWinners
    .sort((a, b) => a.winner.year - b.winner.year)
    .map((winner, index) => (
      <li key={index}>
        <p>Count: {winner.count}</p>
        <p>Year: {winner.winner.year}</p>
        <p>Category: {winner.winner.category}</p>
        {winner.winner.laureates && Array.isArray(winner.winner.laureates) ? (
          <ul>
            {winner.winner.laureates.map((laureate) => (
              <li key={laureate.id}>
                {laureate.firstname} {laureate.surname}
              </li>
            ))}
          </ul>
        ) : (
          <div>
            <p>Winner: {JSON.stringify(winner)}</p>
            <p>Winner's laureates: {JSON.stringify(winner && winner.winner)}</p>
            <p>No laureates available</p>
          </div>
        )}
      </li>
    ))}
</ul>




    </div>
  );
};

export default App;
