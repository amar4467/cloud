========================================================================
FIREBASE STUDENT PROJECT - COMPLETE RUN & DEPLOY GUIDE
========================================================================

Aim: Student Profile Manager using Firebase Cloud Services (Hosting + Firestore).
Default Configuration: COMBO 2 (Firestore Database CRUD + Hosting).

------------------------------------------------------------------------
STEP-BY-STEP: HOW TO RUN THIS ON ANOTHER MACHINE (FROM SCRATCH)
------------------------------------------------------------------------

Prerequisites on the machine:
- Node.js LTS installed (https://nodejs.org/)
- Internet access

1. Clone the repository and navigate into the folder:
   git clone https://github.com/scarletslayer2006/firebase.git
   cd firebase

2. Install dependencies:
   npm install

3. Login to your Firebase / Google Account:
   npx firebase login
   (This opens your browser to log into Google and grant CLI permissions)

4. Link this folder to your Firebase Project:
   npx firebase use --add
   -> It will show a list of your Firebase projects.
   -> Use arrow keys to select your project and hit Enter.
   -> When asked for an alias, type: default

   OR if you know your exact project ID:
   npx firebase use <YOUR_PROJECT_ID>

5. Check or update your config in public/index.html:
   Make sure line 118 of `public/index.html` has your Firebase web app config:
   apiKey, authDomain, projectId, etc.

6. Deploy to Live Firebase Hosting:
   npx firebase deploy --only hosting

   Once complete, Firebase prints your live URL:
   Hosting URL: https://<YOUR_PROJECT_ID>.web.app

7. (Optional) Run and Test locally on your machine:
   npx firebase emulators:start --only hosting
   -> Open http://127.0.0.1:5000 in your browser.

========================================================================
SUMMARY OF ALL 3 COMBOS & HOW TO SWITCH
========================================================================

------------------------------------------------------------------------
COMBO 2: FIRESTORE + HOSTING (DEFAULT ACTIVE IN THIS PROJECT)
------------------------------------------------------------------------
- Feature: Direct Add, Edit, Delete, and View students in Firestore without login.
- public/index.html: Already active and ready!
- firestore.rules: In Firebase Console -> Firestore Database -> Rules, publish:
  --------------------------------------------------
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if true;
      }
    }
  }
  --------------------------------------------------
- Command to deploy:
  npx firebase deploy --only hosting


------------------------------------------------------------------------
COMBO 1: ONLY HOSTING (PURE STATIC WEB PAGE)
------------------------------------------------------------------------
- Feature: Simple static page hosted on Firebase CDN. No database.
- public/index.html:
  Copy the complete HTML block under "COMBO 1: FULL CODE FOR ONLY HOSTING" 
  from the bottom comments of `public/index.html` and replace the file contents.
- Command to deploy:
  npx firebase deploy --only hosting


------------------------------------------------------------------------
COMBO 3: FIRESTORE + AUTH + HOSTING (GOOGLE SIGN-IN)
------------------------------------------------------------------------
- Feature: Google popup login; student profiles are tied to the logged-in user.
- public/index.html:
  Copy the complete HTML block under "COMBO 3: FULL CODE FOR FIRESTORE + AUTH + HOSTING"
  from the bottom comments of `public/index.html` and replace the file contents.
- Firebase Console:
  1. Build -> Authentication -> Sign-in method -> Enable Google.
  2. Firestore Database -> Rules tab -> Publish:
  --------------------------------------------------
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /students/{studentId} {
        allow create: if request.auth != null
          && request.resource.data.ownerUid == request.auth.uid;
        allow read, delete: if request.auth != null
          && resource.data.ownerUid == request.auth.uid;
        allow update: if request.auth != null
          && resource.data.ownerUid == request.auth.uid
          && request.resource.data.ownerUid == request.auth.uid;
      }
    }
  }
  --------------------------------------------------
- Command to deploy:
  npx firebase deploy --only hosting

========================================================================
USEFUL FIREBASE CLI COMMANDS CHEAT SHEET
========================================================================
npx firebase login             # Login to Google account
npx firebase login --reauth    # Re-login with another account
npx firebase logout            # Logout current CLI user
npx firebase projects:list     # See all projects on your Google account
npx firebase use --add         # Link local directory to a project
npx firebase use default       # Switch active project to 'default'
npx firebase deploy            # Deploy everything (Hosting + Firestore rules)
npx firebase deploy --only hosting # Deploy only the public/ folder
========================================================================
