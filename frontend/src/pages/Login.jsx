import React from 'react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { handleerror, handlesuccess } from '../Utils/taostify';
import { ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


function Login() {

  const [LoginInfo,setLoginInfo] = useState({
    email:'',
    password:''
  })

  const navigate = useNavigate();

  const handlesubmit = async() => {
  const {email, password } = LoginInfo;
  if (!email || !password) {
    return handleerror(`All fields are required`)
  }
try {
  const URL = 'http://localhost:8000/auth/login';
  const Response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(LoginInfo)
  });

  const result = await Response.json();
  const { message, success, token, user } = result;

  if (success) {
    handlesuccess(message);
    localStorage.setItem('token', token); // ✅ Correct token
    localStorage.setItem('user', JSON.stringify(user)); // ✅ Full user
    setTimeout(() => {
      navigate('/user'); // or wherever your profile/dashboard is
    }, 1500);
  } else {
    handleerror(message); // ✅ All backend errors handled here
  }

  console.log(result);
} catch (error) {
  handleerror("Something went wrong during login");
  console.error(error);
}
}


  const handlechange = (e)=>{
    const {name,value} = e.target
    console.log(name,value);
    const copyloginvalues = {...LoginInfo}
    copyloginvalues[name] = value
    setLoginInfo(copyloginvalues) 
  }
  console.log("signupinfo ->",LoginInfo);

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
      <div className="relative z-10 min-h-screen backdrop-blur-none bg-base-200/60 flex items-center justify-center px-4">
        <div className="flex flex-col lg:flex-row w-full max-w-6xl gap-10 items-center justify-center">
          <div className="w-full lg:w-1/2">
            <div className="bg-base-100 rounded-2xl h-[520px] flex flex-col justify-center px-8 py-6">
              <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

              <div className="form-control mb-4">
                <label className="label">Email</label>
                <input
                  type="email"
                  id='email'
                  name='email'
                  placeholder="Enter your email"
                  className="input input-bordered w-full"
                  onChange={handlechange}
                  value={LoginInfo.email}
                />
              </div>

              <div className="form-control mb-2">
                <label className="label">Password</label>
                <input
                  type="password"
                  id='password'
                  name='password'
                  placeholder="Enter your password"
                  className="input input-bordered w-full"
                  onChange={handlechange}
                  value={LoginInfo.password}
                />
              </div>

              <div className="text-right mb-4">
                <a className="link link-hover text-sm">Forgot password?</a>
              </div>

              <button className="btn btn-neutral w-full mt-2"
              onClick={handlesubmit}
              >Login</button>

              {/* Signup Redirect */}
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
