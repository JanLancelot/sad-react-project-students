import React, { useState } from "react";
import {
  doc,
  updateDoc,
  arrayUnion,
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

const FeedbackForm = ({ eventId, userId, onFeedbackSubmitted }) => {
  const [formData, setFormData] = useState({
    question1: null,
    question2: null,
    question3: null,
    question4: null,
    question5: null,
    question6: null,
    question7: null,
    question8: null,
    question9: null,
    question10: null,
    bestFeatures: "",
    suggestionsForImprovement: "",
    otherComments: "",
    coreValues: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const meetingDocRef = doc(db, "meetings", eventId);
      const feedbackCollectionRef = collection(meetingDocRef, "feedbacks");

      // Add the user to attendees and eventsAttended arrays
      await updateDoc(meetingDocRef, {
        attendees: arrayUnion(userId),
      });

      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        eventsAttended: arrayUnion(eventId),
      });

      // Create a new feedback document in the subcollection
      await addDoc(feedbackCollectionRef, {
        ...formData,
        submittedBy: userId,
        submittedAt: Timestamp.now(),
      });

      onFeedbackSubmitted();
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Feedback Form</h1>
        <form onSubmit={handleSubmit}>
          {/* Render form fields for questions 1-10 */}
          <div className="mb-4">
            <label htmlFor="question1" className="block font-medium mb-2">
              1. The activity was in-line with the DYCI Vision-Mission and core
              values.
            </label>
            <div>
              <input
                type="radio"
                id="question1-5"
                name="question1"
                value={5}
                checked={formData.question1 === 5}
                onChange={handleChange}
              />
              <label htmlFor="question1-5" className="ml-2">
                Excellent (5)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question1-4"
                name="question1"
                value={4}
                checked={formData.question1 === 4}
                onChange={handleChange}
              />
              <label htmlFor="question1-4" className="ml-2">
                Very Good (4)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question1-3"
                name="question1"
                value={3}
                checked={formData.question1 === 3}
                onChange={handleChange}
              />
              <label htmlFor="question1-3" className="ml-2">
                Good (3)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question1-2"
                name="question1"
                value={2}
                checked={formData.question1 === 2}
                onChange={handleChange}
              />
              <label htmlFor="question1-2" className="ml-2">
                Needs Improvement (2)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question1-1"
                name="question1"
                value={1}
                checked={formData.question1 === 1}
                onChange={handleChange}
              />
              <label htmlFor="question1-1" className="ml-2">
                Poor (1)
              </label>
            </div>
          </div>

          {/* Render other form fields for questions 2-10 */}
          <div className="mb-4">
            <label htmlFor="question2" className="block font-medium mb-2">
              2. The activity achieved its goals/objectives (or theme)
            </label>
            <div>
              <input
                type="radio"
                id="question2-5"
                name="question2"
                value={5}
                checked={formData.question2 === 5}
                onChange={handleChange}
              />
              <label htmlFor="question2-5" className="ml-2">
                Excellent (5)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question2-4"
                name="question2"
                value={4}
                checked={formData.question2 === 4}
                onChange={handleChange}
              />
              <label htmlFor="question2-4" className="ml-2">
                Very Good (4)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question2-3"
                name="question2"
                value={3}
                checked={formData.question2 === 3}
                onChange={handleChange}
              />
              <label htmlFor="question2-3" className="ml-2">
                Good (3)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question2-2"
                name="question2"
                value={2}
                checked={formData.question2 === 2}
                onChange={handleChange}
              />
              <label htmlFor="question2-2" className="ml-2">
                Needs Improvement (2)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question2-1"
                name="question2"
                value={1}
                checked={formData.question2 === 1}
                onChange={handleChange}
              />
              <label htmlFor="question2-1" className="ml-2">
                Poor (1)
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="question3" className="block font-medium mb-2">
              3. The program was well organized and executed.
            </label>
            <div>
              <input
                type="radio"
                id="question3-5"
                name="question3"
                value={5}
                checked={formData.question3 === 5}
                onChange={handleChange}
              />
              <label htmlFor="question3-5" className="ml-2">
                Excellent (5)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question3-4"
                name="question3"
                value={4}
                checked={formData.question3 === 4}
                onChange={handleChange}
              />
              <label htmlFor="question3-4" className="ml-2">
                Very Good (4)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question3-3"
                name="question3"
                value={3}
                checked={formData.question3 === 3}
                onChange={handleChange}
              />
              <label htmlFor="question3-3" className="ml-2">
                Good (3)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question3-2"
                name="question3"
                value={2}
                checked={formData.question3 === 2}
                onChange={handleChange}
              />
              <label htmlFor="question3-2" className="ml-2">
                Needs Improvement (2)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question3-1"
                name="question3"
                value={1}
                checked={formData.question3 === 1}
                onChange={handleChange}
              />
              <label htmlFor="question3-1" className="ml-2">
                Poor (1)
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="question4" className="block font-medium mb-2">
              4. The speakers/facilitators were knowledgeable and effective.
            </label>
            <div>
              <input
                type="radio"
                id="question4-5"
                name="question4"
                value={5}
                checked={formData.question4 === 5}
                onChange={handleChange}
              />
              <label htmlFor="question4-5" className="ml-2">
                Excellent (5)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question4-4"
                name="question4"
                value={4}
                checked={formData.question4 === 4}
                onChange={handleChange}
              />
              <label htmlFor="question4-4" className="ml-2">
                Very Good (4)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question4-3"
                name="question4"
                value={3}
                checked={formData.question4 === 3}
                onChange={handleChange}
              />
              <label htmlFor="question4-3" className="ml-2">
                Good (3)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question4-2"
                name="question4"
                value={2}
                checked={formData.question4 === 2}
                onChange={handleChange}
              />
              <label htmlFor="question4-2" className="ml-2">
                Needs Improvement (2)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question4-1"
                name="question4"
                value={1}
                checked={formData.question4 === 1}
                onChange={handleChange}
              />
              <label htmlFor="question4-1" className="ml-2">
                Poor (1)
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="question5" className="block font-medium mb-2">
              5. The venue and facilities were conducive to learning.
            </label>
            <div>
              <input
                type="radio"
                id="question5-5"
                name="question5"
                value={5}
                checked={formData.question5 === 5}
                onChange={handleChange}
              />
              <label htmlFor="question5-5" className="ml-2">
                Excellent (5)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question5-4"
                name="question5"
                value={4}
                checked={formData.question5 === 4}
                onChange={handleChange}
              />
              <label htmlFor="question5-4" className="ml-2">
                Very Good (4)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question5-3"
                name="question5"
                value={3}
                checked={formData.question5 === 3}
                onChange={handleChange}
              />
              <label htmlFor="question5-3" className="ml-2">
                Good (3)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question5-2"
                name="question5"
                value={2}
                checked={formData.question5 === 2}
                onChange={handleChange}
              />
              <label htmlFor="question5-2" className="ml-2">
                Needs Improvement (2)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question5-1"
                name="question5"
                value={1}
                checked={formData.question5 === 1}
                onChange={handleChange}
              />
              <label htmlFor="question5-1" className="ml-2">
                Poor (1)
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="question6" className="block font-medium mb-2">
              6. The activity materials and handouts were useful and
              informative.
            </label>
            <div>
              <input
                type="radio"
                id="question6-5"
                name="question6"
                value={5}
                checked={formData.question6 === 5}
                onChange={handleChange}
              />
              <label htmlFor="question6-5" className="ml-2">
                Excellent (5)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question6-4"
                name="question6"
                value={4}
                checked={formData.question6 === 4}
                onChange={handleChange}
              />
              <label htmlFor="question6-4" className="ml-2">
                Very Good (4)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question6-3"
                name="question6"
                value={3}
                checked={formData.question6 === 3}
                onChange={handleChange}
              />
              <label htmlFor="question6-3" className="ml-2">
                Good (3)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question6-2"
                name="question6"
                value={2}
                checked={formData.question6 === 2}
                onChange={handleChange}
              />
              <label htmlFor="question6-2" className="ml-2">
                Needs Improvement (2)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question6-1"
                name="question6"
                value={1}
                checked={formData.question6 === 1}
                onChange={handleChange}
              />
              <label htmlFor="question6-1" className="ml-2">
                Poor (1)
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="question7" className="block font-medium mb-2">
              7. The time allotment was sufficient for the activities.
            </label>
            <div>
              <input
                type="radio"
                id="question7-5"
                name="question7"
                value={5}
                checked={formData.question7 === 5}
                onChange={handleChange}
              />
              <label htmlFor="question7-5" className="ml-2">
                Excellent (5)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question7-4"
                name="question7"
                value={4}
                checked={formData.question7 === 4}
                onChange={handleChange}
              />
              <label htmlFor="question7-4" className="ml-2">
                Very Good (4)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question7-3"
                name="question7"
                value={3}
                checked={formData.question7 === 3}
                onChange={handleChange}
              />
              <label htmlFor="question7-3" className="ml-2">
                Good (3)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question7-2"
                name="question7"
                value={2}
                checked={formData.question7 === 2}
                onChange={handleChange}
              />
              <label htmlFor="question7-2" className="ml-2">
                Needs Improvement (2)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question7-1"
                name="question7"
                value={1}
                checked={formData.question7 === 1}
                onChange={handleChange}
              />
              <label htmlFor="question7-1" className="ml-2">
                Poor (1)
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="question8" className="block font-medium mb-2">
              8. The overall organization and logistics were efficient.
            </label>
            <div>
              <input
                type="radio"
                id="question8-5"
                name="question8"
                value={5}
                checked={formData.question8 === 5}
                onChange={handleChange}
              />
              <label htmlFor="question8-5" className="ml-2">
                Excellent (5)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question8-4"
                name="question8"
                value={4}
                checked={formData.question8 === 4}
                onChange={handleChange}
              />
              <label htmlFor="question8-4" className="ml-2">
                Very Good (4)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question8-3"
                name="question8"
                value={3}
                checked={formData.question8 === 3}
                onChange={handleChange}
              />
              <label htmlFor="question8-3" className="ml-2">
                Good (3)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question8-2"
                name="question8"
                value={2}
                checked={formData.question8 === 2}
                onChange={handleChange}
              />
              <label htmlFor="question8-2" className="ml-2">
                Needs Improvement (2)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question8-1"
                name="question8"
                value={1}
                checked={formData.question8 === 1}
                onChange={handleChange}
              />
              <label htmlFor="question8-1" className="ml-2">
                Poor (1)
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="question9" className="block font-medium mb-2">
              9. The activity met my expectations.
            </label>
            <div>
              <input
                type="radio"
                id="question9-5"
                name="question9"
                value={5}
                checked={formData.question9 === 5}
                onChange={handleChange}
              />
              <label htmlFor="question9-5" className="ml-2">
                Excellent (5)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question9-4"
                name="question9"
                value={4}
                checked={formData.question9 === 4}
                onChange={handleChange}
              />
              <label htmlFor="question9-4" className="ml-2">
                Very Good (4)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question9-3"
                name="question9"
                value={3}
                checked={formData.question9 === 3}
                onChange={handleChange}
              />
              <label htmlFor="question9-3" className="ml-2">
                Good (3)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question9-2"
                name="question9"
                value={2}
                checked={formData.question9 === 2}
                onChange={handleChange}
              />
              <label htmlFor="question9-2" className="ml-2">
                Needs Improvement (2)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question9-1"
                name="question9"
                value={1}
                checked={formData.question9 === 1}
                onChange={handleChange}
              />
              <label htmlFor="question9-1" className="ml-2">
                Poor (1)
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="question10" className="block font-medium mb-2">
              10. I would recommend this activity to others.
            </label>
            <div>
              <input
                type="radio"
                id="question10-5"
                name="question10"
                value={5}
                checked={formData.question10 === 5}
                onChange={handleChange}
              />
              <label htmlFor="question10-5" className="ml-2">
                Excellent (5)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question10-4"
                name="question10"
                value={4}
                checked={formData.question10 === 4}
                onChange={handleChange}
              />
              <label htmlFor="question10-4" className="ml-2">
                Very Good (4)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question10-3"
                name="question10"
                value={3}
                checked={formData.question10 === 3}
                onChange={handleChange}
              />
              <label htmlFor="question10-3" className="ml-2">
                Good (3)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question10-2"
                name="question10"
                value={2}
                checked={formData.question10 === 2}
                onChange={handleChange}
              />
              <label htmlFor="question10-2" className="ml-2">
                Needs Improvement (2)
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="question10-1"
                name="question10"
                value={1}
                checked={formData.question10 === 1}
                onChange={handleChange}
              />
              <label htmlFor="question10-1" className="ml-2">
                Poor (1)
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="bestFeatures" className="block font-medium mb-2">
              A. Best features of the activity and good values promoted and
              inculcated.
            </label>
            <textarea
              id="bestFeatures"
              name="bestFeatures"
              rows="3"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.bestFeatures}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="suggestionsForImprovement"
              className="block font-medium mb-2"
            >
              B. Suggestions for further improvements of the activity.
            </label>
            <textarea
              id="suggestionsForImprovement"
              name="suggestionsForImprovement"
              rows="3"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.suggestionsForImprovement}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="otherComments" className="block font-medium mb-2">
              C. Other comments and reaction.
            </label>
            <textarea
              id="otherComments"
              name="otherComments"
              rows="3"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.otherComments}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label className="font-medium mb-2">CORE VALUE APPLIED</label>
            <div>
              <input
                type="checkbox"
                id="caritas"
                name="coreValues"
                value="CARITAS (Charity)"
                checked={formData.coreValues.includes("CARITAS (Charity)")}
                onChange={handleChange}
              />
              <label htmlFor="caritas" className="ml-2">
                CARITAS (Charity)
              </label>
            </div>
            <div>
              <input
                type="checkbox"
                id="sapientia"
                name="coreValues"
                value="SAPIENTIA (Wisdom)"
                checked={formData.coreValues.includes("SAPIENTIA (Wisdom)")}
                onChange={handleChange}
              />
              <label htmlFor="sapientia" className="ml-2">
                SAPIENTIA (Wisdom)
              </label>
            </div>
            <div>
              <input
                type="checkbox"
                id="veritas"
                name="coreValues"
                value="VERITAS (Truth)"
                checked={formData.coreValues.includes("VERITAS (Truth)")}
                onChange={handleChange}
              />
              <label htmlFor="veritas" className="ml-2">
                VERITAS (Truth)
              </label>
            </div>
            <div>
              <input
                type="checkbox"
                id="patria"
                name="coreValues"
                value="PATRIA (Patriotism)"
                checked={formData.coreValues.includes("PATRIA (Patriotism)")}
                onChange={handleChange}
              />
              <label htmlFor="patria" className="ml-2">
                PATRIA (Patriotism)
              </label>
            </div>
            <div>
              <input
                type="checkbox"
                id="excellentia"
                name="coreValues"
                value="EXCELLENTIA (Excellence)"
                checked={formData.coreValues.includes(
                  "EXCELLENTIA (Excellence)"
                )}
                onChange={handleChange}
              />
              <label htmlFor="excellentia" className="ml-2">
                EXCELLENTIA (Excellence)
              </label>
            </div>
            <div>
              <input
                type="checkbox"
                id="fides"
                name="coreValues"
                value="FIDES (Faith)"
                checked={formData.coreValues.includes("FIDES (Faith)")}
                onChange={handleChange}
              />
              <label htmlFor="fides" className="ml-2">
                FIDES (Faith)
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 transition-colors duration-300"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
