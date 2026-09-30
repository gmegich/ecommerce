import { Link } from 'react-router-dom';
import '../styles/marketplace.css';

const placeholder =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=60';

const formatPrice = (value) =>
  `KES ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const ProductCard = ({ product }) => {
  const image = product.images?.[0] || placeholder;
  const categoryName = product.category?.name || product.category_name || 'Product';
  const rating = Number(product.average_rating || 0);

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card__media">
        <img src={image} alt={product.name} loading="lazy" />
      </div>
      <div className="product-card__body">
        <span className="product-card__cat">{categoryName}</span>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__meta">
          {product.seller?.business_name || product.location || 'NileLink seller'}
        </p>
        {rating > 0 ? (
          <p className="product-card__rating">★ {rating.toFixed(1)}</p>
        ) : null}
        <p className="product-card__price">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
