import React from 'react';
import { useState } from 'react';
import { handleerror, handlesuccess } from '../Utils/taostify';
import { ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


function Signup() {

  const [SignupInfo,setSignupInfo] = useState({
    name:'',
    email:'',
    password:''
  })

  const navigate = useNavigate();

  const handlesubmit = async() => {
  const { name, email, password } = SignupInfo;
  if (!name || !email || !password) {
    return handleerror(`All fields are required`)
  }
  try {
    const URL = 'http://localhost:8000/auth/signup'
    const Response = await fetch(URL,{
      method:"POST",
      headers:{
        "content-type":"application/json"       
      },
      body:JSON.stringify(SignupInfo)
    });
    const result = await Response.json()
    const {message,success,error} = result
    if(success){
      handlesuccess(message)
      setTimeout(() => {
        navigate('/login')
      }, 1000);
    }else if(error){
      const details = error?.details[0].message
      handleerror(details)
    }else if(!success){
      handleerror(message)
    }
      console.log(result);
  } catch (error) {
    handleerror(error)
  }
};


  const handlechange = (e)=>{
    const {name,value} = e.target
    console.log(name,value);
    const copysignupvalues = {...SignupInfo}
    copysignupvalues[name] = value
    setSignupInfo(copysignupvalues) 
  }
  console.log("signupinfo ->",SignupInfo);
  

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 animate-scroll-background bg-base-200/60"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/dpki2sd5o/image/upload/v1754573098/joe-woods-4Zaq5xY5M_c-unsplash_wcuzb5.jpg')`,
          backgroundRepeat: 'repeat-y',
          backgroundSize: '100% auto',
          backgroundPosition: '0 0',
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen backdrop-blur-none bg-base-200/60 flex items-center justify-center px-4">
        <div className="flex flex-col lg:flex-row w-full max-w-6xl gap-10 items-center justify-center">
          <div className="w-full lg:w-1/2">
            <div className="bg-base-100 rounded-2xl h-[480px] flex flex-col justify-center px-8 py-6">
              <h2 className="text-3xl font-bold text-center mb-6">Sign Up</h2>

              <div className="form-control mb-4">
                <label className="label" htmlFor='name'>Name</label>
                <input
                  name='name'
                  id='name'
                  type="text"
                  placeholder="Enter your name"
                  className="input input-bordered w-full"
                  onChange={handlechange}
                  value={SignupInfo.name}
                />
              </div>

              <div className="form-control mb-4">
                <label className="label" htmlFor='email'>Email</label>
                <input
                  type="email"
                  id='email'
                  name='email'
                  placeholder="Enter your email"
                  className="input input-bordered w-full"
                  onChange={handlechange}
                  value={SignupInfo.email}
                />
              </div>

              <div className="form-control mb-6">
                <label className="label" htmlFor='password'>Password</label>
                <input
                  type="password"
                  id='password'
                  name='password'
                  placeholder="Enter your password"
                  className="input input-bordered w-full"
                  onChange={handlechange}
                  value={SignupInfo.password}
                />
              </div>

              <button className="btn btn-primary w-full"
              onClick={handlesubmit}
              >Create Account</button>
            </div>
          </div>
        </div>
      </div>
    <ToastContainer/>
    </div>
  );
}

export default Signup;
