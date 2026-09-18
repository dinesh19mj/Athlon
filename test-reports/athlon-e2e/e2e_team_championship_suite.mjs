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
  console.log('ATHLON TEAM CHAMPIONSHIP / TEAM EVENT E2E TEST');
  console.log('============================================================\n');

  // Authenticate Organizer
  const orgLogin = await api('POST', '/api/auth/login', {
    identifier: 'e2e_organizer@athlon.test',
    password: 'Password123!'
  });
  const orgToken = orgLogin.data?.data?.accessToken;
  const orgUser = orgLogin.data?.data?.user;
  const orgUserId = orgUser?.userId || orgUser?.id || 1;
  const orgUserUuid = orgUser?.uuid || orgUser?.userUuid;

  const orgsRes = await api('GET', '/api/identity/organizations/getAllOrganizations', null, orgToken);
  const allOrgs = orgsRes.data?.data || [];
  const organizerOrg = allOrgs.find(o => o.type === 'ORGANIZER') || allOrgs[0];
  const orgUuid = organizerOrg?.organizationUuid || organizerOrg?.uuid || '957db9e5-787e-4e3c-9b8a-b9930ecbeb58';
  const orgId = organizerOrg?.organizationId || organizerOrg?.id || 1;

  const now = new Date();
  const startDate = new Date(now.getTime() + 86400000).toISOString();
  const endDate = new Date(now.getTime() + 172800000).toISOString();

  const createReq = {
    name: 'E2E_TEAM_EVENT_01',
    description: 'Corporate Badminton League Team Championship',
    sport: 'Badminton',
    startDate: startDate,
    endDate: endDate,
    registrationClosingDate: startDate,
    organizerId: orgId,
    organizerUuid: orgUuid,
    userId: orgUserId,
    userUuid: orgUserUuid,
    venue: 'E2E Indoor Sports Complex',
    location: 'Bangalore',
    maxTeams: 4,
    teamRegistrationFee: 5000.0,
    playerFeeMode: 'FREE',
    auctionMode: 'NO_AUCTION',
    visibility: 'PUBLIC',
    categories: [
      { name: "Men's Singles", code: 'MS', maxPlayers: 2, displayOrder: 1, isActive: true },
      { name: "Men's Doubles", code: 'MD', maxPlayers: 4, displayOrder: 2, isActive: true },
      { name: 'Mixed Doubles', code: 'XD', maxPlayers: 4, displayOrder: 3, isActive: true }
    ],
    pools: [
      { poolName: 'Pool Alpha', maxTeams: 2 },
      { poolName: 'Pool Beta', maxTeams: 2 }
    ]
  };

  const champRes = await api('POST', '/api/tournament/team-championship/create', createReq, orgToken);
  console.log('Team Championship Creation:', champRes.status, champRes.ok ? 'SUCCESS' : JSON.stringify(champRes.data));

  if (champRes.ok) {
    const champ = champRes.data?.data;
    const champUuid = champ?.championshipUuid || champ?.uuid;
    const champId = champ?.championshipId || champ?.id;
    console.log(`Championship Created: ID=${champId}, UUID=${champUuid}`);

    // Fetch Details
    const detailRes = await api('GET', `/api/tournament/team-championship/${champUuid}`, null, orgToken);
    console.log('Fetch Championship Details:', detailRes.status, detailRes.ok ? 'SUCCESS' : JSON.stringify(detailRes.data));
  }
}

run().catch(console.error);
