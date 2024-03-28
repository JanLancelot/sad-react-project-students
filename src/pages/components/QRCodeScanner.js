import React, { useState, useRef } from 'react';
import QrScanner from 'react-qr-scanner';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../../firebase';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const qrRef = useRef(null);

  const handleScan = async (result) => {
    if (result) {
      setScanResult(result.text);

      // Get the current authenticated user's UID
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userUid = currentUser.uid;

        try {
          // Update the attendees array in the meetings collection
          const meetingDocRef = doc(db, 'meetings', result.text);
          await updateDoc(meetingDocRef, {
            attendees: arrayUnion(userUid),
          });

          // Update the eventsAttended array in the users collection
          const userDocRef = doc(db, 'users', userUid);
          await updateDoc(userDocRef, {
            eventsAttended: arrayUnion(result.text),
          });

          console.log('Attendees array and eventsAttended array updated successfully.');
        } catch (error) {
          console.error('Error updating arrays:', error);
        }
      } else {
        console.error('No user is currently authenticated.');
      }
    }
  };

  const handleError = (error) => {
    console.error(error);
  };

  const toggleScanner = () => {
    setIsScannerActive(!isScannerActive);
  };

  const previewStyle = { height: 'auto', maxWidth: '100%' };

  return (
    <div className="container mx-auto p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">QR Code Scanner</h1>

      {isScannerActive && (
        <div className="border border-gray-400 rounded-md shadow-md p-4">
          <QrScanner
            ref={qrRef}
            delay={300}
            style={previewStyle}
            onError={handleError}
            onScan={handleScan}
            chooseDeviceId={(deviceIds) => deviceIds && deviceIds[0]}
          />
        </div>
      )}

      <button
        className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded"
        onClick={toggleScanner}
      >
        {isScannerActive ? 'Stop Scanner' : 'Start Scanner'}
      </button>

      {scanResult && (
        <p className="mt-4 text-center">Scanned Result: {scanResult}</p>
      )}
    </div>
  );
};

export default QRScanner;
