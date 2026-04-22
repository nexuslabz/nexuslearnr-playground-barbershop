import { useMemo, useState } from 'react';
import {
  createOrder,
  getInventorySnapshot,
  type FulfillmentMethod,
  type PaymentMethod,
} from '../lib/localApi';

type CheckoutStep = 'customer' | 'payment' | 'confirm' | null;

export function ShopPage() {
  const inventory = getInventorySnapshot();
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(inventory.map((product) => [product.id, 0])),
  );
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const selectedProducts = useMemo(
    () =>
      inventory
        .map((product) => ({ product, quantity: quantities[product.id] ?? 0 }))
        .filter((entry) => entry.quantity > 0),
    [inventory, quantities],
  );

  const subtotal = useMemo(
    () =>
      inventory.reduce((sum, product) => sum + product.price * (quantities[product.id] ?? 0), 0),
    [inventory, quantities],
  );
  const previewDiscount = couponCode.trim().toUpperCase() === 'FIRSTVISIT' ? subtotal * 0.1 : 0;
  const deliveryFee = fulfillment === 'delivery' ? 9 : 0;
  const total = subtotal - previewDiscount + deliveryFee;
  const itemCount = Object.values(quantities).reduce((sum, value) => sum + value, 0);

  const canContinueToPayment =
    customerName.trim().length > 1 &&
    customerEmail.includes('@') &&
    customerPhone.trim().length > 6 &&
    (fulfillment === 'pickup' || address.trim().length > 6);

  function updateQuantity(productId: string, delta: number) {
    const product = inventory.find((entry) => entry.id === productId);
    if (!product) return;

    setQuantities((current) => {
      const nextValue = Math.max(0, (current[productId] ?? 0) + delta);
      return {
        ...current,
        [productId]: Math.min(product.available, nextValue),
      };
    });
  }

  function openCheckoutFlow() {
    if (itemCount === 0) {
      setStatus('error');
      setMessage('Add at least one product before checkout.');
      return;
    }
    setStatus('idle');
    setMessage('');
    setCheckoutStep('customer');
  }

  function closeCheckoutFlow() {
    setCheckoutStep(null);
  }

  function submitOrder() {
    const result = createOrder({
      customerName,
      customerEmail,
      customerPhone,
      fulfillment,
      paymentMethod,
      address,
      couponCode,
      notes,
      items: inventory.map((product) => ({
        productId: product.id,
        quantity: quantities[product.id] ?? 0,
      })),
    });

    if (!result.ok) {
      setStatus('error');
      setMessage(result.message);
      return;
    }

    setStatus('success');
    setMessage(`Order confirmed. Reference ${result.order.id.slice(0, 8).toUpperCase()}.`);
    setCheckoutStep(null);
    setQuantities(Object.fromEntries(inventory.map((product) => [product.id, 0])));
    setCouponCode('');
    setNotes('');
    setAddress('');
    setFulfillment('pickup');
    setPaymentMethod('card');
  }

  return (
    <section className="section-block">
      <div className="section-title">
        <p className="section-kicker">House Retail</p>
        <h2>Professional grooming products for daily maintenance</h2>
        <p>Build your cart, choose pickup or local delivery, and complete checkout in one panel.</p>
      </div>

      <div className="shop-shell">
        <div className="shop-products-grid">
          {inventory.map((product) => (
            <article key={product.id} className="shop-product-card">
              <div className="shop-product-meta">
                <h3>{product.name}</h3>
                <p>${product.price.toFixed(2)}</p>
              </div>
              <p className="shop-product-purpose">{product.purpose}</p>
              <p className="shop-product-stock">{product.available} units available</p>
              <div className="qty-row">
                <button
                  type="button"
                  className="qty-button"
                  aria-label={`Decrease ${product.name} quantity`}
                  onClick={() => updateQuantity(product.id, -1)}
                >
                  -
                </button>
                <span>{quantities[product.id] ?? 0}</span>
                <button
                  type="button"
                  className="qty-button"
                  aria-label={`Increase ${product.name} quantity`}
                  onClick={() => updateQuantity(product.id, 1)}
                >
                  +
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="shop-summary-card">
          <h3>Cart overview</h3>
          {selectedProducts.length === 0 ? (
            <p className="shop-empty-copy">No products selected yet.</p>
          ) : (
            <div className="shop-summary-lines">
              {selectedProducts.map(({ product, quantity }) => (
                <p key={product.id}>
                  <span>{product.name} x{quantity}</span>
                  <strong>${(product.price * quantity).toFixed(2)}</strong>
                </p>
              ))}
            </div>
          )}
          <div className="summary-list">
            <p>Items <strong>{itemCount}</strong></p>
            <p>Subtotal <strong>${subtotal.toFixed(2)}</strong></p>
            <p>Discount <strong>-${previewDiscount.toFixed(2)}</strong></p>
            <p>Delivery fee <strong>${deliveryFee.toFixed(2)}</strong></p>
            <p>Total <strong>${total.toFixed(2)}</strong></p>
          </div>
          <button type="button" onClick={openCheckoutFlow}>Continue checkout</button>
          {message ? <p className={status === 'success' ? 'status-ok' : 'status-error'}>{message}</p> : null}
        </aside>
      </div>

      {checkoutStep ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <article className="booking-modal shop-modal">
            <header className="modal-header">
              <div>
                <p className="section-kicker">Checkout flow</p>
                <h3>
                  {checkoutStep === 'customer'
                    ? 'Step 1 · Customer information'
                    : checkoutStep === 'payment'
                      ? 'Step 2 · Coupon, values and payment'
                      : 'Step 3 · Confirm order'}
                </h3>
                <p>
                  {checkoutStep === 'customer'
                    ? 'Add contact and fulfillment details.'
                    : checkoutStep === 'payment'
                      ? 'Review totals and choose payment method.'
                      : 'Verify all details before placing the order.'}
                </p>
              </div>
              <button type="button" className="ghost-link modal-close" onClick={closeCheckoutFlow}>
                Close
              </button>
            </header>

            {checkoutStep === 'customer' ? (
              <div className="shop-modal-body">
                <div className="booking-grid">
                  <label>
                    Customer name
                    <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
                  </label>
                  <label>
                    Customer email
                    <input value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} />
                  </label>
                  <label>
                    Customer phone
                    <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} />
                  </label>
                  <label>
                    Order notes
                    <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Gift note, preferred pickup time..." />
                  </label>
                </div>

                <fieldset className="fieldset-line">
                  <legend>Fulfillment</legend>
                  <label className="inline-check">
                    <input type="radio" checked={fulfillment === 'pickup'} onChange={() => setFulfillment('pickup')} />
                    Pick up in house
                  </label>
                  <label className="inline-check">
                    <input type="radio" checked={fulfillment === 'delivery'} onChange={() => setFulfillment('delivery')} />
                    Local delivery
                  </label>
                  {fulfillment === 'delivery' ? (
                    <label>
                      Delivery address
                      <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Street, number, district" />
                    </label>
                  ) : null}
                </fieldset>

                <div className="modal-actions">
                  <button type="button" onClick={() => setCheckoutStep('payment')} disabled={!canContinueToPayment}>
                    Continue to payment
                  </button>
                </div>
              </div>
            ) : null}

            {checkoutStep === 'payment' ? (
              <div className="shop-modal-body">
                <div className="booking-grid">
                  <label>
                    Coupon code
                    <input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="FIRSTVISIT or MEMBER15" />
                  </label>
                  <label>
                    Payment method
                    <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
                      <option value="card">Card</option>
                      <option value="pix">Pix</option>
                      <option value="cash">Cash</option>
                    </select>
                  </label>
                </div>
                <div className="summary-list">
                  <p>Items <strong>{itemCount}</strong></p>
                  <p>Subtotal <strong>${subtotal.toFixed(2)}</strong></p>
                  <p>Coupon discount <strong>-${previewDiscount.toFixed(2)}</strong></p>
                  <p>Delivery fee <strong>${deliveryFee.toFixed(2)}</strong></p>
                  <p>Total <strong>${total.toFixed(2)}</strong></p>
                </div>
                <div className="modal-actions">
                  <button type="button" className="ghost-link" onClick={() => setCheckoutStep('customer')}>
                    Back
                  </button>
                  <button type="button" onClick={() => setCheckoutStep('confirm')}>
                    Continue
                  </button>
                </div>
              </div>
            ) : null}

            {checkoutStep === 'confirm' ? (
              <div className="shop-modal-body">
                <div className="shop-confirm-grid">
                  <article className="shop-confirm-card">
                    <h4>Customer</h4>
                    <p>{customerName}</p>
                    <p>{customerEmail}</p>
                    <p>{customerPhone}</p>
                  </article>
                  <article className="shop-confirm-card">
                    <h4>Fulfillment</h4>
                    <p>{fulfillment === 'pickup' ? 'Pick up in house' : 'Local delivery'}</p>
                    {fulfillment === 'delivery' ? <p>{address}</p> : null}
                    <p>Payment: {paymentMethod.toUpperCase()}</p>
                  </article>
                </div>
                <div className="summary-list">
                  <p>Subtotal <strong>${subtotal.toFixed(2)}</strong></p>
                  <p>Discount <strong>-${previewDiscount.toFixed(2)}</strong></p>
                  <p>Delivery fee <strong>${deliveryFee.toFixed(2)}</strong></p>
                  <p>Total to pay <strong>${total.toFixed(2)}</strong></p>
                </div>
                <div className="modal-actions">
                  <button type="button" className="ghost-link" onClick={() => setCheckoutStep('payment')}>
                    Back
                  </button>
                  <button type="button" onClick={submitOrder}>
                    Confirm order
                  </button>
                </div>
              </div>
            ) : null}
          </article>
        </div>
      ) : null}
    </section>
  );
}
