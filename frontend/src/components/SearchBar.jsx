import '../styles/marketplace.css';

const SearchBar = ({ value, onChange, onSubmit, placeholder = 'Search products…' }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(value);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
      />
      <button type="submit" className="btn btn--primary btn--sm">
        Search
      </button>
    </form>
  );
};

export default SearchBar;
