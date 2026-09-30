import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as productService from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/marketplace.css';

const placeholder =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=70';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewBusy, setReviewBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      productService.getProductById(id),
      productService.getProductReviews(id).catch(() => ({ reviews: [] })),
    ])
      .then(([prod, rev]) => {
        if (!active) return;
        setProduct(prod);
        setReviews(rev.reviews || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Product not found');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const onAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    setBusy(true);
    setMessage('');
    setError('');
    try {
      await addItem(product.id, qty);
      setMessage('Added to cart');
    } catch (err) {
      setError(err.message || 'Could not add to cart');
    } finally {
      setBusy(false);
    }
  };

  const onSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    setReviewBusy(true);
    setError('');
    try {
      await productService.createReview({
        productId: product.id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      const rev = await productService.getProductReviews(id);
      setReviews(rev.reviews || []);
      setReviewForm({ rating: 5, comment: '' });
      setMessage('Review submitted');
    } catch (err) {
      setError(err.message || 'Could not submit review');
    } finally {
      setReviewBusy(false);
    }
  };

  if (loading) {
    return (
      <main className="page">
        <div className="page__inner">
          <LoadingSpinner label="Loading product…" />
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="page">
        <div className="page__inner">
          <div className="empty-state">
            <h2>Product not found</h2>
            <p>{error || 'This listing may have been removed.'}</p>
            <Link className="btn btn--primary" to="/products">
              Back to products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const image = product.images?.[0] || placeholder;
  const inStock = Number(product.stock_quantity) > 0;

  return (
    <main className="page">
      <div className="page__inner">
        {message ? <div className="alert alert--ok">{message}</div> : null}
        {error ? <div className="alert alert--error">{error}</div> : null}

        <div className="detail-grid">
          <div className="detail-media">
            <img src={image} alt={product.name} />
          </div>
          <div className="detail-info">
            <p className="product-card__cat">
              {product.category?.name || 'Product'}
            </p>
            <h1>{product.name}</h1>
            <p style={{ color: '#4d6358' }}>
              Sold by {product.seller?.business_name || 'NileLink seller'}
              {product.location ? ` · ${product.location}` : ''}
            </p>
            <p className="detail-info__price">
              KES {Number(product.price || 0).toLocaleString()}
            </p>
            <p>
              {inStock ? (
                <span className="badge badge--active">In stock ({product.stock_quantity})</span>
              ) : (
                <span className="badge badge--cancelled">Out of stock</span>
              )}
              {Number(product.average_rating) > 0 ? (
                <span style={{ marginLeft: '0.65rem' }}>
                  ★ {Number(product.average_rating).toFixed(1)}
                </span>
              ) : null}
            </p>
            <p style={{ marginTop: '1rem', color: '#2f453b', lineHeight: 1.65 }}>
              {product.description || 'No description provided.'}
            </p>

            <div className="qty-row">
              <label className="field" style={{ width: '6rem' }}>
                Qty
                <input
                  type="number"
                  min="1"
                  max={product.stock_quantity || 99}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                />
              </label>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!inStock || busy}
                onClick={onAddToCart}
              >
                {busy ? 'Adding…' : 'Add to cart'}
              </button>
            </div>
          </div>
        </div>

        <section className="panel" style={{ marginTop: '2rem' }}>
          <h2>Reviews</h2>
          {reviews.length === 0 ? (
            <p style={{ color: '#4d6358' }}>No reviews yet. Be the first to share feedback.</p>
          ) : (
            <div className="review-list">
              {reviews.map((review) => (
                <article key={review.id} className="review-item">
                  <div className="review-item__meta">
                    <strong>{review.buyer?.name || review.buyer_name || 'Buyer'}</strong>
                    <span>★ {review.rating}</span>
                  </div>
                  <p>{review.comment || 'No comment'}</p>
                </article>
              ))}
            </div>
          )}

          <form onSubmit={onSubmitReview} style={{ marginTop: '1.25rem' }}>
            <h3 style={{ marginBottom: '0.75rem', color: 'var(--color-forest)' }}>
              Write a review
            </h3>
            <div className="filters-row">
              <label className="field">
                Rating
                <select
                  value={reviewForm.rating}
                  onChange={(e) =>
                    setReviewForm((prev) => ({ ...prev, rating: e.target.value }))
                  }
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n === 1 ? '' : 's'}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              Comment
              <textarea
                rows={3}
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
                }
                placeholder="Share your experience with this product"
              />
            </label>
            <button className="btn btn--secondary" type="submit" disabled={reviewBusy}>
              {reviewBusy ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default ProductDetails;
