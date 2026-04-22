import { Link, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { getSettings } from './lib/localApi';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ShopPage } from './pages/ShopPage';
import { SettingsPage } from './pages/SettingsPage';
import { StudioPage } from './pages/StudioPage';

function OnlineGate({ children }: { children: JSX.Element }) {
  if (!getSettings().onlineEnabled) {
    return (
      <section className="section-block">
        <div className="section-title">
          <p className="section-kicker">Temporarily Offline</p>
          <h2>Online bookings and checkout are paused right now.</h2>
          <p>
            You can still browse our services and house journal. To restore live transactions, visit{' '}
            <Link to="/settings">settings</Link>.
          </p>
        </div>
      </section>
    );
  }
  return children;
}

export default function App() {
  const location = useLocation();

  return (
    <main className="site-root">
      <header className="site-header">
        <NavLink to="/" end className="brand-lockup" aria-label="Whynkle and Co home">
          <img src="/whynkles-logo.png" alt="" className="brand-logo" width={120} height={120} />
          <span className="brand-copy">
            <strong>Whynkle &amp; Co.</strong>
            <small>Barbering House</small>
          </span>
        </NavLink>
        <nav className="site-nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/services">Services</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/studio">Client Desk</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
      </header>

      <div key={location.pathname} className="route-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/booking" element={<Navigate to="/services" replace />} />
          <Route path="/shop" element={<OnlineGate><ShopPage /></OnlineGate>} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/test-settings" element={<Navigate to="/settings" replace />} />
          <Route path="/house-preferences" element={<Navigate to="/settings" replace />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>

      <footer className="site-footer">
        <p>Whynkle &amp; Co. · Since 2026</p>
      </footer>
    </main>
  );
}
