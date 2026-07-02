const admin = require("firebase-admin");

const serviceAccount = require("../firebase-admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

function getDisplayName(user) {
  if (user.displayName) return user.displayName;
  if (user.email) return user.email.split("@")[0];
  return "Ronda member";
}

async function backfillUsers(nextPageToken) {
  const result = await admin.auth().listUsers(1000, nextPageToken);

  let created = 0;
  let skipped = 0;

  for (const user of result.users) {
    const ref = db.collection("users").doc(user.uid);
    const snap = await ref.get();

    if (snap.exists) {
      skipped++;
      continue;
    }

    await ref.set({
      uid: user.uid,
      email: user.email || "",
      displayName: getDisplayName(user),
      name: getDisplayName(user),
      photoURL: user.photoURL || "",
      city: "",
      points: 0,
      createdAt: user.metadata.creationTime || new Date().toISOString(),
      lastLoginAt: user.metadata.lastSignInTime || "",
      source: "auth_backfill",
    });

    created++;
  }

  console.log(`Page done: ${created} created, ${skipped} skipped`);

  if (result.pageToken) {
    const next = await backfillUsers(result.pageToken);
    created += next.created;
    skipped += next.skipped;
  }

  return { created, skipped };
}

backfillUsers()
  .then(({ created, skipped }) => {
    console.log("DONE");
    console.log(`${created} users created`);
    console.log(`${skipped} users skipped`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });