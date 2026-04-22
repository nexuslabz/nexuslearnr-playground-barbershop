import { FormEvent, ReactNode, useMemo, useState } from 'react';
import {
  clearDraftService,
  createAppointment,
  getAvailableSlots,
  getBarbers,
  getDraftService,
  getService,
  getServices,
  type ContactMethod,
} from '../lib/localApi';

type BookingStep = 1 | 2 | 3 | null;

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

export function BookingPage() {
  const services = getServices();
  const barbers = getBarbers();
  const [activeStep, setActiveStep] = useState<BookingStep>(null);
  const [serviceId, setServiceId] = useState(getDraftService());
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

  const selectedService = getService(serviceId);
  const selectedBarber = barbers.find((item) => item.id === barberId);
  const availableTimes = useMemo(
    () => getAvailableSlots(date, barberId, serviceId),
    [barberId, date, serviceId],
  );
  const minDate = new Date().toISOString().split('T')[0];

  function closeFlow() {
    setActiveStep(null);
  }

  function openFlow() {
    setActiveStep(1);
    setStatus('idle');
    setMessage('');
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
    closeFlow();
    setStatus('success');
    setMessage(`Appointment received. Reference ${result.appointment.id.slice(0, 8).toUpperCase()}.`);
  }

  return (
    <section className="section-block">
      <div className="section-title">
        <p className="section-kicker">Booking Concierge</p>
        <h2>Reserve your appointment in three clear steps</h2>
        <p>
          Select service and barber, choose a time slot, then confirm your details.
        </p>
      </div>

      <div className="booking-shell">
        <div className="service-card">
          <h3>Current selection</h3>
          <p>Service: {selectedService?.name ?? 'Not selected'}</p>
          <p>Barber: {selectedBarber?.name ?? 'Not selected'}</p>
          <p>Date: {date || 'Not selected'}</p>
          <p>Time: {time || 'Not selected'}</p>
          <button type="button" onClick={openFlow}>Start booking flow</button>
          {message ? <p className={status === 'success' ? 'status-ok' : 'status-error'}>{message}</p> : null}
        </div>
      </div>

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
    </section>
  );
}
