import React, { useState } from 'react';
import { addDoc, collection, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from "../../firebase";
import { useParams } from "react-router-dom";

const EvalForm = () => {

  const { eventId } = useParams();
  const currentUser = auth.currentUser;
  const userUid = currentUser.uid;



  const ratingLabels = [
    'was in-line with the DYCI Vision-Mission and core values',
    'achieved its goals/objectives (or theme)',
    'met the need of the students',
    'The committees performed their service',
    'was well-participated by uthe student',
    'The date and time was appropriate for the activity',
    'The venue was appropriate for the activity',
    'The school resources were properly managed',
    'was well organized and well planned',
    'was well attended by the participants',
  ];

  const [formData, setFormData] = useState({
    name: '',
    course: '',
    ratings: Array(10).fill(null),
    bestFeatures: '',
    suggestions: '',
    otherComments: '',
    coreValues: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? (checked ? [...prevData[name], value] : prevData[name].filter((v) => v !== value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const meetingRef = doc(db, 'meetings', eventId);
      const meetingDoc = await getDoc(meetingRef);

      const evalRef = collection(meetingRef, 'evaluations');
      await addDoc(evalRef, formData);
      // Reset form data after successful submission
      setFormData({
        name: '',
        course: '',
        ratings: Array(10).fill(null),
        bestFeatures: '',
        suggestions: '',
        otherComments: '',
        coreValues: [],
      });

      if (meetingDoc.data().checkedInUsers.includes(userUid)) {
        const userDocRef = doc(db, "users", userUid);
        await updateDoc(userDocRef, {
          eventsAttended: arrayUnion(eventId),
        });
        await updateDoc(meetingRef, {
          attendees: arrayUnion(userUid),
        });
        console.log(
          "Event added to eventsAttended and attendees arrays successfully."
        );
      }

    } catch (error) {
      console.error('Error adding evaluation:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Name of Participant"
        value={formData.name}
        onChange={handleChange}
      />
      <input
        type="text"
        name="course"
        placeholder="Course and Year"
        value={formData.course}
        onChange={handleChange}
      />
      {[...Array(10)].map((_, index) => (
        <div key={index}>
          <label>{`${index + 1}. The activity ${ratingLabels[index]}`}</label>
          {[5, 4, 3, 2, 1].map((rating) => (
            <span key={rating}>
              <input
                type="radio"
                name={`ratings[${index}]`}
                value={rating}
                checked={formData.ratings[index] === rating}
                onChange={handleChange}
              />
              {rating}
            </span>
          ))}
        </div>
      ))}
      <textarea
        name="bestFeatures"
        placeholder="A. Best features of the activity and good values promoted and inculcated."
        value={formData.bestFeatures}
        onChange={handleChange}
      />
      <textarea
        name="suggestions"
        placeholder="B. Suggestions for further improvements of the activity."
        value={formData.suggestions}
        onChange={handleChange}
      />
      <textarea
        name="otherComments"
        placeholder="C. Other comments and reaction."
        value={formData.otherComments}
        onChange={handleChange}
      />
      <div>
        <label>CORE VALUE APPLIED</label>
        <div>
          <input
            type="checkbox"
            name="coreValues"
            value="CARITAS(Charity)"
            checked={formData.coreValues.includes('CARITAS(Charity)')}
            onChange={handleChange}
          />
          CARITAS(Charity)
        </div>
        <div>
          <input
            type="checkbox"
            name="coreValues"
            value="SAPIENTIA(Wisdom)"
            checked={formData.coreValues.includes('SAPIENTIA(Wisdom)')}
            onChange={handleChange}
          />
          SAPIENTIA(Wisdom)
        </div>
        <div>
          <input
            type="checkbox"
            name="coreValues"
            value="VERITAS(Truth)"
            checked={formData.coreValues.includes('VERITAS(Truth)')}
            onChange={handleChange}
          />
          VERITAS(Truth)
        </div>
        <div>
          <input
            type="checkbox"
            name="coreValues"
            value="PATRIA(Patriotism)"
            checked={formData.coreValues.includes('PATRIA(Patriotism)')}
            onChange={handleChange}
          />
          PATRIA(Patriotism)
        </div>
        <div>
          <input
            type="checkbox"
            name="coreValues"
            value="EXCELLENTIA(Excellence)"
            checked={formData.coreValues.includes('EXCELLENTIA(Excellence)')}
            onChange={handleChange}
          />
          EXCELLENTIA(Excellence)
        </div>
        <div>
          <input
            type="checkbox"
            name="coreValues"
            value="FIDES(Faith)"
            checked={formData.coreValues.includes('FIDES(Faith)')}
            onChange={handleChange}
          />
          FIDES(Faith)
        </div>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default EvalForm;