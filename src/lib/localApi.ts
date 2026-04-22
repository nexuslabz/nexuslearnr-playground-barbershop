export type ServiceCategory = 'haircut' | 'beard' | 'care';
export type ContactMethod = 'email' | 'phone' | 'whatsapp';
export type AppointmentStatus = 'requested' | 'confirmed' | 'in_service' | 'completed' | 'cancelled' | 'no_show';
export type FulfillmentMethod = 'pickup' | 'delivery';
export type PaymentMethod = 'card' | 'pix' | 'cash';

export type ServiceItem = {
  id: string;
  name: string;
  category: ServiceCategory;
  durationMin: number;
  price: number;
  includes: string[];
  featured?: boolean;
};

export type Barber = {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  workingDays: number[];
  shift: { start: string; end: string };
};

export type ProductItem = {
  id: string;
  name: string;
  purpose: string;
  price: number;
  startingStock: number;
};

export type AppointmentRecord = {
  id: string;
  createdAt: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  contactMethod: ContactMethod;
  notes: string;
  serviceId: string;
  barberId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
};

export type OrderLine = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type OrderRecord = {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fulfillment: FulfillmentMethod;
  paymentMethod: PaymentMethod;
  address: string;
  couponCode: string;
  notes: string;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
};

export type ClientProfile = {
  fullName: string;
  preferredBarberId: string;
  defaultContactMethod: ContactMethod;
  styleNotes: string;
  loyaltyTier: 'Standard' | 'Gold' | 'Black';
};

export type ClientPreferences = {
  reminderHours: number;
  notifyEmail: boolean;
  notifySms: boolean;
};

export type AppSettings = {
  onlineEnabled: boolean;
  checkoutPaused: boolean;
};

type CreateAppointmentPayload = Omit<AppointmentRecord, 'id' | 'createdAt' | 'endTime' | 'status'>;
type CreateOrderPayload = Omit<OrderRecord, 'id' | 'createdAt' | 'lines' | 'subtotal' | 'discount' | 'deliveryFee' | 'total'> & {
  items: Array<{ productId: string; quantity: number }>;
};

const STORAGE_KEYS = {
  appointments: 'atelier.appointments.v3',
  orders: 'atelier.orders.v3',
  profile: 'atelier.profile.v3',
  preferences: 'atelier.preferences.v3',
  settings: 'atelier.settings.v3',
  serviceDraft: 'atelier.serviceDraft.v3',
};

