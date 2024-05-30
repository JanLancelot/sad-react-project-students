import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment, addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const RegistrationForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();


  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const eventDocRef = doc(db, "meetings", eventId);
        const eventDoc = await getDoc(eventDocRef);

        if (eventDoc.exists()) {
          const registrationFormId = eventDoc.data().registrationFormId;
          const formDocRef = doc(db, "registrationForms", registrationFormId);
          const formDoc = await getDoc(formDocRef);

          if (formDoc.exists()) {
            setFormData(formDoc.data());
          } else {
            console.error("Registration form not found!");
          }
        } else {
          console.error("Event not found!");
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
        toast.error("Error fetching registration form!");
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [eventId]);

  const handleInputChange = (questionId, value) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Update event's interestedCount and interestedUsers
      const eventDocRef = doc(db, "meetings", eventId);
      await updateDoc(eventDocRef, {
        interestedCount: increment,
        interestedUsers: arrayUnion(currentUser.uid),
      });

      await addDoc(collection(db, "registrationResponses"), {
        eventId,
        responses,
      });

      toast.success("Registration successful!");
      navigate("/calendar");
    } catch (error) {
      console.error("Error submitting registration:", error);
      toast.error("Error submitting registration!");
    }
  };

  if (loading) {
    return <div>Loading registration form...</div>;
  }

  if (!formData) {
    return <div>Registration form not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 sm:px-8 lg:px-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {formData.name}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {formData.questions.map((question, index) => (
          <div key={index}>
            <label
              htmlFor={`question-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              {question.question}
            </label>
            {question.type === "input" && (
              <input
                type="text"
                id={`question-${index}`}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                onChange={(e) =>
                  handleInputChange(question.question, e.target.value)
                }
              />
            )}
            {question.type === "essay" && (
              <textarea
                id={`question-${index}`}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                rows="3"
                onChange={(e) =>
                  handleInputChange(question.question, e.target.value)
                }
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Submit Registration
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;