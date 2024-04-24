import React, { useState, useRef, useEffect } from "react";
import QrScanner, {
  UserMediaRequestError,
  setQrByScan,
} from "react-qr-scanner";
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { getCurrentPosition } from "./locationUtils";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [eventName, setEventName] = useState(null);
  const [eventDate, setEventDate] = useState(null);
  const [cameraId, setCameraId] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [dateError, setDateError] = useState(null);
  const [displayLocation, setDisplayLocation] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [eventLatitude, setEventLatitude] = useState(null);
  const [eventLongitude, setEventLongitude] = useState(null);
  const qrRef = useRef(null);

  const navigate = useNavigate(); // Initialize the navigate function

  const handleScan = async (result) => {
    if (result) {
      setIsScannerActive(false); // Stop the scanner after a successful scan

      const [eventId, type] = result.text.split("-");
      const meetingDocRef = doc(db, "meetings", eventId);
      const meetingDoc = await getDoc(meetingDocRef);

      if (meetingDoc.exists()) {
        const eventData = meetingDoc.data();
        const eventDateFromDoc = eventData.date;
        const eventLatitude = eventData.latitude;
        const eventLongitude = eventData.longitude;

        const currentDate = new Date().toISOString().slice(0, 10);

        if (eventDateFromDoc !== currentDate) {
          setDateError("The scanned QR code is not valid for today's date.");
          return;
        }

        const isAllowedLocation = await isInAllowedLocation(
          eventLatitude,
          eventLongitude
        );
        if (!isAllowedLocation) {
          setLocationError(
            "You are not in the allowed location to scan this QR code."
          );
          return;
        }

        setLocationError(null);
        setDateError(null);
        setScanResult(eventId);
        setEventName(eventData.name);
        setEventDate(eventDateFromDoc);
        setEventLatitude(eventLatitude);
        setEventLongitude(eventLongitude);

        const currentUser = auth.currentUser;
        if (currentUser) {
          const userUid = currentUser.uid;
          try {
            if (type === "checkin") {
              await updateDoc(meetingDocRef, {
                checkedInUsers: arrayUnion(userUid),
              });
              setCheckedIn(true);
              setCheckedOut(false);
            } else if (type === "checkout") {
              await updateDoc(meetingDocRef, {
                checkedOutUsers: arrayUnion(userUid),
              });
              setCheckedOut(true);
              setCheckedIn(false);

              if (meetingDoc.data().checkedInUsers.includes(userUid)) {
                const userDocRef = doc(db, "users", userUid);
                await updateDoc(userDocRef, {
                  eventsAttended: arrayUnion(eventId),
                });
                await updateDoc(meetingDocRef, {
                  attendees: arrayUnion(userUid),
                });
                console.log(
                  "Event added to eventsAttended and attendees arrays successfully."
                );

                // Navigate to the /evalform/[eventid] route after successful checkout
                navigate(`/evalform/${eventId}`);
              }
            }
          } catch (error) {
            console.error("Error updating arrays:", error);
          }
        } else {
          console.error("No user is currently authenticated.");
        }
      } else {
        console.error("Meeting document does not exist");
      }
    }
  };


  const handleError = (error) => {
    console.error(error);
  };

  const toggleScanner = () => {
    setIsScannerActive(!isScannerActive);
    setScanResult(null);
    setEventName(null);
    setEventDate(null);
    setCheckedIn(false);
    setCheckedOut(false);
  };

  let devarr = "";
  const selectBackCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      devarr = devices;
      console.log(devarr);
      const backCamera = devices.find(
        (device) => device.kind === "videoinput" && /back/i.test(device.label)
      );
      if (backCamera) {
        setCameraId(backCamera.deviceId);
      } else {
        console.error("No back camera found");
      }
    } catch (err) {
      console.error("Error selecting back camera:", err);
    }
  };

  const previewStyle = {
    height: "auto",
    maxWidth: "100%",
  };

  useEffect(() => {
    const selectCamera = async () => {
      await selectBackCamera();
      setIsScannerActive(true);
    };
    selectCamera();
  }, []);

  const isInAllowedLocation = async (eventLatitude, eventLongitude) => {
    try {
      const currentPosition = await getCurrentPosition();
      const allowedLocation = {
        latitude: eventLatitude,
        longitude: eventLongitude,
        radius: 1, // Radius in kilometers
      };

      const distance = calculateDistance(
        currentPosition.coords.latitude,
        currentPosition.coords.longitude,
        allowedLocation.latitude,
        allowedLocation.longitude
      );

      setDisplayLocation(distance);
      return distance <= allowedLocation.radius;
    } catch (error) {
      console.error("Error checking location:", error);
      return false;
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">QR Code Scanner</h1>
        {isScannerActive && (
          <motion.div
            className="border border-gray-400 rounded-md shadow-md mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <QrScanner
              ref={qrRef}
              delay={300}
              style={previewStyle}
              onScan={handleScan}
              constraints={{
                video: {
                  facingMode: "environment",
                },
              }}
            />
          </motion.div>
        )}
        <motion.button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded mb-4"
          onClick={toggleScanner}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {isScannerActive ? "Stop Scanner" : "Start Scanner"}
        </motion.button>
        {displayLocation && (
          <motion.p
            className="text-gray-600 text-sm mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            You are {displayLocation.toFixed(2)} km away from the allowed
            location.
          </motion.p>
        )}
        {eventName && (
          <motion.p
            className="text-gray-700 font-medium mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Event Name: {eventName}
          </motion.p>
        )}
        {eventDate && (
          <motion.p
            className="text-gray-700 font-medium mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Event Date: {eventDate}
          </motion.p>
        )}
        {eventLatitude && eventLongitude && (
          <motion.p
            className="text-gray-700 font-medium mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Event Latitude: {eventLatitude}, Event Longitude: {eventLongitude}
          </motion.p>
        )}
        {checkedIn && (
          <motion.p
            className="text-green-500 font-medium mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            You have checked in.
          </motion.p>
        )}
        {checkedOut && (
          <motion.p
            className="text-green-500 font-medium mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            You have checked out.
          </motion.p>
        )}
        {locationError && (
          <motion.div
            className="bg-red-500 text-white p-4 rounded mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <p>{locationError}</p>
          </motion.div>
        )}
        {dateError && (
          <motion.div
            className="bg-red-500 text-white p-4 rounded mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <p>{dateError}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
