import React, { useState } from 'react';
import './RoommateFinder.css';

const RoommateFinder = () => {
  const [isDorm, setIsDorm] = useState(false);
  const [filterOption, setFilterOption] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCheckboxChange = () => {
    setIsDorm(!isDorm);
  };

  const handleFilterChange = (option) => {
    setFilterOption((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleFilterApply = () => {
    setIsModalOpen(false);
  };

  const dorms = [
    { name: 'WEST GROVE COMMONS', type: 'Traditional Residence Halls', community: 'Freshmen Community' },
    { name: 'MARY PARK HALL', type: 'Traditional Residence Halls', community: 'Freshmen Community' },
    { name: 'TOWERS JUNIOR SUITES', type: 'Partial Suites', community: 'Freshmen Community' },
    { name: 'TOWERS AT CENTENNIAL SQUARE', type: 'Full Suites', community: 'Freshmen & Sophomore Community' },
  ];

  const apartments = [
    { name: 'VILLAGE AT CENTENNIAL SQUARE', type: 'Apartments', community: 'Transfer & International Community' },
    { name: 'MANZANITA SQUARE', type: 'Apartments', community: 'Mixed Community (SO, JR, SR, GRAD, TRANSFER)' },
    { name: 'UNIVERSITY PARK NORTH', type: 'Apartments', community: 'Mixed Community (SO, JR, SR, GRAD)' },
    { name: 'UNIVERSITY PARK SOUTH', type: 'Apartments', community: 'Mixed Community (SO, JR, SR)' },
  ];

  const allRooms = [...dorms, ...apartments];

  const filteredRooms = allRooms.filter((room) => {
    if (isDorm && !dorms.includes(room)) return false;
    if (filterOption.length && !filterOption.some((opt) => room.community.toLowerCase().includes(opt.toLowerCase()) || room.name.toLowerCase().includes(opt.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="roommate-finder">
      <div className="filter-section">
        <label>
          <input 
            type="checkbox" 
            checked={isDorm} 
            onChange={handleCheckboxChange} 
          />
          On Campus
        </label>
        <button className="filter-button" onClick={() => setIsModalOpen(true)}>Filter</button>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={() => setIsModalOpen(false)}>&times;</span>
            <h2>Filter Options</h2>
            <div className="filter-options">
              <div className="filter-category">
                <h3>Grade</h3>
                <label>
                  <input type="checkbox" onChange={() => handleFilterChange('freshmen')} />
                  Freshman
                </label>
                <label>
                  <input type="checkbox" onChange={() => handleFilterChange('sophomore')} />
                  Sophomore
                </label>
                <label>
                  <input type="checkbox" onChange={() => handleFilterChange('junior')} />
                  Junior
                </label>
                <label>
                  <input type="checkbox" onChange={() => handleFilterChange('senior')} />
                  Senior
                </label>
              </div>
              <div className="filter-category">
                <h3>Location</h3>
                <label>
                  <input type="checkbox" onChange={() => handleFilterChange('park merced')} />
                  Park Merced
                </label>
                <label>
                  <input type="checkbox" onChange={() => handleFilterChange('daly city')} />
                  Daly City
                </label>
                <label>
                  <input type="checkbox" onChange={() => handleFilterChange('sunset district')} />
                  Sunset District
                </label>
                <label>
                  <input type="checkbox" onChange={() => handleFilterChange('richmond district')} />
                  Richmond District
                </label>
              </div>
            </div>
            <button className="apply-button" onClick={handleFilterApply}>Apply</button>
          </div>
        </div>
      )}

      <div className="room-list">
        {filteredRooms.map((room, index) => (
          <div key={index} className="room-card">
            <h2>{room.name}</h2>
            <p>Type: {room.type}</p>
            <p>Community: {room.community}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoommateFinder;