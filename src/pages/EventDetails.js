import { useParams, Link } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useState, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  UserMinusIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import Layout from "./components/Layout";

export default function EventDetails() {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchEventData = async () => {
      const eventDocRef = doc(db, "meetings", eventId);
      const eventDoc = await getDoc(eventDocRef);
      if (eventDoc.exists()) {
        setEventData(eventDoc.data());
      }
    };
    fetchEventData();
  }, [eventId]);

  if (!eventData) {
    return <div>Loading...</div>;
  }

  const hasUserInterested = eventData.interestedUsers?.includes(
    currentUser?.uid
  );
  const hasUserNotInterested = eventData.notInterestedUsers?.includes(
    currentUser?.uid
  );

  const handleRSVP = () => {
    window.open(eventData.rsvpLink, "_blank");
  };

  const handleInterested = async () => {
    if (hasUserInterested || !currentUser) return;

    const eventDocRef = doc(db, "meetings", eventId);
    try {
      await updateDoc(eventDocRef, {
        interestedCount: eventData.interestedCount
          ? eventData.interestedCount + 1
          : 1,
        interestedUsers: eventData.interestedUsers
          ? [...eventData.interestedUsers, currentUser.uid]
          : [currentUser.uid],
        notInterestedUsers: eventData.notInterestedUsers
          ? eventData.notInterestedUsers.filter(
              (uid) => uid !== currentUser.uid
            )
          : [],
        notInterestedCount: eventData.notInterestedCount
          ? eventData.notInterestedCount - 1
          : 0,
      });
      setEventData((prevEventData) => ({
        ...prevEventData,
        interestedCount: prevEventData.interestedCount
          ? prevEventData.interestedCount + 1
          : 1,
        interestedUsers: prevEventData.interestedUsers
          ? [...prevEventData.interestedUsers, currentUser.uid]
          : [currentUser.uid],
        notInterestedUsers: prevEventData.notInterestedUsers
          ? prevEventData.notInterestedUsers.filter(
              (uid) => uid !== currentUser.uid
            )
          : [],
        notInterestedCount: prevEventData.notInterestedCount
          ? prevEventData.notInterestedCount - 1
          : 0,
      }));
    } catch (error) {
      console.error("Error updating interested count:", error);
    }
  };

  const handleNotInterested = async () => {
    if (hasUserNotInterested || !currentUser) return;

    const eventDocRef = doc(db, "meetings", eventId);
    try {
      await updateDoc(eventDocRef, {
        notInterestedUsers: eventData.notInterestedUsers
          ? [...eventData.notInterestedUsers, currentUser.uid]
          : [currentUser.uid],
        interestedUsers: eventData.interestedUsers
          ? eventData.interestedUsers.filter((uid) => uid !== currentUser.uid)
          : [],
        notInterestedCount: eventData.notInterestedCount
          ? eventData.notInterestedCount + 1
          : 1,
        interestedCount: eventData.interestedCount
          ? eventData.interestedCount - 1
          : 0,
      });
      setEventData((prevEventData) => ({
        ...prevEventData,
        notInterestedUsers: prevEventData.notInterestedUsers
          ? [...prevEventData.notInterestedUsers, currentUser.uid]
          : [currentUser.uid],
        interestedUsers: prevEventData.interestedUsers
          ? prevEventData.interestedUsers.filter(
              (uid) => uid !== currentUser.uid
            )
          : [],
        notInterestedCount: prevEventData.notInterestedCount
          ? prevEventData.notInterestedCount + 1
          : 1,
        interestedCount: prevEventData.interestedCount
          ? prevEventData.interestedCount - 1
          : 0,
      }));
    } catch (error) {
      console.error("Error updating not interested count:", error);
    }
  };

  const formatTime = (time) => {
    const date = new Date(`2000-01-01T${time}`);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-12 px-6 sm:px-8 lg:px-10">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {eventData.name}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {eventData.category}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <img
                src={eventData.imageUrl}
                alt={eventData.name}
                className="w-full h-64 object-cover rounded-lg shadow-lg md:h-auto"
              />
            </div>
            <div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">Cost</h2>
                <p className="text-gray-500">₱{eventData.cost}</p>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">Date</h2>
                <p className="text-gray-500">{eventData.date}</p>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  Department
                </h2>
                <p className="text-gray-500">{eventData.department}</p>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">Time</h2>
                <p className="text-gray-500">
                  {formatTime(eventData.time)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-1">
              Description
            </h2>
            <p className="text-gray-500">{eventData.description}</p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-1">Location</h2>
            <p className="text-gray-500">{eventData.location}</p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-1">
              Organizer
            </h2>
            <p className="text-gray-500">{eventData.organizer}</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
            <button
              onClick={handleRSVP}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center space-x-2 w-full md:w-auto"
            >
              <span>Register</span>
              <LinkIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleInterested}
              className={`bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md flex items-center justify-center space-x-2 w-full md:w-auto ${
                hasUserInterested || !currentUser
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={hasUserInterested || !currentUser}
            >
              <span>I'm Interested</span>
              <UserPlusIcon className="h-5 w-5" />
              {eventData.interestedCount && (
                <span className="text-gray-500">
                  ({eventData.interestedCount})
                </span>
              )}
            </button>
            <button
              onClick={handleNotInterested}
              className={`bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md flex items-center justify-center space-x-2 w-full md:w-auto ${
                hasUserNotInterested || !currentUser
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={hasUserNotInterested || !currentUser}
            >
              <span>I'm Not Interested</span>
              <UserMinusIcon className="h-5 w-5" />
              {eventData.notInterestedCount && (
                <span className="text-gray-500">
                  ({eventData.notInterestedCount})
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
