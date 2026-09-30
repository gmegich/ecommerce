import { Link } from 'react-router-dom';
import '../styles/marketplace.css';

const placeholder =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=60';

const CartItem = ({ item, onUpdate, onRemove, busy }) => {
  const product = item.product || {};
  const image = product.images?.[0] || placeholder;
  const name = product.name || item.product_name || 'Product';
  const price = Number(item.price ?? product.price ?? 0);
  const subtotal = Number(item.subtotal ?? price * item.quantity);

  return (
    <article className="cart-item">
      <img className="cart-item__img" src={image} alt={name} />
      <div>
        <h3 className="cart-item__name">
          {product.id ? <Link to={`/products/${product.id}`}>{name}</Link> : name}
        </h3>
        <p className="cart-item__price">KES {price.toLocaleString()} each</p>
      </div>
      <div className="cart-item__actions">
        <div className="cart-item__qty">
          <button
            type="button"
            disabled={busy || item.quantity <= 1}
            onClick={() => onUpdate(item.id, item.quantity - 1)}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span>{item.quantity}</span>
          <button
            type="button"
            disabled={busy}
            onClick={() => onUpdate(item.id, item.quantity + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <p className="cart-item__subtotal">KES {subtotal.toLocaleString()}</p>
        <button
          type="button"
          className="btn btn--ghost-dark btn--sm"
          disabled={busy}
          onClick={() => onRemove(item.id)}
        >
          Remove
        </button>
      </div>
    </article>
  );
};

export default CartItem;
