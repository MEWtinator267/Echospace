 import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { handleerror, handlesuccess } from '../Utils/taostify';
import { ToastContainer } from 'react-toastify';
import { useUser } from '../Utils/UserContext.jsx';

function Login() {
  const [LoginInfo, setLoginInfo] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();
  const { setUser } = useUser(); // ✅ Get setter from context

  const handlesubmit = async () => {
    const { email, password } = LoginInfo;
    if (!email || !password) {
      return handleerror(`All fields are required`);
    }

    try {
      const URL = 'http://localhost:8000/auth/login';
      const Response = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(LoginInfo)
      });

      const result = await Response.json();
      const { message, success, token, user } = result;

      if (success) {
        handlesuccess(message);

        setUser({ ...user, token });

        setTimeout(() => {
          navigate('/user/profile');
        }, 1500)
      } else {
        handleerror(message);
      }

      console.log(result);
    } catch (error) {
      handleerror("Something went wrong during login");
      console.error(error);
    }
  };

  const handlechange = (e) => {
    const { name, value } = e.target;
    setLoginInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handlesubmit();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 animate-scroll-background bg-base-200/60"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/dpki2sd5o/image/upload/v1754573098/joe-woods-4Zaq5xY5M_c-unsplash_wcuzb5.jpg')`,
          backgroundRepeat: 'repeat-y',
          backgroundSize: '100% auto',
          backgroundPosition: '0 0',
        }}
      ></div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen bg-base-200/60 flex items-center justify-center px-4">
        <div className="flex flex-col lg:flex-row w-full max-w-6xl gap-10 items-center justify-center">
          <div className="w-full lg:w-1/2">
            <div className="bg-base-100 rounded-2xl h-[520px] flex flex-col justify-center px-8 py-6">
              <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

              <div className="form-control mb-4">
                <label className="label">Email</label>
                <input
                  type="email"
                  name='email'
                  placeholder="Enter your email"
                  className="input input-bordered w-full"
                  onChange={handlechange}
                  value={LoginInfo.email}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div className="form-control mb-2">
                <label className="label">Password</label>
                <input
                  type="password"
                  name='password'
                  placeholder="Enter your password"
                  className="input input-bordered w-full"
                  onChange={handlechange}
                  value={LoginInfo.password}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div className="text-right mb-4">
                <a className="link link-hover text-sm">Forgot password?</a>
              </div>

              <button className="btn btn-neutral w-full mt-2" onClick={handlesubmit}>
                Login
              </button>

              <p className="mt-4 text-center text-sm">
                Don’t have an account?{' '}
                <Link to="/signup" className="text-primary font-semibold hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer/>
    </div>
  );
}

export default Login;
