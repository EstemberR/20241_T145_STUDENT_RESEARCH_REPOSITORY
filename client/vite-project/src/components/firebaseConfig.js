import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOgak9D5FDb0ilREXfjtAKZSGl9yP67_4",
  authDomain: "auth-project-ab2fc.firebaseapp.com",
  projectId: "auth-project-ab2fc",
  storageBucket: "auth-project-ab2fc.appspot.com",
  messagingSenderId: "866802976816",
  appId: "1:866802976816:web:8202be3af0a1a8cf88c5f5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export default auth