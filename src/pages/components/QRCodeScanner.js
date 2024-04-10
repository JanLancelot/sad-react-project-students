import React, { useState, useRef, useEffect } from "react";
import QrScanner, { UserMediaRequestError, setQrByScan } from "react-qr-scanner";
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { getCurrentPosition } from "./locationUtils";

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [eventName, setEventName] = useState(null);
  const [cameraId, setCameraId] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [displayLocation, setDisplayLocation] = useState(null);
  const qrRef = useRef(null);

  const handleScan = async (result) => {
    if (result) {
      // Check if the user is in the allowed location
      const isAllowedLocation = await isInAllowedLocation();
      if (!isAllowedLocation) {
        setLocationError("You are not in the allowed location to scan this QR code.");
        return;
      }

      setLocationError(null);
      setScanResult(result.text);
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userUid = currentUser.uid;
        try {
          const meetingDocRef = doc(db, "meetings", result.text);
          const meetingDoc = await getDoc(meetingDocRef);
          if (meetingDoc.exists()) {
            const eventNameFromDoc = meetingDoc.data().name;
            setEventName(eventNameFromDoc);
          } else {
            console.error("Meeting document does not exist");
          }
          await updateDoc(meetingDocRef, {
            attendees: arrayUnion(userUid),
          });
          const userDocRef = doc(db, "users", userUid);
          await updateDoc(userDocRef, {
            eventsAttended: arrayUnion(result.text),
          });
          console.log("Attendees array and eventsAttended array updated successfully.");
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
      // Add your logic to check if the user is in the allowed location(s)
      // For example, check if the user is within a certain radius of a specific coordinate
      const allowedLocations = [
        { latitude: 14.828969680625077, longitude: 120.88756033960821, radius: 0.1}, // San Francisco
      ];
      for (const location of allowedLocations) {
        const distance = calculateDistance(
          currentPosition.coords.latitude,
          currentPosition.coords.longitude,
          location.latitude,
          location.longitude
        );
        setDisplayLocation(distance)
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
    const R = 6371; // Radius of the earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
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
      {locationError && (
        <div className="mt-4 bg-red-500 text-white p-4 rounded">
          <p>{locationError}</p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;