const SERVICES: ServiceItem[] = [
  {
    id: 'signature-fade',
    name: 'Signature Fade',
    category: 'haircut',
    durationMin: 45,
    price: 65,
    includes: ['Consultation', 'Hot towel finish', 'Styling'],
    featured: true,
  },
  {
    id: 'classic-scissor',
    name: 'Classic Scissor Cut',
    category: 'haircut',
    durationMin: 55,
    price: 72,
    includes: ['Shampoo', 'Scissor architecture', 'Style coaching'],
  },
  {
    id: 'long-hair-shape',
    name: 'Long Hair Shape',
    category: 'haircut',
    durationMin: 70,
    price: 89,
    includes: ['Layer mapping', 'Texture balancing', 'Blow-dry finish'],
  },
  {
    id: 'beard-ritual',
    name: 'Beard Ritual',
    category: 'beard',
    durationMin: 30,
    price: 48,
    includes: ['Contour shaping', 'Steam towel', 'Beard oil application'],
    featured: true,
  },
  {
    id: 'razor-shave',
    name: 'Straight Razor Shave',
    category: 'beard',
    durationMin: 40,
    price: 58,
    includes: ['Pre-shave prep', 'Razor pass', 'Cooling towel'],
  },
  {
    id: 'scalp-reset',
    name: 'Scalp Reset Treatment',
    category: 'care',
    durationMin: 35,
    price: 44,
    includes: ['Exfoliation', 'Hydration mask', 'Scalp massage'],
  },
  {
    id: 'skin-fade-express',
    name: 'Skin Fade Express',
    category: 'haircut',
    durationMin: 35,
    price: 52,
    includes: ['Clipper blend', 'Line-up', 'Quick finish'],
  },
  {
    id: 'buzz-detail',
    name: 'Buzz + Detail Work',
    category: 'haircut',
    durationMin: 30,
    price: 41,
    includes: ['Uniform buzz', 'Edge detailing', 'Neck clean-up'],
  },
  {
    id: 'father-son-duo',
    name: 'Father + Son Duo',
    category: 'haircut',
    durationMin: 75,
    price: 108,
    includes: ['Two cuts', 'Shared consultation', 'Style finish'],
  },
  {
    id: 'executive-groom',
    name: 'Executive Grooming Cut',
    category: 'haircut',
    durationMin: 60,
    price: 84,
    includes: ['Precision cut', 'Hot towel neck shave', 'Product styling'],
    featured: true,
  },
  {
    id: 'beard-lineup',
    name: 'Beard Line-Up',
    category: 'beard',
    durationMin: 20,
    price: 34,
    includes: ['Outline reset', 'Cheek cleanup', 'Mustache trim'],
  },
  {
    id: 'beard-color-blend',
    name: 'Beard Color Blend',
    category: 'beard',
    durationMin: 45,
    price: 66,
    includes: ['Tone match', 'Application', 'Conditioning rinse'],
  },
  {
    id: 'royal-shave',
    name: 'Royal Shave Ritual',
    category: 'beard',
    durationMin: 55,
    price: 78,
    includes: ['Face prep', 'Two-pass razor shave', 'Aftercare balm'],
    featured: true,
  },
  {
    id: 'eyebrow-detail',
    name: 'Eyebrow + Line Detail',
    category: 'beard',
    durationMin: 15,
    price: 22,
    includes: ['Brow shaping', 'Temple detail', 'Symmetry check'],
  },
  {
    id: 'hydration-therapy',
    name: 'Hydration Therapy',
    category: 'care',
    durationMin: 25,
    price: 36,
    includes: ['Steam prep', 'Hydrating mask', 'Cooling finish'],
  },
  {
    id: 'detox-steam',
    name: 'Detox Steam Session',
    category: 'care',
    durationMin: 30,
    price: 40,
    includes: ['Steam treatment', 'Pore cleanse', 'Scalp tonic'],
  },
  {
    id: 'keratin-repair',
    name: 'Keratin Repair Boost',
    category: 'care',
    durationMin: 40,
    price: 57,
    includes: ['Repair serum', 'Heat activation', 'Cuticle seal'],
  },
  {
    id: 'premium-package',
    name: 'Premium Grooming Package',
    category: 'care',
    durationMin: 90,
    price: 126,
    includes: ['Signature cut', 'Beard ritual', 'Scalp reset'],
    featured: true,
  },
];

const BARBERS: Barber[] = [
  {
    id: 'rafael-costa',
    name: 'Rafael Costa',
    title: 'Senior Barber',
    specialties: ['Skin fades', 'Crisp line work'],
    workingDays: [1, 2, 3, 4, 5, 6],
    shift: { start: '09:00', end: '18:30' },
  },
  {
    id: 'marina-almeida',
    name: 'Marina Almeida',
    title: 'Style Director',
    specialties: ['Scissor cuts', 'Long-form transformations'],
    workingDays: [2, 3, 4, 5, 6],
    shift: { start: '10:00', end: '19:00' },
  },
  {
    id: 'thiago-lopes',
    name: 'Thiago Lopes',
    title: 'Beard Specialist',
    specialties: ['Razor work', 'Beard architecture'],
    workingDays: [1, 2, 4, 5, 6],
    shift: { start: '09:30', end: '18:00' },
  },
];

const PRODUCTS: ProductItem[] = [
  { id: 'matte-clay', name: 'Matte Clay', purpose: 'Texture and hold for short cuts', price: 28, startingStock: 28 },
  { id: 'beard-elixir', name: 'Beard Elixir', purpose: 'Hydration and control for facial hair', price: 34, startingStock: 18 },
  { id: 'sea-salt-mist', name: 'Sea Salt Mist', purpose: 'Natural movement and lightweight volume', price: 22, startingStock: 34 },
  { id: 'scalp-tonic', name: 'Scalp Tonic', purpose: 'Cooling treatment between visits', price: 26, startingStock: 22 },
];

const DEFAULT_PROFILE: ClientProfile = {
  fullName: 'Guest Client',
  preferredBarberId: BARBERS[0].id,
  defaultContactMethod: 'email',
  styleNotes: '',
  loyaltyTier: 'Standard',
};

const DEFAULT_PREFERENCES: ClientPreferences = {
  reminderHours: 24,
  notifyEmail: true,
  notifySms: true,
};

const DEFAULT_SETTINGS: AppSettings = {
  onlineEnabled: true,
  checkoutPaused: false,
};

function readStorage<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function toTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function isDateInPast(date: string): boolean {
  return date < new Date().toISOString().split('T')[0];
}

function isOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function getAppointmentDuration(serviceId: string): number {
  return SERVICES.find((item) => item.id === serviceId)?.durationMin ?? 0;
}

