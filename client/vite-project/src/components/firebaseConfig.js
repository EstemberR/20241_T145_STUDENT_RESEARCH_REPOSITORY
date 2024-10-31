import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth';
// web app's Firebase configuration
import firebaseConfig from '../services/firebase'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export default auth;