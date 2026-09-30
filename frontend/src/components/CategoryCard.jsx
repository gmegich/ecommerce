import { Link } from 'react-router-dom';
import '../styles/marketplace.css';

const CategoryCard = ({ category }) => (
  <Link
    to={`/products?categoryId=${category.id}`}
    className="category-card"
  >
    <h3>{category.name}</h3>
    <p>{category.description || 'Browse this collection'}</p>
  </Link>
);

export default CategoryCard;
