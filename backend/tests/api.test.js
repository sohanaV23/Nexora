const test = require('node:test');
const assert = require('node:assert');

const BASE_URL = 'http://localhost:5000/api/v1';

test('Backend Health Check returns ONLINE with SQLite database', async () => {
  const res = await fetch(`${BASE_URL}/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'ONLINE');
  assert.strictEqual(data.database, 'SQLite (dev.db)');
});

test('Public endpoint rejects unauthenticated access to complaints', async () => {
  const res = await fetch(`${BASE_URL}/complaints`);
  assert.strictEqual(res.status, 401);
  const data = await res.json();
  assert.strictEqual(data.success, false);
  assert.strictEqual(data.error.code, 'UNAUTHORIZED');
});

test('Demo login as Super Admin returns real signed JWT token and role', async () => {
  const res = await fetch(`${BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roleKey: 'super_admin' })
  });
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.strictEqual(json.data.user.role, 'SUPER_ADMIN');
  assert.ok(json.data.token, 'Token must be present');
});

test('Super Admin can access platform overview metrics across all communities', async () => {
  // 1. Login as Super Admin
  const loginRes = await fetch(`${BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roleKey: 'super_admin' })
  });
  const { data: { token } } = await loginRes.json();

  // 2. Fetch platform overview
  const overviewRes = await fetch(`${BASE_URL}/super-admin/overview`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert.strictEqual(overviewRes.status, 200);
  const overview = await overviewRes.json();
  assert.strictEqual(overview.success, true);
  assert.strictEqual(overview.data.communities.total, 2);
  assert.ok(overview.data.platform.totalUsers >= 8);
  assert.ok(overview.data.finances.totalBilledPaise > 0);
});

test('Resident cannot access Super Admin endpoints (RBAC rejection)', async () => {
  // Login as Resident
  const loginRes = await fetch(`${BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roleKey: 'resident' })
  });
  const { data: { token } } = await loginRes.json();

  const res = await fetch(`${BASE_URL}/super-admin/overview`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert.strictEqual(res.status, 403);
  const json = await res.json();
  assert.strictEqual(json.success, false);
  assert.strictEqual(json.error.code, 'FORBIDDEN');
});

test('Dual-Ledger: Pending verification payments do NOT deduct from invoice balance', async () => {
  // Login as Tenant Priya
  const loginRes = await fetch(`${BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roleKey: 'tenant' })
  });
  const { data: { token } } = await loginRes.json();

  // Fetch rent invoice
  const invRes = await fetch(`${BASE_URL}/invoices?type=CONTRACTUAL_RENT`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data: { invoices } } = await invRes.json();
  assert.ok(invoices.length > 0);
  const rentInv = invoices[0];

  // Notice: Pending payment of ₹24,000 exists, but balancePaise MUST STILL be 2400000!
  assert.strictEqual(rentInv.amountPaise, 2400000);
  assert.strictEqual(rentInv.paidPaise, 0);
  assert.strictEqual(rentInv.balancePaise, 2400000);
});

test('Negative or zero payment amounts are strictly rejected by the server', async () => {
  const loginRes = await fetch(`${BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roleKey: 'resident' })
  });
  const { data: { token } } = await loginRes.json();

  const invRes = await fetch(`${BASE_URL}/invoices`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data: { invoices } } = await invRes.json();
  const invoice = invoices[0];

  const payRes = await fetch(`${BASE_URL}/invoices/${invoice.id}/report-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ amountPaise: -50000, paymentMethod: 'CASH' })
  });
  assert.strictEqual(payRes.status, 400);
  const payJson = await payRes.json();
  assert.strictEqual(payJson.error.code, 'INVALID_AMOUNT');
});
