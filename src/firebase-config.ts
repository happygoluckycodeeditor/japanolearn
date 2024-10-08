import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLnp5i6VET-aRxafItsIwAyZQYcPoB7MA",
  authDomain: "japanolearn-b696a.firebaseapp.com",
  projectId: "japanolearn-b696a",
  storageBucket: "japanolearn-b696a.appspot.com",
  messagingSenderId: "371685326092",
  appId: "1:371685326092:web:5f6d44da5951209ea9dd29",
  measurementId: "G-1BM1J723N3"
};

// ReCAPTCHA Enterprise site key
const RECAPTCHA_ENTERPRISE_SITE_KEY = "6LfsWTYqAAAAAOYEWfzHrA0HuAkfWTBmNqcZV7hK";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app); // Initialize Firestore
const storage = getStorage(app); // Initialize Storage

// Initialize App Check with ReCAPTCHA Enterprise
initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_SITE_KEY),
});

export { auth, provider, analytics, db, app, storage };
