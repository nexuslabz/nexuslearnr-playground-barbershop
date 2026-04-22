import { useMemo, useState } from 'react';
import {
  cancelAppointment,
  getBarber,
  getBarbers,
  getPreferences,
  getProfile,
  getService,
  listAppointments,
  listOrders,
  savePreferences,
  saveProfile,
  transitionAppointment,
  type AppointmentStatus,
  type ContactMethod,
} from '../lib/localApi';

type Tab = 'appointments' | 'orders' | 'profile';

export function StudioPage() {
  const [tab, setTab] = useState<Tab>('appointments');
  const [appointments, setAppointments] = useState(listAppointments);
  const [orders, setOrders] = useState(listOrders);
  const [profile, setProfile] = useState(getProfile);
  const [preferences, setPreferences] = useState(getPreferences);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const filteredAppointments = useMemo(
    () =>
      appointments.filter((item) => {
        const byStatus = statusFilter === 'all' || item.status === statusFilter;
        const bySearch =
          item.clientName.toLowerCase().includes(search.toLowerCase()) ||
          item.clientEmail.toLowerCase().includes(search.toLowerCase());
        return byStatus && bySearch;
      }),
    [appointments, search, statusFilter],
  );

  function refresh() {
    setAppointments(listAppointments());
    setOrders(listOrders());
  }

  function advance(appointmentId: string) {
    const result = transitionAppointment(appointmentId);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    refresh();
    setMessage(`Appointment moved to ${result.appointment.status.replace('_', ' ')}.`);
  }

  function cancel(appointmentId: string) {
    const result = cancelAppointment(appointmentId);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    refresh();
    setMessage('Appointment cancelled.');
  }

  function saveProfileInfo() {
    saveProfile(profile);
    savePreferences(preferences);
    setMessage('Client profile and reminder preferences updated.');
  }

  return (
    <section className="section-block studio-page">
      <div className="section-title">
        <p className="section-kicker">Client Desk</p>
        <h2>Appointments, retail history, and client preferences</h2>
        <p>Manage visit progression, review orders, and keep profile details aligned with future bookings.</p>
      </div>

      <div className="tab-row studio-tabs">
        <button type="button" className={tab === 'appointments' ? 'tab active' : 'tab'} onClick={() => setTab('appointments')}>Appointments</button>
        <button type="button" className={tab === 'orders' ? 'tab active' : 'tab'} onClick={() => setTab('orders')}>Orders</button>
        <button type="button" className={tab === 'profile' ? 'tab active' : 'tab'} onClick={() => setTab('profile')}>Profile</button>
      </div>

      {tab === 'appointments' ? (
        <article className="service-card studio-panel">
          <div className="inline-line studio-panel-head">
            <h3>Appointment queue</h3>
            <button type="button" onClick={refresh}>Refresh</button>
          </div>
          <div className="service-filters">
            <label>
              Search
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Client name or email" />
            </label>
            <label>
              Status
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as AppointmentStatus | 'all')}>
                <option value="all">All statuses</option>
                <option value="requested">Requested</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_service">In service</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No-show</option>
              </select>
            </label>
          </div>
          {filteredAppointments.length === 0 ? (
            <p>No appointments found for this filter.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Barber</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.date}</td>
                    <td>{appointment.startTime} - {appointment.endTime}</td>
                    <td>{appointment.clientName}</td>
                    <td>{getService(appointment.serviceId)?.name ?? appointment.serviceId}</td>
                    <td>{getBarber(appointment.barberId)?.name ?? appointment.barberId}</td>
                    <td>{appointment.status.replace('_', ' ')}</td>
                    <td className="inline-line">
                      <button type="button" onClick={() => advance(appointment.id)}>Advance</button>
                      <button type="button" onClick={() => cancel(appointment.id)}>Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>
      ) : null}

      {tab === 'orders' ? (
        <article className="service-card studio-panel">
          <div className="inline-line studio-panel-head">
            <h3>Retail orders</h3>
            <button type="button" onClick={refresh}>Refresh</button>
          </div>
          {orders.length === 0 ? (
            <p>No retail orders registered yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Fulfillment</th>
                  <th>Payment</th>
                  <th>Items</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id.slice(0, 8).toUpperCase()}</td>
                    <td>{order.customerName}</td>
                    <td>{order.fulfillment}</td>
                    <td>{order.paymentMethod}</td>
                    <td>{order.lines.reduce((sum, line) => sum + line.quantity, 0)}</td>
                    <td>${order.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>
      ) : null}

      {tab === 'profile' ? (
        <article className="service-card studio-panel studio-profile">
          <h3>Client profile</h3>
          <label>
            Full name
            <input value={profile.fullName} onChange={(event) => setProfile((current) => ({ ...current, fullName: event.target.value }))} />
          </label>
          <label>
            Preferred barber
            <select value={profile.preferredBarberId} onChange={(event) => setProfile((current) => ({ ...current, preferredBarberId: event.target.value }))}>
              {getBarbers().map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Default contact
            <select value={profile.defaultContactMethod} onChange={(event) => setProfile((current) => ({ ...current, defaultContactMethod: event.target.value as ContactMethod }))}>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </label>
          <label>
            Style notes
            <input value={profile.styleNotes} onChange={(event) => setProfile((current) => ({ ...current, styleNotes: event.target.value }))} />
          </label>
          <label>
            Loyalty tier
            <select value={profile.loyaltyTier} onChange={(event) => setProfile((current) => ({ ...current, loyaltyTier: event.target.value as typeof profile.loyaltyTier }))}>
              <option value="Standard">Standard</option>
              <option value="Gold">Gold</option>
              <option value="Black">Black</option>
            </select>
          </label>
          <fieldset className="fieldset-line">
            <legend>Reminder preferences</legend>
            <label className="inline-check">
              <input type="checkbox" checked={preferences.notifyEmail} onChange={(event) => setPreferences((current) => ({ ...current, notifyEmail: event.target.checked }))} />
              Email reminders
            </label>
            <label className="inline-check">
              <input type="checkbox" checked={preferences.notifySms} onChange={(event) => setPreferences((current) => ({ ...current, notifySms: event.target.checked }))} />
              SMS reminders
            </label>
            <label>
              Reminder lead time (hours)
              <input type="number" min={2} max={72} value={preferences.reminderHours} onChange={(event) => setPreferences((current) => ({ ...current, reminderHours: Number(event.target.value) }))} />
            </label>
          </fieldset>
          <button type="button" onClick={saveProfileInfo}>Save profile</button>
        </article>
      ) : null}

      {message ? <p className="status-ok">{message}</p> : null}
    </section>
  );
}
