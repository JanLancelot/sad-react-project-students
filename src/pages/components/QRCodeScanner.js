import React, { useState, useRef, useEffect } from "react";
import QrScanner, { UserMediaRequestError, setQrByScan } from "react-qr-scanner";
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { getCurrentPosition } from "./locationUtils";

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [eventName, setEventName] = useState(null);
  const [eventDate, setEventDate] = useState(null);
  const [cameraId, setCameraId] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [dateError, setDateError] = useState(null);
  const [displayLocation, setDisplayLocation] = useState(null);
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
          } else if (type === "checkout") {
            await updateDoc(meetingDocRef, {
              checkedOutUsers: arrayUnion(userUid),
            });

            // Only add the event to the user's eventsAttended array if they have checked in and out
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
      const allowedLocations = [
        { latitude: 14.801115573450526, longitude: 120.9216095107531, radius: 0.1 },
      ];
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
    <div className="container mx-auto p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">QR Code Scanner</h1>
      {isScannerActive && (
        <div className="border border-gray-400 rounded-md shadow-md p-4">
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
        </div>
      )}
      <button
        className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded"
        onClick={toggleScanner}
      >
        {isScannerActive ? "Stop Scanner" : "Start Scanner"}
      </button>
      {displayLocation}
      {eventName && <p className="mt-4 text-center">Event Name: {eventName}</p>}
      {eventDate && <p className="mt-2 text-center">Event Date: {eventDate}</p>}
      {locationError && (
        <div className="mt-4 bg-red-500 text-white p-4 rounded">
          <p>{locationError}</p>
        </div>
      )}
      {dateError && (
        <div className="mt-4 bg-red-500 text-white p-4 rounded">
          <p>{dateError}</p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;