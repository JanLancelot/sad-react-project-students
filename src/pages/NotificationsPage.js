import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  doc,
  updateDoc,
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import Layout from "./components/Layout";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const db = getFirestore();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      if (currentUser) {
        const userId = currentUser.uid;
        const userDocRef = doc(db, "users", userId);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          const userDepartment = userData.department;

          const meetingsRef = collection(db, "meetings");
          const q1 = query(
            meetingsRef,
            where("viewedBy", "not-in", [userId]),
            where("department", "==", userDepartment)
          );
          const q2 = query(
            meetingsRef,
            where("viewedBy", "not-in", [userId]),
            where("department", "==", "All")
          );
          const q1Snapshot = await getDocs(q1);
          const q2Snapshot = await getDocs(q2);
          const unreadNotifications = [
            ...q1Snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })),
            ...q2Snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })),
          ].filter((notification) => {
            return !notification.viewedBy || !notification.viewedBy.includes(userId);
          });

          setNotifications(unreadNotifications);
          setIsLoading(false);
        }
      }
    };

    fetchUnreadNotifications();
  }, [db, currentUser]);

  const handleNotificationClick = async (notification) => {
    try {
      const eventId = notification.id;
      const eventRef = doc(db, "meetings", eventId);
      await updateDoc(eventRef, {
        viewedBy: arrayUnion(currentUser.uid),
      }, { merge: true });
      navigate(`/events/${eventId}`);
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h1 className="text-2xl font-bold">Notifications</h1>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <h2 className="text-lg font-medium">{notification.name}</h2>
                  <p className="text-gray-600">{notification.description}</p>
                  <p className="text-gray-500 text-sm">{notification.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
