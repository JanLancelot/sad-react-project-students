import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Layout from "./components/Layout";
import { useState, useEffect } from "react";

export default function Profile() {
  const auth = getAuth();
  const db = getFirestore();
  const [fullName, setFullName] = useState(null);
  const [eventsAttended, setEventsAttended] = useState([]);

  useEffect(() => {
    const fetchUserData = async (uid) => {
      try {
        const userDocRef = doc(db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setFullName(userData.fullName);

          const eventsRef = collection(db, "meetings");
          const eventsQuery = query(
            eventsRef,
            where("attendees", "array-contains", uid)
          );
          const eventsSnap = await getDocs(eventsQuery);

          const eventNames = eventsSnap.docs.map((doc) => doc.data().name);
          setEventsAttended(eventNames);
        } else {
          console.log("User document not found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        setFullName(null);
        setEventsAttended([]);
      }
    });

    return unsubscribe;
  }, [db]);

  return (
    <Layout>
    <div class="container mx-auto px-4 py-8">
      {fullName && (
        <div class="bg-gradient-to-br from-sky-200 to-indigo-200 rounded-2xl shadow-xl p-6"> 
          <h1 class="text-3xl font-bold text-gray-800 mb-4">Profile</h1>
          <p class="text-lg text-gray-700">Full Name: {fullName}</p>
        </div>
      )}
  
      {eventsAttended.length > 0 && (
        <div class="bg-white rounded-2xl shadow-xl p-6 mt-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">
             <i class="fa-solid fa-calendar-check mr-2"></i> Events Attended 
          </h2>
          <ul class="list-disc ml-6">
            {eventsAttended.map((eventName, index) => (
              <li key={index} class="text-gray-700">
                {eventName}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </Layout>
  
  );
}
