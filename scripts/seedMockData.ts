import { FieldValue, WriteBatch } from 'firebase-admin/firestore';
import { adminDb, assertDevelopmentOperation } from './firebaseAdmin';

const GROUPS = [
  ['kapre', 'Kapre'], ['sigbin', 'Sigbin'], ['aswang', 'Aswang'], ['tikbalang', 'Tikbalang'],
  ['chanak', 'Chanak'], ['shokoy', 'Shokoy'], ['manananggal', 'Manananggal'], ['duwende', 'Duwende'],
  ['mangkukulam', 'Mangkukulam'], ['sirena', 'Sirena'], ['diwata', 'Diwata'], ['otlum', 'Otlum'],
] as const;

const FIRST_NAMES = ['Alex', 'Bianca', 'Carlo', 'Dana', 'Eli', 'Faith', 'Gian', 'Hana', 'Ivan', 'Joy', 'Kai', 'Lia'];
const LAST_NAMES = ['Santos', 'Reyes', 'Cruz', 'Garcia', 'Mendoza', 'Ramos', 'Torres', 'Navarro', 'Flores', 'Castillo'];
const COURSES = ['BS Information Technology', 'BS Computer Science', 'BS Information Systems'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

function getCount() {
  const countArg = process.argv.find((arg) => arg.startsWith('--count='))?.split('=')[1]
    || process.argv[process.argv.indexOf('--count') + 1]
    || '500';
  const count = Number(countArg);
  if (!Number.isInteger(count) || count < 1 || count > 10000) {
    throw new Error('Use --count with an integer from 1 to 10000.');
  }
  return count;
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

async function commitBatches(writes: Array<(batch: WriteBatch) => void>) {
  for (let start = 0; start < writes.length; start += 450) {
    const batch = adminDb.batch();
    writes.slice(start, start + 450).forEach((write) => write(batch));
    await batch.commit();
  }
}

async function seed() {
  assertDevelopmentOperation('Mock seeding');
  if (process.env.ALLOW_MOCK_SEED !== 'true') {
    throw new Error('Mock seeding requires ALLOW_MOCK_SEED=true.');
  }

  const count = getCount();
  const now = new Date().toISOString();
  const groupWrites = GROUPS.map(([id, name]) => (batch: WriteBatch) => batch.set(adminDb.collection('groups').doc(id), {
    id, name, active: true, createdAt: now, updatedAt: now,
  }, { merge: true }));

  const settingsWrite = (batch: WriteBatch) => batch.set(adminDb.doc('settings/event'), {
    eventName: 'PSITS Acquaintance Party 2026 - Development',
    tagline: 'Synthetic development event data only',
    eventDate: '2026-10-24', registrationOpenDate: '2026-08-20', registrationCloseDate: '2026-10-20',
    earlyBirdPrice: 350, regularPrice: 450, registrationStatus: 'OPEN', currency: 'PHP',
    department: 'CCS Department', college: 'College of Computer Studies', updatedAt: now, updatedBy: 'dev-seed',
  }, { merge: true });

  await commitBatches([...groupWrites, settingsWrite]);

  const attendeeWrites = shuffle(Array.from({ length: count }, (_, index) => index)).map((index) => {
    const studentId = String(index + 100000).padStart(8, '0');
    const groupId = GROUPS[index % GROUPS.length][0];
    const registrationType = index % 3 === 0 ? 'REGULAR' : 'EARLY BIRD';
    const expectedAmount = registrationType === 'EARLY BIRD' ? 350 : 450;
    const paymentStatus = index % 7 === 0 ? 'PENDING' : index % 5 === 0 ? 'UNPAID' : 'PAID';
    const actualAmount = paymentStatus === 'PAID' ? expectedAmount : 0;
    const date = new Date(Date.UTC(2026, 7, 20 + (index % 45))).toISOString();

    return (batch: WriteBatch) => batch.set(adminDb.collection('attendees').doc(studentId), {
      id: studentId, userId: null, studentId,
      name: `${FIRST_NAMES[index % FIRST_NAMES.length]} ${LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length]} Synthetic ${index + 1}`,
      section: `BSIT-${(index % 4) + 1}${String.fromCharCode(65 + (index % 3))}`,
      year: YEARS[index % YEARS.length], course: COURSES[index % COURSES.length], registrationType,
      expectedAmount, actualAmount, datePaid: paymentStatus === 'PAID' ? date.slice(0, 10) : '', paymentStatus,
      groupId, registeredAt: date, registeredBy: 'dev-seed', updatedAt: now, updatedBy: 'dev-seed',
    }, { merge: true });
  });

  await commitBatches(attendeeWrites);
  console.log(`Seeded ${count} synthetic attendees, ${GROUPS.length} official groups, and development settings.`);
}

seed().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
