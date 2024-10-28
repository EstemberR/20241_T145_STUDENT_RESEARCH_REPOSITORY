import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACPglO2oMslerC4Mrnpz-xNpSb19EUzwI",
  authDomain: "student-research-repository.firebaseapp.com",
  projectId: "student-research-repository",
  storageBucket: "student-research-repository.appspot.com",
  messagingSenderId: "387430837730",
  appId: "1:387430837730:web:742a628911906b5b545dbb"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export default auth;