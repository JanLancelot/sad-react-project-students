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
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <div className="bg-indigo-500 rounded-full h-20 w-20 flex items-center justify-center text-white text-2xl font-bold mr-4">
              {fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {fullName}
              </h1>
              <p className="text-gray-600">User Profile</p>
            </div>
          </div>

          {eventsAttended.length > 0 && (
            <div className="bg-gray-100 rounded-lg p-6 mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <i className="fa-solid fa-calendar-check mr-2"></i> Events
                Attended
              </h2>
              <ul className="list-disc pl-6">
                {eventsAttended.map((eventName, index) => (
                  <li key={index} className="text-gray-700">
                    {eventName}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}