import React, { useEffect, useState } from 'react';
import './DiscountDeals.css';
const DiscountsDeals = () => {

  const [deals, setDeals] = useState([]);

  useEffect(() => {
    fetch('/api/deals')
      .then(response => response.json())
      .then(data => setDeals(data))
      .catch(error => console.error('Error fetching deals:', error));
  }, []);

  return (
    <div className="discounts-deals">
      <h1>Student Discounts and Deals</h1>
      <div className="deals-list">
        {deals.map((deal, index) => (
          <div key={index} className="deal-item">
            <h2>{deal.title}</h2>
            <p>{deal.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscountsDeals;