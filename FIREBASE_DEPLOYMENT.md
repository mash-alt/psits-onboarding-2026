# Firebase deployment

Set every value in `.env.example` in the production host. Deploy the rules before opening registration:

```powershell
npx firebase-tools deploy --only firestore:rules --project YOUR_FIREBASE_PROJECT_ID
```

The first administrator must be provisioned with the Firebase Admin SDK or Firebase Console by setting `users/{uid}.role` to `admin`. Public sign-up always creates a `student` profile; officers and administrators cannot be self-assigned from the browser.
