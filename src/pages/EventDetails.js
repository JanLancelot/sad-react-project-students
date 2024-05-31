import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, increment, arrayRemove } from "firebase/firestore";
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
import { toast } from "react-toastify";

export default function EventDetails() {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventDocRef = doc(db, "meetings", eventId);
        const eventDoc = await getDoc(eventDocRef);

        if (eventDoc.exists()) {
          setEventData(eventDoc.data());
        } else {
          console.error("Event not found!");
          toast.error("Event not found!");
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
        toast.error("Error fetching event details!");
      }
    };

    fetchEventData();
  }, [eventId]);

  if (!eventData) {
    return <div>Loading...</div>;
  }

  const isRegistered = eventData.registeredUsers?.includes(currentUser?.uid);
  const hasUserInterested = eventData.interestedUsers?.includes(
    currentUser?.uid
  );
  const hasUserNotInterested = eventData.notInterestedUsers?.includes(
    currentUser?.uid
  );

  const handleRSVP = async () => {
    if (!currentUser) {
      toast.info("Please log in to register.");
      return;
    }

    if (eventData.rsvpType === "default") {
      try {
        const eventDocRef = doc(db, "meetings", eventId);
        await updateDoc(eventDocRef, {
          registeredUsers: arrayUnion(currentUser.uid),
          interestedCount: increment(1),
          interestedUsers: arrayUnion(currentUser.uid),
          notInterestedUsers: arrayRemove(currentUser.uid),
        });
        toast.success("Registered successfully!");
        navigate("/calendar");
      } catch (error) {
        console.error("Error registering for event:", error);
        toast.error("Error registering for event!");
      }
    } else if (eventData.rsvpType === "custom") {
      navigate(`/events/${eventId}/register`);
    }
  };

  const handleInterested = async () => {
    if (!currentUser) {
      toast.info("Please log in to interact with events.");
      return;
    }

    if (hasUserInterested) {
      return;
    }

    try {
      const eventDocRef = doc(db, "meetings", eventId);
      await updateDoc(eventDocRef, {
        interestedCount: increment(1),
        interestedUsers: arrayUnion(currentUser.uid),
        notInterestedUsers: arrayRemove(currentUser.uid),
      });
      setEventData((prevEventData) => ({
        ...prevEventData,
        interestedCount: increment,
        interestedUsers: [
          ...prevEventData.interestedUsers,
          currentUser.uid,
        ],
        notInterestedUsers: prevEventData.notInterestedUsers.filter(
          (uid) => uid !== currentUser.uid
        ),
      }));
      toast.success("Marked as interested!");
    } catch (error) {
      console.error("Error updating interested status:", error);
      toast.error("Error updating interested status!");
    }
  };

  const handleNotInterested = async () => {
    if (!currentUser) {
      toast.info("Please log in to interact with events.");
      return;
    }

    if (hasUserNotInterested) {
      return;
    }

    try {
      const eventDocRef = doc(db, "meetings", eventId);
      await updateDoc(eventDocRef, {
        notInterestedCount: increment(1),
        notInterestedUsers: arrayUnion(currentUser.uid),
        interestedUsers: arrayRemove(currentUser.uid),
      });
      setEventData((prevEventData) => ({
        ...prevEventData,
        notInterestedCount: increment(1),
        notInterestedUsers: [
          ...prevEventData.notInterestedUsers,
          currentUser.uid,
        ],
        interestedUsers: prevEventData.interestedUsers.filter(
          (uid) => uid !== currentUser.uid
        ),
      }));
      toast.success("Marked as not interested!");
    } catch (error) {
      console.error("Error updating not interested status:", error);
      toast.error("Error updating not interested status!");
    }
  };

  const formatTime = (time) => {
    const date = new Date(`2000-01-01T${time}`);
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  function convertTo12Hour(time) {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const period = +hours < 12 ? "AM" : "PM";
    const hour = +hours % 12 || 12;
    return `${hour}:${minutes} ${period}`;
  }

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
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  Cost
                </h2>
                <p className="text-gray-500">₱{eventData.cost}</p>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  Date
                </h2>
                <p className="text-gray-500">{eventData.date}</p>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  Department
                </h2>
                <p className="text-gray-500">{eventData.department}</p>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  Time
                </h2>
                <p className="text-gray-500">
                  {convertTo12Hour(eventData.startTime)} -{" "}
                  {convertTo12Hour(eventData.endTime)}
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
            <h2 className="text-lg font-medium text-gray-900 mb-1">
              Location
            </h2>
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
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center space-x-2 w-full md:w-auto ${
                isRegistered || !currentUser ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isRegistered || !currentUser}
            >
              <span>{isRegistered ? "Registered" : "Register"}</span>
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