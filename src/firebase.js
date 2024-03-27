// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDI5jEgk09brbOgSt0H7dBDbyU3vWDbEQs",
  authDomain: "sad-react-project-students.firebaseapp.com",
  projectId: "sad-react-project-students",
  storageBucket: "sad-react-project-students.appspot.com",
  messagingSenderId: "983192915589",
  appId: "1:983192915589:web:785d17e0fa44fb6d7f63ec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export default app; 