import { createBrowserRouter, RouterProvider, Link, Navigate } from "react-router-dom";
import Signin from "./pages/Signin";
import Dashboard from "./pages/Dashboard";

import './App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Signin/>,
  },
  {
    path: '/dashboard',
    element: <Dashboard/>
  }
])

function App() {
  return (
    <RouterProvider router={router}/>
  );
}

export default App;
