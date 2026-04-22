import { useState } from 'react';
import { clearAllData, seedDemoData } from '../lib/localApi';

export function SettingsPage() {
  const [message, setMessage] = useState('');

  function onClearData() {
    clearAllData();
    setMessage('Website data cleared. You can start a fresh test run now.');
  }

  function onSeedData() {
    seedDemoData();
    setMessage('Demo appointments, orders, and profile data were seeded.');
  }

  return (
    <section className="section-block">
      <div className="section-title">
        <p className="section-kicker">Settings</p>
        <h2>Reset website state or seed test-ready demo data</h2>
        <p>Use this page to quickly restart QA flows without manually creating bookings and orders each time.</p>
      </div>

      <div className="settings-grid">
        <article className="service-card">
          <h3>Clear website data</h3>
          <p>Remove all local appointments, orders, profile data, and preferences to restart from a blank state.</p>
          <button type="button" className="danger-button" onClick={onClearData}>Clear website data</button>
        </article>

        <article className="service-card">
          <h3>Seed demo data</h3>
          <p>Populate appointments, orders, and client profile records so regression tests can start immediately.</p>
          <button type="button" className="ghost-link" onClick={onSeedData}>Seed demo data</button>
        </article>
      </div>

      {message ? <p className="status-ok">{message}</p> : null}
    </section>
  );
}
