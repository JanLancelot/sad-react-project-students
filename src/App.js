import { createBrowserRouter, RouterProvider, Link, Navigate } from "react-router-dom";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

import './App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Signin/>,
  },
  {
    path: '/signup',
    element: <Signup/>
  },
  {
    path: '/dashboard',
    element: <Dashboard/>
  },
  {
    path: '/profile',
    element: <Profile/>
  }
])

function App() {
  return (
    <RouterProvider router={router}/>
  );
}

export default App;
