import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HF1 from './Layout/HF1';
import Home from './pages/Home.jsx';
import { ThemeProvider } from './components/ThemeContext.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Features from './pages/Features.jsx';
import About from './pages/About.jsx';
import HF2 from './Layout/HF2.jsx';
import Homepage2 from './pages/User.jsx';
import Profile from './pages/Profile.jsx';
import { HF3 } from './Layout/HF3.jsx';
import ChatPage from './pages/Chatpage.jsx';
import { UserProvider } from './Utils/UserContext.jsx';



const route = createBrowserRouter([
  {
    path: '/',
    element: <HF1 />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path:'/features',
        element:<Features/>
      },
      {
        path:'/about',
        element:<About/>
      },
      {
        path:'/login',
        element:<Login/>
      },
      {
        path:'/signup',
        element:<Signup/>
      }
    ]
  },
  {
    path:'/user',
    element:<HF2/>,
    children:[
      {
        path:'/user/profile',
        element:<Profile/>
      }
    ]
  },
  {
    path:'/user/chat',
    element:<HF3/>,
    children:[
      {
        index:true,
        element:<ChatPage/>
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider> 
      <UserProvider>
        <RouterProvider router={route} />
      </UserProvider>
    </ThemeProvider>
  </StrictMode>
);