function getCouponDiscount(subtotal: number, couponCode: string, loyaltyTier: ClientProfile['loyaltyTier']): number {
  const code = couponCode.trim().toUpperCase();
  if (code === 'FIRSTVISIT') return subtotal * 0.1;
  if (code === 'MEMBER15' && loyaltyTier !== 'Standard') return subtotal * 0.15;
  return 0;
}

export function getServices(): ServiceItem[] {
  return [...SERVICES];
}

export function getBarbers(): Barber[] {
  return [...BARBERS];
}

export function getProducts(): ProductItem[] {
  return [...PRODUCTS];
}

export function getService(serviceId: string): ServiceItem | undefined {
  return SERVICES.find((item) => item.id === serviceId);
}

export function getBarber(barberId: string): Barber | undefined {
  return BARBERS.find((item) => item.id === barberId);
}

export function listAppointments(): AppointmentRecord[] {
  return readStorage<AppointmentRecord[]>(STORAGE_KEYS.appointments, []).sort((a, b) => {
    const left = `${a.date}T${a.startTime}`;
    const right = `${b.date}T${b.startTime}`;
    return left.localeCompare(right);
  });
}

export function listOrders(): OrderRecord[] {
  return readStorage<OrderRecord[]>(STORAGE_KEYS.orders, []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getAvailableSlots(date: string, barberId: string, serviceId: string): string[] {
  if (!date || !barberId || !serviceId) return [];
  const barber = getBarber(barberId);
  const service = getService(serviceId);
  if (!barber || !service) return [];

  const day = new Date(`${date}T12:00:00`).getDay();
  if (!barber.workingDays.includes(day)) return [];

  const shiftStart = toMinutes(barber.shift.start);
  const shiftEnd = toMinutes(barber.shift.end);
  const duration = service.durationMin;
  const appointments = listAppointments().filter(
    (item) => item.date === date && item.barberId === barberId && item.status !== 'cancelled' && item.status !== 'no_show',
  );

  const slots: string[] = [];
  for (let start = shiftStart; start + duration <= shiftEnd; start += 30) {
    const end = start + duration;
    const hasConflict = appointments.some((item) =>
      isOverlap(start, end, toMinutes(item.startTime), toMinutes(item.endTime)),
    );
    if (!hasConflict) {
      slots.push(toTime(start));
    }
  }
  return slots;
}

export function createAppointment(
  payload: CreateAppointmentPayload,
): { ok: true; appointment: AppointmentRecord } | { ok: false; message: string } {
  const service = getService(payload.serviceId);
  const barber = getBarber(payload.barberId);
  if (!service || !barber) return { ok: false, message: 'Please select a valid service and barber.' };
  if (!payload.clientName.trim() || !payload.clientEmail.includes('@')) {
    return { ok: false, message: 'Please provide a valid client name and email.' };
  }
  if (isDateInPast(payload.date)) {
    return { ok: false, message: 'You cannot create appointments in the past.' };
  }

  const available = getAvailableSlots(payload.date, payload.barberId, payload.serviceId);
  if (!available.includes(payload.startTime)) {
    return { ok: false, message: 'This time is no longer available. Please choose another slot.' };
  }

  const existing = listAppointments();
  const duplicateClient = existing.some(
    (item) =>
      item.date === payload.date &&
      item.clientEmail.toLowerCase() === payload.clientEmail.toLowerCase() &&
      item.status !== 'cancelled' &&
      item.status !== 'no_show' &&
      isOverlap(
        toMinutes(payload.startTime),
        toMinutes(payload.startTime) + service.durationMin,
        toMinutes(item.startTime),
        toMinutes(item.endTime),
      ),
  );
  if (duplicateClient) {
    return { ok: false, message: 'Client already has an overlapping appointment on this date.' };
  }

  const appointment: AppointmentRecord = {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    endTime: toTime(toMinutes(payload.startTime) + service.durationMin),
    status: 'requested',
  };

  writeStorage(STORAGE_KEYS.appointments, [...existing, appointment]);
  return { ok: true, appointment };
}

export function transitionAppointment(
  appointmentId: string,
): { ok: true; appointment: AppointmentRecord } | { ok: false; message: string } {
  const appointments = listAppointments();
  const index = appointments.findIndex((item) => item.id === appointmentId);
  if (index < 0) return { ok: false, message: 'Appointment not found.' };

  const current = appointments[index];
  if (current.status === 'cancelled' || current.status === 'no_show') {
    return { ok: false, message: 'This appointment cannot be progressed.' };
  }

  const nextStatus: Record<'requested' | 'confirmed' | 'in_service' | 'completed', AppointmentStatus> = {
    requested: 'confirmed',
    confirmed: 'in_service',
    in_service: 'completed',
    completed: 'completed',
  };

  const updated: AppointmentRecord = { ...current, status: nextStatus[current.status] };
  const next = [...appointments];
  next[index] = updated;
  writeStorage(STORAGE_KEYS.appointments, next);
  return { ok: true, appointment: updated };
}

export function cancelAppointment(
  appointmentId: string,
): { ok: true; appointment: AppointmentRecord } | { ok: false; message: string } {
  const appointments = listAppointments();
  const index = appointments.findIndex((item) => item.id === appointmentId);
  if (index < 0) return { ok: false, message: 'Appointment not found.' };
  if (appointments[index].status === 'completed') {
    return { ok: false, message: 'Completed appointments cannot be cancelled.' };
  }

  const updated: AppointmentRecord = { ...appointments[index], status: 'cancelled' };
  const next = [...appointments];
  next[index] = updated;
  writeStorage(STORAGE_KEYS.appointments, next);
  return { ok: true, appointment: updated };
}

export function getInventorySnapshot(): Array<ProductItem & { available: number }> {
  const soldMap = new Map<string, number>();
  listOrders().forEach((order) => {
    order.lines.forEach((line) => {
      soldMap.set(line.productId, (soldMap.get(line.productId) ?? 0) + line.quantity);
    });
  });

  return PRODUCTS.map((product) => ({
    ...product,
    available: Math.max(0, product.startingStock - (soldMap.get(product.id) ?? 0)),
  }));
}

export function createOrder(
  payload: CreateOrderPayload,
): { ok: true; order: OrderRecord } | { ok: false; message: string } {
  const settings = getSettings();
  if (settings.checkoutPaused) {
    return { ok: false, message: 'Checkout is temporarily unavailable. Please try again shortly.' };
  }
  if (!payload.customerName.trim() || !payload.customerEmail.includes('@')) {
    return { ok: false, message: 'Customer name and a valid email are required.' };
  }
  if (!payload.items.some((item) => item.quantity > 0)) {
    return { ok: false, message: 'Add at least one product to proceed.' };
  }
  if (payload.fulfillment === 'delivery' && !payload.address.trim()) {
    return { ok: false, message: 'Delivery address is required for delivery orders.' };
  }

  const inventory = getInventorySnapshot();
  const lines: OrderLine[] = [];
  let subtotal = 0;
  for (const item of payload.items) {
    if (item.quantity <= 0) continue;
    const product = inventory.find((entry) => entry.id === item.productId);
    if (!product) return { ok: false, message: 'A product in your cart is no longer available.' };
    if (item.quantity > product.available) {
      return { ok: false, message: `${product.name} has only ${product.available} units available.` };
    }
    lines.push({ productId: product.id, quantity: item.quantity, unitPrice: product.price });
    subtotal += product.price * item.quantity;
  }

  const profile = getProfile();
  const discount = getCouponDiscount(subtotal, payload.couponCode, profile.loyaltyTier);
  const deliveryFee = payload.fulfillment === 'delivery' ? 9 : 0;
  const total = subtotal - discount + deliveryFee;

  const order: OrderRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    customerName: payload.customerName.trim(),
    customerEmail: payload.customerEmail.trim(),
    customerPhone: payload.customerPhone.trim(),
    fulfillment: payload.fulfillment,
    paymentMethod: payload.paymentMethod,
    address: payload.address.trim(),
    couponCode: payload.couponCode.trim().toUpperCase(),
    notes: payload.notes,
    lines,
    subtotal,
    discount,
    deliveryFee,
    total,
  };

  writeStorage(STORAGE_KEYS.orders, [order, ...listOrders()]);
  return { ok: true, order };
}

export function getProfile(): ClientProfile {
  return readStorage(STORAGE_KEYS.profile, DEFAULT_PROFILE);
}

export function saveProfile(profile: ClientProfile): void {
  writeStorage(STORAGE_KEYS.profile, profile);
}

export function getPreferences(): ClientPreferences {
  return readStorage(STORAGE_KEYS.preferences, DEFAULT_PREFERENCES);
}

export function savePreferences(preferences: ClientPreferences): void {
  writeStorage(STORAGE_KEYS.preferences, preferences);
}

export function getSettings(): AppSettings {
  return readStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  writeStorage(STORAGE_KEYS.settings, settings);
}

export function setDraftService(serviceId: string): void {
  localStorage.setItem(STORAGE_KEYS.serviceDraft, serviceId);
}

export function getDraftService(): string {
  return localStorage.getItem(STORAGE_KEYS.serviceDraft) ?? '';
}

export function clearDraftService(): void {
  localStorage.removeItem(STORAGE_KEYS.serviceDraft);
}

export function getDashboardSnapshot(): {
  upcoming: number;
  completedThisWeek: number;
  pendingRequests: number;
  monthlyRevenue: number;
} {
  const appointments = listAppointments();
  const orders = listOrders();
  const today = new Date().toISOString().split('T')[0];
  const monthPrefix = today.slice(0, 7);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekIso = oneWeekAgo.toISOString().split('T')[0];

  return {
    upcoming: appointments.filter(
      (item) => item.date >= today && item.status !== 'completed' && item.status !== 'cancelled' && item.status !== 'no_show',
    ).length,
    completedThisWeek: appointments.filter((item) => item.status === 'completed' && item.date >= oneWeekIso).length,
    pendingRequests: appointments.filter((item) => item.status === 'requested').length,
    monthlyRevenue: orders
      .filter((order) => order.createdAt.startsWith(monthPrefix))
      .reduce((sum, order) => sum + order.total, 0),
  };
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

export function seedDemoData(): void {
  const today = new Date();
  const isoDay = (offsetDays: number): string => {
    const value = new Date(today);
    value.setDate(value.getDate() + offsetDays);
    return value.toISOString().split('T')[0];
  };

  const demoAppointments: AppointmentRecord[] = [
    {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      clientName: 'Alex Johnson',
      clientEmail: 'alex.johnson@example.com',
      clientPhone: '+1 555 0101',
      contactMethod: 'email',
      notes: 'Low fade, textured top.',
      serviceId: 'signature-fade',
      barberId: 'rafael-costa',
      date: isoDay(1),
      startTime: '10:00',
      endTime: '10:45',
      status: 'confirmed',
    },
    {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      clientName: 'Marcus Lee',
      clientEmail: 'marcus.lee@example.com',
      clientPhone: '+1 555 0102',
      contactMethod: 'whatsapp',
      notes: 'Shape beard and line detail.',
      serviceId: 'beard-ritual',
      barberId: 'thiago-lopes',
      date: isoDay(2),
      startTime: '11:30',
      endTime: '12:00',
      status: 'requested',
    },
    {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      clientName: 'Daniel Rivera',
      clientEmail: 'daniel.rivera@example.com',
      clientPhone: '+1 555 0103',
      contactMethod: 'phone',
      notes: 'Complete package before event.',
      serviceId: 'premium-package',
      barberId: 'marina-almeida',
      date: isoDay(3),
      startTime: '15:00',
      endTime: '16:30',
      status: 'in_service',
    },
  ];

  const demoOrders: OrderRecord[] = [
    {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      customerName: 'Alex Johnson',
      customerEmail: 'alex.johnson@example.com',
      customerPhone: '+1 555 0101',
      fulfillment: 'pickup',
      paymentMethod: 'card',
      address: '',
      couponCode: 'FIRSTVISIT',
      notes: 'Will collect after appointment.',
      lines: [
        { productId: 'matte-clay', quantity: 1, unitPrice: 28 },
        { productId: 'sea-salt-mist', quantity: 1, unitPrice: 22 },
      ],
      subtotal: 50,
      discount: 5,
      deliveryFee: 0,
      total: 45,
    },
    {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      customerName: 'Marcus Lee',
      customerEmail: 'marcus.lee@example.com',
      customerPhone: '+1 555 0102',
      fulfillment: 'delivery',
      paymentMethod: 'pix',
      address: '417 Acacias Street',
      couponCode: '',
      notes: '',
      lines: [{ productId: 'beard-elixir', quantity: 2, unitPrice: 34 }],
      subtotal: 68,
      discount: 0,
      deliveryFee: 9,
      total: 77,
    },
  ];

  writeStorage(STORAGE_KEYS.appointments, demoAppointments);
  writeStorage(STORAGE_KEYS.orders, demoOrders);
  writeStorage(STORAGE_KEYS.profile, {
    fullName: 'Alex Johnson',
    preferredBarberId: 'rafael-costa',
    defaultContactMethod: 'email',
    styleNotes: 'Keep side volume low and use matte finish.',
    loyaltyTier: 'Gold',
  } satisfies ClientProfile);
  writeStorage(STORAGE_KEYS.preferences, {
    reminderHours: 24,
    notifyEmail: true,
    notifySms: true,
  } satisfies ClientPreferences);
  writeStorage(STORAGE_KEYS.settings, {
    onlineEnabled: true,
    checkoutPaused: false,
  } satisfies AppSettings);
  clearDraftService();
}
