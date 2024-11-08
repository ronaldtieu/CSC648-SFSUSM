import React from 'react';
import './Marketplace.css';

const Marketplace = () => {
  // Sample product data, replace with actual data fetching logic
  const products = [
    { id: 1, name: 'Product 1', description: 'Description of Product 1', price: '$10', seller: 'Gator Student 1', imageUrl: 'https://www.apple.com/newsroom/images/product/watch/lifestyle/Apple_announces-watch-se_09152020_big.jpg.large.jpg' },
    { id: 2, name: 'Product 2', description: 'Description of Product 2', price: '$20', seller: 'Gator Student 2', imageUrl: 'https://m.media-amazon.com/images/I/615SQnkivIS._AC_UY1000_.jpg' },
    { id: 3, name: 'Product 3', description: 'Description of Product 3', price: '$30', seller: 'Gator Student 3', imageUrl: 'https://m.media-amazon.com/images/I/612SBndQ6hL._UF1000,1000_QL80_.jpg' },
    { id: 4, name: 'Product 4', description: 'Description of Product 4', price: '$40', seller: 'Gator Student 4', imageUrl: 'https://pbs.twimg.com/media/EZ4SwkoUMAIC-aP.jpg'},
  ];

  return (
    <div className="marketplace">
      <h1 className="marketplace-header">Marketplace</h1>
      <div className="product-grid">
        {products.map(product => (
          <div className="product-card" key={product.id}>
            <div className="product-image-container">
              <img src={product.imageUrl} alt={product.name} className="product-image" />
            </div>
            <div className="product-details">
              <h2 className="product-name">{product.name}</h2>
              <p className="product-seller">Sold by: {product.seller}</p>
              <p className="product-description">{product.description}</p>
              <p className="product-price">{product.price}</p>
              <button className="product-button">Send Message</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;