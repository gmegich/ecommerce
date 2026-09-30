import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CustomerLayout = () => (
  <div className="app-shell">
    <Navbar />
    <Outlet />
    <Footer />
  </div>
);

export default CustomerLayout;
