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
    // Fetch unread notifications from Firestore
    const fetchUnreadNotifications = async () => {
      if (currentUser) {
        const userId = currentUser.uid;
        const meetingsRef = collection(db, "meetings");
        const q = query(meetingsRef, where("viewedBy", "not-in", [userId]));
        const querySnapshot = await getDocs(q);
        const unreadNotifications = querySnapshot.docs
          .filter((doc) => {
            const data = doc.data();
            return !data.viewedBy || !data.viewedBy.includes(userId);
          })
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        setNotifications(unreadNotifications);
        setIsLoading(false);
      }
    };
    fetchUnreadNotifications();
  }, [db, currentUser]);

  const handleNotificationClick = async (notification) => {
    try {
      // Navigate to the event page and mark the notification as viewed
      const eventId = notification.id;
      const eventRef = doc(db, "meetings", eventId);
      await updateDoc(
        eventRef,
        {
          viewedBy: arrayUnion(currentUser.uid),
        },
        { merge: true }
      );
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
