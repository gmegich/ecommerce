import ProductCard from './ProductCard';
import '../styles/marketplace.css';

const ProductGrid = ({ products = [] }) => {
  if (!products.length) {
    return (
      <div className="empty-state">
        <h2>No products found</h2>
        <p>Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
