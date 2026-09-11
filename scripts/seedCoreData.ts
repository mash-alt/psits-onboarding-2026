import { adminDb, assertDevelopmentOperation } from './firebaseAdmin';

const GROUPS = [
  ['kapre', 'Kapre', '#FFD93D'], ['sigbin', 'Sigbin', '#FF6B6B'],
  ['aswang', 'Aswang', '#C4B5FD'], ['tikbalang', 'Tikbalang', '#FFFDF5'],
  ['chanak', 'Chanak', '#FFD93D'], ['shokoy', 'Shokoy', '#000000'],
  ['manananggal', 'Manananggal', '#FF6B6B'], ['duwende', 'Duwende', '#C4B5FD'],
  ['mangkukulam', 'Mangkukulam', '#FFD93D'], ['sirena', 'Sirena', '#FFFDF5'],
  ['diwata', 'Diwata', '#C4B5FD'], ['otlum', 'Otlum', '#FF6B6B'],
] as const;

async function seedCoreData() {
  assertDevelopmentOperation('Core event data seeding');
  if (process.env.ALLOW_CORE_SEED !== 'true') {
    throw new Error('Core event data seeding requires ALLOW_CORE_SEED=true.');
  }

  const now = new Date().toISOString();
  const settingsRef = adminDb.doc('settings/event');
  const settings = await settingsRef.get();
  if (!settings.exists) {
    await settingsRef.set({
      eventName: 'PSITS Acquaintance Party 2026',
      tagline: 'UNLEASH THE MYTH // FORGE THE ALLIANCE // CCS SUPREMACY',
      eventDate: '2026-10-24',
      callTime: '17:00',
      venue: 'Main Auditorium',
      registrationOpenDate: '2026-08-20',
      registrationCloseDate: '2026-10-20',
      earlyBirdPrice: 350,
      regularPrice: 450,
      registrationStatus: 'OPEN',
      currency: 'PHP',
      department: 'CCS Department',
      college: 'College of Computer Studies',
      updatedAt: now,
      updatedBy: 'core-seed',
    });
    console.log('Created settings/event.');
  } else {
    console.log('Preserved existing settings/event.');
  }

  const batch = adminDb.batch();
  for (const [id, name, color] of GROUPS) {
    const ref = adminDb.collection('groups').doc(id);
    const group = await ref.get();
    if (!group.exists) {
      batch.set(ref, { id, name, color, active: true, createdAt: now, updatedAt: now });
    }
  }
  await batch.commit();
  console.log('Ensured the 12 official groups. No attendees were created.');
}

seedCoreData().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
