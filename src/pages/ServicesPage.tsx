import { FormEvent, ReactNode, useMemo, useState } from 'react';
import {
  clearDraftService,
  createAppointment,
  getAvailableSlots,
  getBarbers,
  getService,
  getServices,
  getSettings,
  type ContactMethod,
  type ServiceCategory,
} from '../lib/localApi';

type CategoryFilter = 'all' | ServiceCategory;
type SortMode = 'alphabetical' | 'duration' | 'priceAsc' | 'priceDesc';
type BookingStep = 1 | 2 | 3 | 'success' | null;

function BookingModal({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="booking-modal">
        <div className="modal-header">
          <div>
            <p className="section-kicker">Booking flow</p>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
          <button type="button" className="ghost-link modal-close" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ServicesPage() {
  const services = getServices();
  const barbers = getBarbers();
  const onlineEnabled = getSettings().onlineEnabled;
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('alphabetical');
  const [activeStep, setActiveStep] = useState<BookingStep>(null);
  const [serviceId, setServiceId] = useState('');
  const [barberId, setBarberId] = useState(barbers[0]?.id ?? '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('email');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [bookingReference, setBookingReference] = useState('');

  const visible = useMemo(() => {
    let next = services.filter((service) => {
      const byCategory = category === 'all' || service.category === category;
      const byQuery = service.name.toLowerCase().includes(query.toLowerCase());
      return byCategory && byQuery;
    });

    if (sort === 'alphabetical') next = [...next].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'duration') next = [...next].sort((a, b) => a.durationMin - b.durationMin);
    if (sort === 'priceAsc') next = [...next].sort((a, b) => a.price - b.price);
    if (sort === 'priceDesc') next = [...next].sort((a, b) => b.price - a.price);
    return next;
  }, [category, query, services, sort]);

  const selectedService = getService(serviceId);
  const availableTimes = useMemo(
    () => getAvailableSlots(date, barberId, serviceId),
    [barberId, date, serviceId],
  );
  const minDate = new Date().toISOString().split('T')[0];

  function closeFlow() {
    setActiveStep(null);
  }

  function openFlow(selectedServiceId: string) {
    if (!onlineEnabled) {
      setStatus('error');
      setMessage('Online booking is paused at the moment. Please try again later.');
      return;
    }
    setServiceId(selectedServiceId);
    setTime('');
    setStatus('idle');
    setMessage('');
    setActiveStep(1);
  }

  function onSelectionChanged() {
    setTime('');
    setStatus('idle');
    setMessage('');
  }

  function submitStepOne(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!serviceId || !barberId || !date) {
      setStatus('error');
      setMessage('Choose service, barber, and date before continuing.');
      return;
    }
    if (availableTimes.length === 0) {
      setStatus('error');
      setMessage('No time slots for this selection. Choose another date or barber.');
      return;
    }
    setStatus('idle');
    setMessage('');
    setActiveStep(2);
  }

  function submitStepTwo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!time) {
      setStatus('error');
      setMessage('Select a start time to continue.');
      return;
    }
    if (!availableTimes.includes(time)) {
      setStatus('error');
      setMessage('This slot is no longer available. Pick another one.');
      return;
    }
    setStatus('idle');
    setMessage('');
    setActiveStep(3);
  }

  function submitStepThree(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.includes('@') || !consent) {
      setStatus('error');
      setMessage('Fill required client data and accept policy terms.');
      return;
    }

    const result = createAppointment({
      clientName: name,
      clientEmail: email,
      clientPhone: phone,
      contactMethod,
      notes,
      serviceId,
      barberId,
      date,
      startTime: time,
    });

    if (!result.ok) {
      setStatus('error');
      setMessage(result.message);
      return;
    }

    clearDraftService();
    setBookingReference(result.appointment.id.slice(0, 8).toUpperCase());
    setStatus('success');
    setMessage('Appointment created successfully.');
    setActiveStep('success');
  }

  return (
    <section className="section-block">
      <div className="section-title">
        <p className="section-kicker">Service Menu</p>
        <h2>Service list with transparent timing and pricing</h2>
        <p>
          Filter by category, compare duration and investment at a glance, then book directly from the line item.
        </p>
      </div>

      <div className="service-filters">
        <label>
          Search
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Fade, shave, treatment..." />
        </label>
        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value as CategoryFilter)}>
            <option value="all">All categories</option>
            <option value="haircut">Haircut</option>
            <option value="beard">Beard</option>
            <option value="care">Care</option>
          </select>
        </label>
        <label>
          Sort
          <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
            <option value="alphabetical">Alphabetical (A-Z)</option>
            <option value="duration">Shortest duration</option>
            <option value="priceAsc">Price low to high</option>
            <option value="priceDesc">Price high to low</option>
          </select>
        </label>
      </div>

      <div className="service-list-shell" role="list" aria-label="Available services">
        <header className="service-list-head" aria-hidden="true">
          <span>Service</span>
          <span>Category</span>
          <span>Duration</span>
          <span>Price</span>
          <span />
        </header>
        {visible.map((service) => (
          <article key={service.id} className="service-row" role="listitem">
            <div className="service-main">
              <h3>{service.name}</h3>
              <p>{service.includes.slice(0, 2).join(' · ')}</p>
            </div>
            <p className="service-chip">{service.category}</p>
            <p className="service-stat">{service.durationMin} min</p>
            <p className="service-price">${service.price}</p>
            <div className="service-row-actions">
              {service.featured ? <span className="service-badge">House signature</span> : null}
              <button type="button" onClick={() => openFlow(service.id)}>Book</button>
            </div>
          </article>
        ))}
      </div>
      {message ? <p className={status === 'success' ? 'status-ok' : 'status-error'}>{message}</p> : null}
      {visible.length === 0 ? <p className="empty-copy">No services match your filters.</p> : null}

      {activeStep === 1 ? (
        <BookingModal
          title="Step 1 of 3 · Service, barber, and date"
          subtitle="Select treatment and calendar criteria first."
          onClose={closeFlow}
        >
          <form className="booking-form" onSubmit={submitStepOne}>
            <div className="booking-grid">
              <label>
                Service
                <select value={serviceId} onChange={(event) => { setServiceId(event.target.value); onSelectionChanged(); }}>
                  <option value="">Select service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} · {service.durationMin} min
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Barber
                <select value={barberId} onChange={(event) => { setBarberId(event.target.value); onSelectionChanged(); }}>
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name} · {barber.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Appointment date
                <input type="date" value={date} min={minDate} onChange={(event) => { setDate(event.target.value); onSelectionChanged(); }} />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="ghost-link" onClick={closeFlow}>Cancel</button>
              <button type="submit">Continue</button>
            </div>
          </form>
        </BookingModal>
      ) : null}

      {activeStep === 2 ? (
        <BookingModal
          title="Step 2 of 3 · Time picker"
          subtitle="Pick one of the currently available start times."
          onClose={closeFlow}
        >
          <form className="booking-form" onSubmit={submitStepTwo}>
            <div className="calendar-shell">
              <div className="calendar-header">
                <h3>Available start times</h3>
                <strong>{date || 'Select date'}</strong>
              </div>
              {availableTimes.length > 0 ? (
                <div className="availability-grid">
                  {availableTimes.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`availability-chip${time === slot ? ' selected' : ''}`}
                      onClick={() => setTime(slot)}
                    >
                      <strong>{slot}</strong>
                      <span>{selectedService ? `${selectedService.durationMin} min service` : 'Select service'}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="calendar-selected">No times available for this selection.</p>
              )}
            </div>
            <div className="modal-actions">
              <button type="button" className="ghost-link" onClick={() => setActiveStep(1)}>Back</button>
              <button type="submit">Continue</button>
            </div>
          </form>
        </BookingModal>
      ) : null}

      {activeStep === 3 ? (
        <BookingModal
          title="Step 3 of 3 · Client details"
          subtitle="Complete client information and confirm."
          onClose={closeFlow}
        >
          <form className="booking-form" onSubmit={submitStepThree}>
            <div className="booking-grid">
              <label>
                Full name
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Client full name" />
              </label>
              <label>
                Email
                <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@email.com" />
              </label>
              <label>
                Phone
                <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+62 ..." />
              </label>
              <label>
                Preferred contact method
                <select value={contactMethod} onChange={(event) => setContactMethod(event.target.value as ContactMethod)}>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </label>
              <label>
                Notes for your barber
                <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Length, style, concerns..." />
              </label>
            </div>
            <label className="inline-check">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
              I agree with cancellation and no-show policy terms.
            </label>
            <div className="modal-actions">
              <button type="button" className="ghost-link" onClick={() => setActiveStep(2)}>Back</button>
              <button type="submit">Confirm booking</button>
            </div>
          </form>
        </BookingModal>
      ) : null}

      {activeStep === 'success' ? (
        <BookingModal
          title="Session booked successfully"
          subtitle="Everything is all right. Your booking is now in our queue."
          onClose={closeFlow}
        >
          <div className="booking-form">
            <p className="status-ok">Reference {bookingReference || 'N/A'} has been issued for this session.</p>
            <div className="modal-actions">
              <button type="button" onClick={closeFlow}>Done</button>
            </div>
          </div>
        </BookingModal>
      ) : null}
    </section>
  );
}
