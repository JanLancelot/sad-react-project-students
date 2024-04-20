import React, { useState, useRef, useEffect } from "react";
import QrScanner, { UserMediaRequestError, setQrByScan } from "react-qr-scanner";
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { getCurrentPosition } from "./locationUtils";
import { motion } from "framer-motion";

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
  const [eLatitude, setELatitude] = useState(null);
  const [eLongtitude, setELongitude] = useState(null);

  const qrRef = useRef(null);

  const handleScan = async (result) => {
    if (result) {
      const isAllowedLocation = await isInAllowedLocation();
      if (!isAllowedLocation) {
        setLocationError("You are not in the allowed location to scan this QR code.");
        return;
      }

      const currentDate = new Date().toISOString().slice(0, 10);
      const [eventId, type] = result.text.split("-");
      const meetingDocRef = doc(db, "meetings", eventId);
      const meetingDoc = await getDoc(meetingDocRef);
      if (meetingDoc.exists()) {
        const eventDateFromDoc = meetingDoc.data().date;
        if (eventDateFromDoc !== currentDate) {
          setDateError("The scanned QR code is not valid for today's date.");
          return;
        }
      } else {
        console.error("Meeting document does not exist");
      }

      setLocationError(null);
      setDateError(null);
      setScanResult(eventId);

      const currentUser = auth.currentUser;
      if (currentUser) {
        const userUid = currentUser.uid;
        try {
          const meetingDocRef = doc(db, "meetings", eventId);
          const meetingDoc = await getDoc(meetingDocRef);
          if (meetingDoc.exists()) {
            const eventNameFromDoc = meetingDoc.data().name;
            const eventDateFromDoc = meetingDoc.data().date;
            setEventName(eventNameFromDoc);
            setEventDate(eventDateFromDoc);
          } else {
            console.error("Meeting document does not exist");
          }

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
              console.log("Event added to eventsAttended and attendees arrays successfully.");
            }
          }
        } catch (error) {
          console.error("Error updating arrays:", error);
        }
      } else {
        console.error("No user is currently authenticated.");
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
      const backCamera = devices.find((device) => device.kind === "videoinput" && /back/i.test(device.label));
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

  const isInAllowedLocation = async () => {
    try {
      const currentPosition = await getCurrentPosition();
      const allowedLocations = [];

      const meetingDocRef = doc(db, "meetings", scanResult);
      const meetingDoc = await getDoc(meetingDocRef);
      if (meetingDoc.exists()) {
        const latitude = meetingDoc.data().latitude;
        const longitude = meetingDoc.data().longitude;
        setELatitude(latitude);
        setELongitude(longitude);
        console.log(eLatitude);
        console.log(eLongtitude);
        const radius = 0.1; // Hard-coded radius of 0.05
        allowedLocations.push({ latitude, longitude, radius });
      } else {
        console.error("Meeting document does not exist");
      }

      for (const location of allowedLocations) {
        const distance = calculateDistance(
          currentPosition.coords.latitude,
          currentPosition.coords.longitude,
          location.latitude,
          location.longitude
        );
        setDisplayLocation(distance);
        if (distance <= location.radius) {
          return true;
        }
      }
      return false;
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
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
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
        <div>Display Location: {displayLocation}</div>
        <div>Display latitude: {eLatitude}</div>
        <div>Display longitude: {eLongtitude}</div>

        {displayLocation && (
          <motion.p
            className="text-gray-600 text-sm mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            You are {displayLocation.toFixed(2)} km away from the allowed location.
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