import React, { useContext } from 'react';
import ThemeContext from './ThemeContext';
import { useNavigate ,Link, Links } from 'react-router-dom'

function Header() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  const navigate = useNavigate();
  
  const handlenavigation = () => {
    navigate('/');
  };

  return (
    <div className="w-full">
      <nav>
        <div className="navbar bg-base-100 shadow-sm h-32 px-4">
        <div className="navbar-start min-w-[220px]">
          <a className="text-xl font-bold cursor-pointer"
          onClick={handlenavigation}
          >EchoSpace</a>
        </div>

        {/* Center: Navigation */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 text-lg gap-3">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </div>

        {/* Right: Dropdown */}
        <div className="navbar-end mr-2">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-neutral btn-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content p-4 shadow bg-base-100 rounded-box w-56 z-10 space-y-3"
            >
              <li className="flex justify-center">
                 <Link to="/login" className="btn btn-outline btn-sm w-full">
                Login
                 </Link>
              </li>
              <li className="flex justify-center">
                <Link to="/signup" className="btn btn-outline btn-sm w-full">
                Signup
                </Link>
              </li>
              <li className="flex justify-center">
                <label className="flex items-center gap-2 cursor-pointer" htmlFor='checkbox'>
                  {/* Sun icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                  </svg>

                  <input
                    type="checkbox"
                    id='checkbox'
                    className="toggle theme-controller"
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                  />

                  {/* Moon icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </label>
              </li>
            </ul>
          </div>
        </div>
      </div>
      </nav>
    </div>
  );
}

export default Header;
