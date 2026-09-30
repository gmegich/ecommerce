import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as categoryService from '../../services/categoryService';
import * as productService from '../../services/productService';
import CategoryCard from '../../components/CategoryCard';
import ProductGrid from '../../components/ProductGrid';
import LoadingSpinner from '../../components/LoadingSpinner';
import './Home.css';
import '../../styles/marketplace.css';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([
      categoryService.getCategories(),
      productService.getProducts({ limit: 8, sort: 'newest' }),
    ])
      .then(([cats, prod]) => {
        if (!active) return;
        setCategories((cats || []).slice(0, 6));
        setProducts(prod.products || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Unable to load marketplace data');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="hero__overlay">
          <div className="hero__content">
            <p className="hero__eyebrow">South Sudan · Kenya corridor</p>
            <h1 className="hero__brand">NileLink Market</h1>
            <p className="hero__lead">
              A marketplace for traditional foods, clothing, cosmetics, and
              handmade goods from South Sudanese suppliers — for South Sudanese
              communities living in Kenya.
            </p>
            <div className="hero__actions">
              <Link className="btn btn--primary" to="/products">
                Browse products
              </Link>
              <Link className="btn btn--ghost" to="/register">
                Become a seller
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__inner">
          <h2>Shop by category</h2>
          <p>Explore cultural products sourced from verified South Sudanese sellers.</p>
          {loading ? (
            <LoadingSpinner label="Loading categories…" />
          ) : error ? (
            <div className="alert alert--warn">{error}</div>
          ) : (
            <div className="category-grid">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="home-section" style={{ paddingTop: 0 }}>
        <div className="home-section__inner">
          <h2>Featured products</h2>
          <p>Fresh listings from the NileLink community.</p>
          {loading ? (
            <LoadingSpinner label="Loading products…" />
          ) : (
            <ProductGrid products={products} />
          )}
          <div style={{ marginTop: '1.5rem' }}>
            <Link className="btn btn--secondary" to="/products">
              View all products
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
