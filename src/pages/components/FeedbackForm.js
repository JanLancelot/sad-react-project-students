import React, { useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useParams } from "react-router-dom";

const EvalForm = () => {
  const { eventId } = useParams();
  const currentUser = auth.currentUser;
  const userUid = currentUser.uid;

  const ratingLabels = [
    "was in-line with the DYCI Vision-Mission and core values",
    "achieved its goals/objectives (or theme)",
    "met the need of the students",
    "The committees performed their service",
    "was well-participated by uthe student",
    "The date and time was appropriate for the activity",
    "The venue was appropriate for the activity",
    "The school resources were properly managed",
    "was well organized and well planned",
    "was well attended by the participants",
  ];

  const [formData, setFormData] = useState({
    name: "",
    course: "",
    ratings: Array(10).fill(null),
    bestFeatures: "",
    suggestions: "",
    otherComments: "",
    coreValues: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("ratings")) {
      const ratingIndex = parseInt(
        name.replace("ratings[", "").replace("]", "")
      );
      setFormData((prevData) => ({
        ...prevData,
        ratings: prevData.ratings.map((rating, index) =>
          index === ratingIndex ? parseInt(value) : rating
        ),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]:
          type === "checkbox"
            ? checked
              ? [...prevData[name], value]
              : prevData[name].filter((v) => v !== value)
            : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const meetingRef = doc(db, "meetings", eventId);
      const meetingDoc = await getDoc(meetingRef);

      const evalRef = collection(meetingRef, "evaluations");
      await addDoc(evalRef, formData);
      // Reset form data after successful submission
      setFormData({
        name: "",
        course: "",
        ratings: Array(10).fill(null),
        bestFeatures: "",
        suggestions: "",
        otherComments: "",
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
      console.error("Error adding evaluation:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <input
            type="text"
            name="name"
            placeholder="Name of Participant"
            value={formData.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="course"
            placeholder="Course and Year"
            value={formData.course}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        {ratingLabels.map((label, index) => (
          <div key={index} className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">{`${
              index + 1
            }. The activity ${label}`}</label>
            <div className="flex justify-between">
              {[5, 4, 3, 2, 1].map((rating) => (
                <span key={rating} className="inline-flex items-center mr-4">
                  <input
                    type="radio"
                    name={`ratings[${index}]`}
                    value={rating}
                    checked={formData.ratings[index] === rating}
                    onChange={handleChange}
                    className="form-radio h-5 w-5 text-indigo-600"
                  />
                  <span className="ml-2 text-gray-700">{rating}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
        <div className="mb-4">
          <textarea
            name="bestFeatures"
            placeholder="A. Best features of the activity and good values promoted and inculcated."
            value={formData.bestFeatures}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <textarea
            name="suggestions"
            placeholder="B. Suggestions for further improvements of the activity."
            value={formData.suggestions}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <textarea
            name="otherComments"
            placeholder="C. Other comments and reaction."
            value={formData.otherComments}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">
            CORE VALUE APPLIED
          </label>
          <div className="flex flex-wrap">
            <div className="mr-4 mb-2">
              <input
                type="checkbox"
                name="coreValues"
                value="CARITAS(Charity)"
                checked={formData.coreValues.includes("CARITAS(Charity)")}
                onChange={handleChange}
                id="caritas"
                className="form-checkbox h-4 w-4 text-indigo-600"
              />
              <label htmlFor="caritas" className="ml-2 text-gray-700">
                CARITAS(Charity)
              </label>
            </div>
            <div className="mr-4 mb-2">
              <input
                type="checkbox"
                name="coreValues"
                value="SAPIENTIA(Wisdom)"
                checked={formData.coreValues.includes("SAPIENTIA(Wisdom)")}
                onChange={handleChange}
                id="sapientia"
                className="form-checkbox h-4 w-4 text-indigo-600"
              />
              <label htmlFor="sapientia" className="ml-2 text-gray-700">
                SAPIENTIA(Wisdom)
              </label>
            </div>
            <div className="mr-4 mb-2">
              <input
                type="checkbox"
                name="coreValues"
                value="VERITAS(Truth)"
                checked={formData.coreValues.includes("VERITAS(Truth)")}
                onChange={handleChange}
                id="veritas"
                className="form-checkbox h-4 w-4 text-indigo-600"
              />
              <label htmlFor="veritas" className="ml-2 text-gray-700">
                VERITAS(Truth)
              </label>
            </div>
            <div className="mr-4 mb-2">
              <input
                type="checkbox"
                name="coreValues"
                value="PATRIA(Patriotism)"
                checked={formData.coreValues.includes("PATRIA(Patriotism)")}
                onChange={handleChange}
                id="patria"
                className="form-checkbox h-4 w-4 text-indigo-600"
              />
              <label htmlFor="patria" className="ml-2 text-gray-700">
                PATRIA(Patriotism)
              </label>
            </div>
            <div className="mr-4 mb-2">
              <input
                type="checkbox"
                name="coreValues"
                value="EXCELLENTIA(Excellence)"
                checked={formData.coreValues.includes(
                  "EXCELLENTIA(Excellence)"
                )}
                onChange={handleChange}
                id="excellentia"
                className="form-checkbox h-4 w-4 text-indigo-600"
              />
              <label htmlFor="excellentia" className="ml-2 text-gray-700">
                EXCELLENTIA(Excellence)
              </label>
            </div>
            <div className="mr-4 mb-2">
              <input
                type="checkbox"
                name="coreValues"
                value="FIDES(Faith)"
                checked={formData.coreValues.includes("FIDES(Faith)")}
                onChange={handleChange}
                id="fides"
                className="form-checkbox h-4 w-4 text-indigo-600"
              />
              <label htmlFor="fides" className="ml-2 text-gray-700">
                FIDES(Faith)
              </label>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default EvalForm;
