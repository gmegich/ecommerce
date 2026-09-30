import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as productService from '../../services/productService';
import * as categoryService from '../../services/categoryService';
import ProductGrid from '../../components/ProductGrid';
import SearchBar from '../../components/SearchBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/marketplace.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const filters = useMemo(
    () => ({
      search: searchParams.get('search') || '',
      categoryId: searchParams.get('categoryId') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      availability: searchParams.get('availability') || '',
      sort: searchParams.get('sort') || 'newest',
      page: Number(searchParams.get('page') || 1),
      limit: 12,
    }),
    [searchParams]
  );

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );

    productService
      .getProducts(params)
      .then((res) => {
        if (!active) return;
        setProducts(res.products || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Unable to load products');
        setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  return (
    <main className="page">
      <div className="page__inner">
        <header className="page__header">
          <h1>Products</h1>
          <p>Search and filter traditional goods from South Sudanese sellers.</p>
        </header>

        <div className="page__toolbar">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSubmit={(value) => updateParam('search', value.trim())}
          />
        </div>

        <div className="filters-row">
          <label className="field">
            Category
            <select
              value={filters.categoryId}
              onChange={(e) => updateParam('categoryId', e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Min price
            <input
              type="number"
              min="0"
              value={filters.minPrice}
              onChange={(e) => updateParam('minPrice', e.target.value)}
              placeholder="0"
            />
          </label>
          <label className="field">
            Max price
            <input
              type="number"
              min="0"
              value={filters.maxPrice}
              onChange={(e) => updateParam('maxPrice', e.target.value)}
              placeholder="Any"
            />
          </label>
          <label className="field">
            Availability
            <select
              value={filters.availability}
              onChange={(e) => updateParam('availability', e.target.value)}
            >
              <option value="">Any</option>
              <option value="in_stock">In stock</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
          </label>
          <label className="field">
            Sort
            <select
              value={filters.sort}
              onChange={(e) => updateParam('sort', e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </label>
        </div>

        {error ? <div className="alert alert--error">{error}</div> : null}
        {loading ? (
          <LoadingSpinner label="Loading products…" />
        ) : (
          <>
            <p style={{ color: '#4d6358', marginBottom: '1rem' }}>
              {pagination.total ?? products.length} result
              {(pagination.total ?? products.length) === 1 ? '' : 's'}
            </p>
            <ProductGrid products={products} />
            {pagination.pages > 1 ? (
              <div className="pagination">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={page === pagination.page ? 'is-active' : ''}
                    onClick={() => updateParam('page', String(page))}
                  >
                    {page}
                  </button>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
};

export default Products;
