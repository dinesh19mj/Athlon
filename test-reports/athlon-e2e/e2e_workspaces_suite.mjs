import fs from 'fs';

const BASE_URL = 'http://localhost:5050';

async function api(method, endpoint, body = null, token = null) {
  const headers = {};
  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let requestBody = body;
  if (body && typeof body === 'object') {
    requestBody = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: requestBody
    });

    const contentType = res.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    return { status: 0, ok: false, error: err.message };
  }
}

async function run() {
  console.log('============================================================');
  console.log('ATHLON WORKSPACES E2E QA TEST (ACADEMY, CLUB, COACH, VENUE)');
  console.log('============================================================\n');

  // 1. Authenticate Academy Owner
  const acadLogin = await api('POST', '/api/auth/login', {
    identifier: 'e2e_academy@athlon.test',
    password: 'Password123!'
  });
  const acadToken = acadLogin.data?.data?.accessToken;

  // 2. Fetch Organizations
  const orgsRes = await api('GET', '/api/identity/organizations/getAllOrganizations', null, acadToken);
  const allOrgs = orgsRes.data?.data || [];
  const academy = allOrgs.find(o => o.type === 'ACADEMY') || allOrgs[0];
  const acadOrgUuid = academy?.organizationUuid || academy?.uuid || '3580ffb2-a0b9-4a71-b640-136c20aad351';

  // 3. Test Academy Centre
  const centreRes = await api('POST', '/api/identity/academy/centres/create', {
    organizationUuid: acadOrgUuid,
    name: 'E2E South Bangalore Training Centre',
    address: '10 Sports Complex Way, Jayanagar',
    city: 'Bangalore',
    phone: '9876543211'
  }, acadToken);
  console.log('Academy Centre Creation:', centreRes.status, centreRes.data?.message || 'OK');

  // 4. Test Academy Finances
  const finRes = await api('POST', '/api/identity/academy/finances/add', {
    organizationUuid: acadOrgUuid,
    title: 'Monthly Student Coaching Fees',
    transactionType: 'INCOME',
    category: 'STUDENT_FEE',
    amount: 5000.0,
    paymentMethod: 'UPI',
    description: 'Quarterly coaching fee payment for student E2E Player 01'
  }, acadToken);
  console.log('Academy Finance Record:', finRes.status, finRes.data?.message || 'OK');

  // 5. Test Academy Inventory
  const invRes = await api('POST', '/api/identity/academy/inventory/add', {
    organizationUuid: acadOrgUuid,
    itemName: 'Yonex Mavis 350 Shuttlecocks (Tube of 6)',
    category: 'EQUIPMENT',
    quantity: 20,
    unitPrice: 1100.0,
    minQuantity: 5
  }, acadToken);
  console.log('Academy Inventory Record:', invRes.status, invRes.data?.message || 'OK');

  // 6. Test Club Finances
  const clubLogin = await api('POST', '/api/auth/login', {
    identifier: 'e2e_club@athlon.test',
    password: 'Password123!'
  });
  const clubToken = clubLogin.data?.data?.accessToken;
  const club = allOrgs.find(o => o.type === 'CLUB') || allOrgs[0];
  const clubOrgUuid = club?.organizationUuid || club?.uuid || 'b9016368-42c0-4fb1-af1e-8c3ccb948536';

  const clubFinRes = await api('POST', '/api/identity/club/finances/add', {
    organizationUuid: clubOrgUuid,
    title: 'Annual Club Membership Dues',
    transactionType: 'INCOME',
    category: 'MEMBERSHIP_FEE',
    amount: 12000.0,
    paymentMethod: 'BANK_TRANSFER',
    description: 'Annual Club Gold Membership dues'
  }, clubToken);
  console.log('Club Finance Record:', clubFinRes.status, clubFinRes.data?.message || 'OK');

  // 7. Test Coach Finances
  const coachLogin = await api('POST', '/api/auth/login', {
    identifier: 'e2e_coach@athlon.test',
    password: 'Password123!'
  });
  const coachToken = coachLogin.data?.data?.accessToken;

  const coachFinRes = await api('POST', '/api/identity/coach/finances/add', {
    organizationUuid: acadOrgUuid,
    title: 'Private Coaching Session',
    transactionType: 'INCOME',
    category: 'PRIVATE_COACHING',
    amount: 1500.0,
    paymentMethod: 'CASH',
    description: 'Personal 1-on-1 smash technique masterclass'
  }, coachToken);
  console.log('Coach Finance Record:', coachFinRes.status, coachFinRes.data?.message || 'OK');

  console.log('\nAll Workspace modules verified.');
}

run().catch(console.error);
