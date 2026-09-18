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
  console.log('ATHLON MANUAL DRAW / ORGANIZER-MANAGED TOURNAMENT TEST');
  console.log('============================================================\n');

  const orgLogin = await api('POST', '/api/auth/login', {
    identifier: 'e2e_organizer@athlon.test',
    password: 'Password123!'
  });
  const orgToken = orgLogin.data?.data?.accessToken;
  const orgUser = orgLogin.data?.data?.user;
  const orgUserId = orgUser?.userId || 1;
  const orgUserUuid = orgUser?.uuid || 'b13ad96f-322a-49fc-8ee6-a2bb84b02c12';

  const orgsRes = await api('GET', '/api/identity/organizations/getAllOrganizations', null, orgToken);
  const allOrgs = orgsRes.data?.data || [];
  const organizerOrg = allOrgs.find(o => o.type === 'ORGANIZER') || allOrgs[0];
  const orgUuid = organizerOrg?.organizationUuid || organizerOrg?.uuid || '957db9e5-787e-4e3c-9b8a-b9930ecbeb58';
  const orgId = organizerOrg?.organizationId || organizerOrg?.id || 1;

  const now = new Date();
  const startDate = new Date(now.getTime() + 86400000).toISOString();
  const endDate = new Date(now.getTime() + 172800000).toISOString();

  // 1. Create Tournament
  const formData = new FormData();
  formData.append('name', 'E2E_MANUAL_KNOCKOUT_01');
  formData.append('description', 'Manual Draw Organizer Managed Championship');
  formData.append('startDate', startDate);
  formData.append('endDate', endDate);
  formData.append('registrationClosingDate', startDate);
  formData.append('organizerId', orgId.toString());
  formData.append('organizerUuid', orgUuid);
  formData.append('userId', orgUserId.toString());
  formData.append('userUuid', orgUserUuid);
  formData.append('tournamentType', 'KNOCKOUT');
  formData.append('sport', 'Tennis');
  formData.append('matchFormat', 'SINGLE');
  formData.append('visibility', 'PUBLIC');
  formData.append('status', 'PUBLISHED');
  formData.append('playersCount', '4');
  formData.append('location', 'E2E Tennis Club');

  const tournRes = await fetch(`${BASE_URL}/api/tournament/tournaments/createTournament`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${orgToken}` },
    body: formData
  });
  const tournData = await tournRes.json();
  console.log('Create Tournament Response:', JSON.stringify(tournData));
  const tourn = tournData.data;
  const tournUuid = tourn?.tournamentUuid;
  const tournId = tourn?.tournamentId;
  console.log(`Manual Tournament Created: ID=${tournId}, UUID=${tournUuid}`);

  // 2. Create Category
  const catRes = await api('POST', '/api/tournament/categories/createCategory', {
    categoryName: 'Manual Open Singles',
    sportType: 'Tennis',
    organizationId: orgId,
    organizationUuid: orgUuid,
    createdBy: orgUserId
  }, orgToken);
  const cat = catRes.data?.data;
  const catId = cat?.categoryId;
  const catUuid = cat?.categoryUuid;
  console.log(`Category Created: ID=${catId}, UUID=${catUuid}`);

  // 3. Register 4 Players
  const registered = [];
  for (let i = 1; i <= 4; i++) {
    const regRes = await api('POST', '/api/tournament/registrations/create', {
      tournamentId: tournId,
      tournamentUuid: tournUuid,
      categoryId: catId,
      categoryUuid: catUuid,
      userId: i,
      userUuid: `00000000-0000-0000-0000-00000000000${i}`,
      teamName: `Manual Player ${i}`,
      players: [{ userId: i, name: `Manual Player ${i}`, phone: `987654320${i}` }],
      paymentStatus: 'PAID',
      status: 'APPROVED'
    }, orgToken);
    const reg = regRes.data?.data;
    registered.push(reg);
    await api('POST', `/api/tournament/registrations/${reg.registrationUuid}/status?status=APPROVED&updatedBy=${orgUserId}`, null, orgToken);
  }
  console.log(`4 Manual Players registered and approved.`);

  // 4. Generate Manual Draw
  const manualDrawReq = {
    drawType: 'KNOCKOUT',
    categoryId: catId,
    pairings: [
      { teamAUuid: registered[0].registrationUuid, teamBUuid: registered[1].registrationUuid, slotIndex: 1 },
      { teamAUuid: registered[2].registrationUuid, teamBUuid: registered[3].registrationUuid, slotIndex: 2 }
    ]
  };

  const manualDrawRes = await api('POST', `/api/tournament/draws/manual/${tournUuid}`, manualDrawReq, orgToken);
  console.log('Manual Draw Generation:', manualDrawRes.status, manualDrawRes.ok ? 'SUCCESS' : JSON.stringify(manualDrawRes.data));

  // 5. Fetch Fixtures & Complete Matches
  const matchesRes = await api('GET', `/api/tournament/matches/tournament/${tournUuid}`, null, orgToken);
  const matches = matchesRes.data?.data || [];
  console.log(`Retrieved ${matches.length} matches (Expected 3 for 4 players: 2 SF, 1 Final).`);

  // Play Semifinals
  const sf = matches.filter(m => m.teamARegistrationId && m.teamBRegistrationId);
  for (let i = 0; i < sf.length; i++) {
    const m = sf[i];
    await api('POST', `/api/tournament/scores/sync?matchId=${m.uuid}`, {
      team1Score: 6,
      team2Score: 4,
      currentSet: 1,
      isCompleted: true
    }, orgToken);
    await api('POST', `/api/tournament/matches/${m.uuid}/status?status=COMPLETED&winnerRegistrationId=${m.teamARegistrationId}`, null, orgToken);
    console.log(`SF Match ${i + 1} completed.`);
  }

  // Play Final
  const finalMatchesRes = await api('GET', `/api/tournament/matches/tournament/${tournUuid}`, null, orgToken);
  const finalMatch = (finalMatchesRes.data?.data || []).find(m => m.status !== 'COMPLETED' && m.teamARegistrationId && m.teamBRegistrationId);
  if (finalMatch) {
    await api('POST', `/api/tournament/scores/sync?matchId=${finalMatch.uuid}`, {
      team1Score: 6,
      team2Score: 3,
      currentSet: 1,
      isCompleted: true
    }, orgToken);
    await api('POST', `/api/tournament/matches/${finalMatch.uuid}/status?status=COMPLETED&winnerRegistrationId=${finalMatch.teamARegistrationId}`, null, orgToken);
    console.log(`Final Match completed, Champion declared!`);
  }

  // Verify tournament completion
  const tEnd = await api('GET', `/api/tournament/tournaments/getTournamentByUuid/${tournUuid}`, null, orgToken);
  console.log(`Manual Tournament Final Status: ${tEnd.data?.data?.status}`);
}

run().catch(console.error);
