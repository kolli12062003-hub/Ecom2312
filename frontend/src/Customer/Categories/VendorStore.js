import React, { useState, useEffect } from 'react';
import './VendorStore.css';

const VendorStore = ({ vendorName, sellerId, onViewProduct, onAddToCart, onToggleWishlist, wishlistItems, cartItems, navigateTo }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendorProducts = async () => {
      if (!vendorName && !sellerId) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let url;
        if (sellerId) {
          url = `http://localhost:5000/api/products?sellerId=${encodeURIComponent(sellerId)}`;
        } else {
          url = `http://localhost:5000/api/products?vendor=${encodeURIComponent(vendorName)}&status=approved`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch vendor products');
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching vendor products:', err);
        setError('Unable to load vendor products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorProducts();
  }, [vendorName, sellerId]);

  const getImageSrc = (image) => {
    if (!image) return 'https://via.placeholder.com/200x150?text=No+Image';
    if (image.startsWith('http')) return image;
    if (image.includes('-') && /^\d+-/.test(image)) return `http://localhost:5000/uploads/${image}`;
    return `/IMAGES/${image}`;
  };

  const handleVisitSellerDashboard = () => {
    // Navigate to the seller's dashboard if sellerId is available
    // This would typically require the current user to be the seller or an admin
    if (sellerId) {
      console.log('Visiting seller dashboard for sellerId:', sellerId);
      // You can dispatch an event or use navigateTo if available
      window.dispatchEvent(new CustomEvent('visitSellerDashboard', { detail: { sellerId } }));
    } else {
      alert('Seller information not available');
    }
  };

  return (
    <div className="vendor-store-page container">
      <div className="vendor-store-header">
        <div className="header-top">
          <div>
            <h2>{vendorName || 'Vendor Store'}</h2>
            <p>Products by {vendorName}</p>
          </div>
          <button onClick={handleVisitSellerDashboard} className="visit-seller-btn">
            <i className="fas fa-tachometer-alt"></i> Visit Seller Dashboard
          </button>
        </div>
      </div>

      {loading && <div className="loading">Loading products...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && products.length === 0 && (
        <div className="no-products">No approved products available for this vendor.</div>
      )}

      <div className="vendor-products-grid">
        {products.map(p => (
          <div key={p._id || p.id} className="vendor-product-card">
            <img src={getImageSrc(p.image)} alt={p.name} onError={(e)=> e.target.src='https://via.placeholder.com/200x150?text=No+Img'} />
            <div className="vendor-product-body">
              <h4>{p.name}</h4>
              <p className="vendor-product-vendor">by {p.vendor}</p>
              <div className="vendor-product-price">₹{p.price?.toLocaleString()}</div>
              <div className="vendor-product-actions">
                <button onClick={() => onViewProduct && onViewProduct(p)} className="btn">View</button>
                <button onClick={() => onAddToCart && onAddToCart(p)} className="btn secondary">Add to Cart</button>
                <button onClick={() => onToggleWishlist && onToggleWishlist(p)} className={`wishlist ${wishlistItems && wishlistItems.find(i=> (i._id||i.id) === (p._id||p.id)) ? 'active' : ''}`}>♥</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorStore;
