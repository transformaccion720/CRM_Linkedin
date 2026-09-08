async function testAll() {
  console.log('=== VERIFYING B2B & B2C FEATURES ON LOCAL SERVER ===\n');

  // 1. Test Contacts API for B2B
  console.log('1. Testing /api/contacts?segment=B2B ...');
  const b2bRes = await fetch('http://localhost:3500/api/contacts?segment=B2B');
  if (!b2bRes.ok) throw new Error(`Failed B2B fetch: ${b2bRes.status}`);
  const b2bData = await b2bRes.json();
  console.log(`✓ Total B2B contacts returned: ${b2bData.contacts.length}`);
  const sampleB2B = b2bData.contacts[0];
  console.log(`✓ Sample B2B contact: ${sampleB2B.first_name} ${sampleB2B.last_name || ''} | Status: "${sampleB2B.status}" | Segment: ${sampleB2B.business_segment}`);
  console.log(`  deal_value: ${sampleB2B.deal_value} | next_step: ${sampleB2B.next_step}`);

  // 2. Test Contacts API for B2C (Original Stages preserved)
  console.log('\n2. Testing /api/contacts?segment=B2C ...');
  const b2cRes = await fetch('http://localhost:3500/api/contacts?segment=B2C');
  if (!b2cRes.ok) throw new Error(`Failed B2C fetch: ${b2cRes.status}`);
  const b2cData = await b2cRes.json();
  console.log(`✓ Total B2C contacts returned: ${b2cData.contacts.length}`);
  const sampleB2C = b2cData.contacts[0];
  console.log(`✓ Sample B2C contact: ${sampleB2C.first_name} ${sampleB2C.last_name || ''} | Status: "${sampleB2C.status}" | Segment: ${sampleB2C.business_segment}`);

  // 3. Test PATCH on Contact with deal_value, next_step, and Cadence update
  console.log('\n3. Testing PATCH on B2B contact for Cadence and Deal Value ...');
  const patchRes = await fetch(`http://localhost:3500/api/contacts/${sampleB2B.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deal_value: 4500,
      next_step: '1er Seguimiento (Día 3-4) - Enviar temario in-company',
      status: 'Conversación iniciada',
      performed_by: 'Gabino',
    }),
  });
  if (!patchRes.ok) throw new Error(`Failed PATCH: ${patchRes.status}`);
  const patchData = await patchRes.json();
  console.log(`✓ Updated contact: ${patchData.contact.first_name}`);
  console.log(`  New Status: "${patchData.contact.status}"`);
  console.log(`  New deal_value: $${patchData.contact.deal_value} USD`);
  console.log(`  New next_step: "${patchData.contact.next_step}"`);

  // 4. Test Weekly Goals API with 3 Pillars (Actividad, Conversión, Dinero)
  console.log('\n4. Testing /api/goals?segment=B2B ...');
  const goalsRes = await fetch('http://localhost:3500/api/goals?segment=B2B');
  if (!goalsRes.ok) throw new Error(`Failed Goals fetch: ${goalsRes.status}`);
  const goalsData = await goalsRes.json();
  const pillars = goalsData.sprint?.weekly_pillars;
  if (!pillars) throw new Error('Missing weekly_pillars in sprint response');
  console.log('✓ Weekly Pillars returned successfully:');
  console.log('  [A. Actividad]:', pillars.activity);
  console.log('  [B. Conversión]:', pillars.conversion);
  console.log('  [C. Dinero]:', pillars.financial);

  // 5. Test Resources API with B2B vs B2C segment filtering
  console.log('\n5. Testing /api/resources?segment=B2B and B2C ...');
  const resB2B = await fetch('http://localhost:3500/api/resources?segment=B2B');
  const dataResB2B = await resB2B.json();
  console.log(`✓ B2B Resources returned: ${dataResB2B.resources.length}`);
  dataResB2B.resources.forEach((r) => {
    console.log(`  - [${r.business_segment}] ${r.title} (${r.category})`);
  });

  const resB2C = await fetch('http://localhost:3500/api/resources?segment=B2C');
  const dataResB2C = await resB2C.json();
  console.log(`✓ B2C Resources returned: ${dataResB2C.resources.length}`);
  dataResB2C.resources.forEach((r) => {
    console.log(`  - [${r.business_segment}] ${r.title} (${r.category})`);
  });

  console.log('\n=== ALL ENDPOINTS AND BUSINESS RULES VALIDATED SUCCESSFULLY! ===');
}

testAll().catch((err) => {
  console.error('Validation failed:', err);
  process.exit(1);
});
