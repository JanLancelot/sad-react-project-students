import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import SelectMenu from "./components/SelectMenu";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [yearSection, setYearSection] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setSelectedDepartment] = useState(null);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [errors, setErrors] = useState({});

  const eventsAttended = 0;
  const fullName = firstName + " " + lastName;

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateFields();
    if (Object.keys(errors).length === 0) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const userId = userCredential.user.uid;
        const userDocRef = doc(db, "users", userId);
        const userDocData = {
          fullName,
          yearSection,
          studentNumber,
          department,
          eventsAttended,
          email
        };
        await setDoc(userDocRef, userDocData);
        navigate("/");
      } catch (error) {
        console.error("Error signing up:", error);
      }
    } else {
      setErrors(errors);
    }
  };

  const continueToAdditionalFields = (e) => {
    e.preventDefault();
    const errors = validateFields(false);
    if (Object.keys(errors).length === 0) {
      setShowAdditionalFields(true);
    } else {
      setErrors(errors);
    }
  };

  const handleDepartmentChange = (department) => {
    setSelectedDepartment(department);
  };

  const validateFields = (validateAll = true) => {
    const errors = {};

    if (validateAll || showAdditionalFields) {
      if (!firstName) errors.firstName = "First name is required";
      if (!lastName) errors.lastName = "Last name is required";
      if (!yearSection) errors.yearSection = "Year section is required";
      if (!studentNumber) errors.studentNumber = "Student number is required";
      if (!department)
        errors.selectedDepartment = "Department is required";
    }

    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";

    return errors;
  };

  return (
    <>
      <div className="h-screen flex items-center justify-center">
        <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <img
              className="mx-auto h-24 w-auto"
              src="https://dyci.edu.ph/img/DYCI.png"
              alt="DYCI LOGO"
            />
            <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Sign-up
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
            <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
              <form
                className="space-y-6"
                action="#"
                method="POST"
                onSubmit={handleSubmit}
              >
                {!showAdditionalFields ? (
                  <>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Email address
                      </label>
                      <div className="mt-2">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.email ? "ring-red-500" : "ring-gray-300"
                          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Password
                      </label>
                      <div className="mt-2">
                        <input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.password ? "ring-red-500" : "ring-gray-300"
                          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        {errors.password && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.password}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <button
                        type="button"
                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={continueToAdditionalFields}
                      >
                        Continue
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* First Name */}
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        First Name
                      </label>
                      <div className="mt-2">
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.firstName ? "ring-red-500" : "ring-gray-300"
                          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Last Name
                      </label>
                      <div className="mt-2">
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.lastName ? "ring-red-500" : "ring-gray-300"
                          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Year Section */}
                    <div>
                      <label
                        htmlFor="yearSection"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Year Section
                      </label>
                      <div className="mt-2">
                        <input
                          id="yearSection"
                          name="yearSection"
                          type="text"
                          required
                          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.yearSection ? "ring-red-500" : "ring-gray-300"
                          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}                          value={yearSection}
                          onChange={(e) => setYearSection(e.target.value)}
                        />
                        {errors.yearSection && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.yearSection}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Student Number */}
                    <div>
                      <label
                        htmlFor="studentNumber"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Student Number
                      </label>
                      <div className="mt-2">
                        <input
                          id="studentNumber"
                          name="studentNumber"
                          type="text"
                          required
                          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.studentNumber ? "ring-red-500" : "ring-gray-300"
                          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}                          value={studentNumber}
                          onChange={(e) => setStudentNumber(e.target.value)}
                        />
                        {errors.studentNumber && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.studentNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        Select Department
                      </label>
                      <SelectMenu onChange={handleDepartmentChange} />
                      {errors.selectedDepartment && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.selectedDepartment}
                        </p>
                      )}
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Sign-up
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
