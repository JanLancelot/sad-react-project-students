import { createBrowserRouter, RouterProvider, Link, Navigate } from "react-router-dom";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Calendar from "./pages/Calendar";
import EventDetails from "./pages/EventDetails";
import { AuthProvider } from '../src/context/AuthContext';
import './App.css';

const router = createBrowserRouter([
  { path: '/', element: <Signin/> },
  { path: '/signup', element: <Signup/> },
  { path: '/dashboard', element: <Dashboard/> },
  { path: '/profile', element: <Profile/> },
  { path: '/calendar', element: <Calendar/> },
  { path: '/events/:eventId', element: <EventDetails/> }
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;