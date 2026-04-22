import { Link } from 'react-router-dom';
import { getServices } from '../lib/localApi';

export function HomePage() {
  const featuredServices = getServices().filter((item) => item.featured).slice(0, 3);
  const yearsActive = 15;

  return (
    <div className="home-v2" data-testid="home-page">
      <section className="home-v2-section home-v2-hero" data-testid="home-hero">
        <div className="home-v2-hero-copy">
          <p className="section-kicker">Whynkle &amp; Co. Barbering House</p>
          <h1>Make your own style with precision barbering.</h1>
          <p>Sharp cuts. Clear booking. Premium care.</p>
          <div className="home-v2-hero-actions">
            <Link to="/services" className="primary-link" data-testid="hero-primary-cta">Book now</Link>
            <Link to="/shop" className="ghost-link">Shop products</Link>
            <Link to="/studio" className="ghost-link">Client desk</Link>
          </div>
        </div>
      </section>

      <section className="home-v2-section home-v2-experience" data-testid="home-about-experience">
        <div className="home-v2-experience-copy">
          <p className="section-kicker">About the house</p>
          <h2>{yearsActive} years of experience in modern barbering craft.</h2>
          <p>Consistent service, transparent timing, and specialists for every style.</p>
          <ul className="home-v2-experience-list">
            <li>Walk-ins welcome.</li>
            <li>Fade, scissor, and beard specialists.</li>
            <li>Simple aftercare guidance.</li>
          </ul>
          <Link to="/studio" className="ghost-link">Open client desk</Link>
        </div>
        <div className="home-v2-experience-points" aria-label="Experience highlights">
          <p><strong>Consult</strong> · Quick style alignment.</p>
          <p><strong>Execute</strong> · Precise, clean finish.</p>
          <p><strong>Maintain</strong> · Easy daily routine.</p>
        </div>
      </section>

      <section className="home-v2-section home-v2-services" data-testid="home-services">
        <div className="home-v2-title">
          <p className="section-kicker">Service menu</p>
          <h2>Most requested services this season.</h2>
          <p>Top picks, clear timing, direct booking.</p>
        </div>
        <div className="home-v2-services-list" data-testid="featured-services-grid">
          {featuredServices.map((service) => (
            <div key={service.id} className="home-v2-service-row">
              <div>
                <p className="service-meta">{service.category}</p>
                <h3>{service.name}</h3>
                <p>{service.includes.join(' · ')}</p>
              </div>
              <p className="home-v2-service-meta">{service.durationMin} min · ${service.price}</p>
              <Link to="/services" className="ghost-link">See in services</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="home-v2-section home-v2-promo" data-testid="promo-banner">
        <div className="home-v2-promo-copy">
          <p className="section-kicker">Special offer</p>
          <h2>Get 10% off your first combined service + product session.</h2>
          <p>Book a service and add products in one flow.</p>
        </div>
        <div className="home-v2-promo-actions">
          <Link to="/services" className="primary-link" data-testid="promo-cta-services">
            Start booking
          </Link>
          <Link to="/shop" className="ghost-link">Add products</Link>
          <Link to="/settings" className="ghost-link">Open settings</Link>
        </div>
      </section>
    </div>
  );
}
