import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { adminDb, assertDevelopmentOperation } from './firebaseAdmin';

const COLLECTIONS = ['attendees', 'groups', 'spinHistory', 'users'] as const;
const force = process.argv.includes('--force');

async function countDocuments(path: string) {
  const snapshot = await adminDb.collection(path).count().get();
  return snapshot.data().count;
}

async function deleteCollection(path: string) {
  while (true) {
    const snapshot = await adminDb.collection(path).limit(400).get();
    if (snapshot.empty) return;
    const batch = adminDb.batch();
    snapshot.docs.forEach((document) => batch.delete(document.ref));
    await batch.commit();
  }
}

async function clearData() {
  assertDevelopmentOperation('Data clearing');
  if (process.env.ALLOW_DATA_CLEAR !== 'true') {
    throw new Error('Data clearing requires ALLOW_DATA_CLEAR=true.');
  }

  const counts = await Promise.all(COLLECTIONS.map(countDocuments));
  console.log('WARNING: This will delete Firestore application data only:');
  COLLECTIONS.forEach((name, index) => console.log(`- ${counts[index]} ${name}`));
  console.log('- settings/event');
  console.log('Firebase Authentication users are not deleted by this command.');

  if (!force) {
    const prompt = readline.createInterface({ input, output });
    const answer = await prompt.question('Environment: DEVELOPMENT. Continue? [y/N] ');
    prompt.close();
    if (answer.trim().toLowerCase() !== 'y') {
      console.log('No data was deleted.');
      return;
    }
  }

  for (const collection of COLLECTIONS) await deleteCollection(collection);
  await adminDb.doc('settings/event').delete();
  console.log('Development Firestore application data cleared. Firebase Authentication users were preserved.');
}

clearData().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
