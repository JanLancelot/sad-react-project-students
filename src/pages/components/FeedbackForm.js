import React, { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  setDoc,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "./Layout";

const EvalForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    yearSection: "",
    ratings: Array(10).fill(null),
    essayAnswers: [],
    coreValues: [],
  });

  const [formConfig, setFormConfig] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    } else if (name.startsWith("essayAnswers")) {
      const essayIndex = parseInt(
        name.replace("essayAnswers[", "").replace("]", "")
      );
      setFormData((prevData) => ({
        ...prevData,
        essayAnswers: prevData.essayAnswers.map((answer, index) =>
          index === essayIndex ? value : answer
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

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userUid = currentUser.uid;
        const userDocRef = doc(db, "users", userUid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const { fullName, yearSection } = userDocSnapshot.data();
          setFormData((prevData) => ({
            ...prevData,
            fullName,
            yearSection,
          }));
        } else {
          console.log("User document does not exist");
        }
      }
    };

    const fetchFormConfig = async () => {
      try {
        const formConfigCollection = collection(db, "evaluationForms");
        const formConfigSnapshot = await getDocs(formConfigCollection);
        const formConfigData = formConfigSnapshot.docs[0].data();
        setFormConfig(formConfigData);
      } catch (error) {
        console.error("Error fetching form config:", error);
      }
    };

    fetchUserData();
    fetchFormConfig();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userUid = currentUser.uid;
        const meetingRef = doc(db, "meetings", eventId);
        const meetingDoc = await getDoc(meetingRef);

        const evalRef = collection(meetingRef, "evaluations");
        const averageRating =
          formData.ratings
            .filter((rating) => rating !== null)
            .reduce((a, b) => a + b, 0) /
          formData.ratings.filter((rating) => rating !== null).length;

        // Check if all questions are answered
        const allQuestionsAnswered = formData.ratings.every(
          (rating) => rating !== null
        );

        if (allQuestionsAnswered) {
          await setDoc(doc(evalRef, userUid), { ...formData, averageRating });

          // Reset form data after successful submission
          setFormData({
            fullName: "",
            yearSection: "",
            ratings: Array(10).fill(null),
            essayAnswers: [],
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
            navigate("/dashboard");
          }
        } else {
          alert("Please answer all questions before submitting.");
        }
      }
    } catch (error) {
      console.error("Error adding evaluation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels = formConfig ? formConfig.questions : [];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8">
        {formConfig ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <div className="mb-4">
              <input
                type="text"
                name="fullName"
                placeholder="Name of Participant"
                value={formData.fullName}
                disabled
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                name="yearSection"
                placeholder="Course and Year"
                value={formData.yearSection}
                disabled
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <b>LEGEND</b>: Excellent <b>( 5 )</b> Very Good <b>( 4 )</b> Good{" "}
              <b>( 3 )</b> Needs Improvement <b>( 2 )</b> Poor <b>( 1 )</b>
            </div>
            {ratingLabels.map((label, index) => (
              <div key={index} className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">{`${
                  index + 1
                }. ${label}`}</label>
                <div className="flex justify-between">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <span
                      key={rating}
                      className="inline-flex items-center mr-4"
                    >
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
            {formConfig.essayQuestions &&
              formConfig.essayQuestions.map((question, index) => (
                <div key={index} className="mb-4">
                  <textarea
                    name={`essayAnswers[${index}]`}
                    placeholder={question}
                    value={formData.essayAnswers[index] || ""}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              ))}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">
                CORE VALUE APPLIED
              </label>
              <div className="flex flex-wrap">
                {formConfig &&
                  formConfig.values.map((value, index) => (
                    <div key={index} className="mr-4 mb-2">
                      <input
                        type="checkbox"
                        name="coreValues"
                        value={value}
                        checked={formData.coreValues.includes(value)}
                        onChange={handleChange}
                        id={`value-${index}`}
                        className="form-checkbox h-4 w-4 text-indigo-600"
                      />
                      <label
                        htmlFor={`value-${index}`}
                        className="ml-2 text-gray-700"
                      >
                        {value}
                      </label>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        ) : (
          <div>Loading form configuration...</div>
        )}
      </div>
    </Layout>
  );
};

export default EvalForm;
