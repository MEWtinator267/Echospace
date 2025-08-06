import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Home = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  


  return (
    <div>
      {/* Hero Section */}
      <div
        className="hero min-h-screen"
        style={{
          backgroundImage:
            "url(https://res.cloudinary.com/djjq6nbcn/image/upload/v1753715696/joe-woods-4Zaq5xY5M_c-unsplash_subwoy.jpg)",
        }}
      >
        <div className="hero-overlay bg-opacity-60"></div>
        <div
          className="hero-content text-neutral-content text-center"
          data-aos="zoom-in"
        >
          <div className="max-w-md">
            <h1 className="text-4xl md:text-5xl font-semibold mb-2">
              Welcome to
            </h1>
            <h2 className="text-5xl md:text-6xl font-extrabold text-primary mb-5">
              EchoSpace
            </h2>
            <p className="mb-5">
              A powerful and private real-time chatting app where you can connect,
              converse, and build communities securely.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="py-20 px-6 lg:px-24 bg-base-200">
        <h2 className="text-4xl font-bold text-center mb-12" data-aos="fade-up">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="p-6 rounded-xl bg-base-100 shadow-md" data-aos="fade-up" data-aos-delay="100">
            <h3 className="text-xl font-semibold mb-2">1. Sign Up & Log In</h3>
            <p>Create your secure account and get started within seconds.</p>
          </div>
          <div className="p-6 rounded-xl bg-base-100 shadow-md" data-aos="fade-up" data-aos-delay="200">
            <h3 className="text-xl font-semibold mb-2">2. Add People</h3>
            <p>Use unique IDs to add trusted contacts and build your network.</p>
          </div>
          <div className="p-6 rounded-xl bg-base-100 shadow-md" data-aos="fade-up" data-aos-delay="300">
            <h3 className="text-xl font-semibold mb-2">3. Start Chatting</h3>
            <p>Enjoy real-time conversations with seamless file sharing.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 lg:px-24 bg-base-100">
        <h2 className="text-4xl font-bold text-center mb-12" data-aos="fade-up">
          Features You Will Love
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-base-200 p-6 rounded-xl shadow-md" data-aos="fade-right">
            <h4 className="text-lg font-bold mb-2">Real-Time Messaging</h4>
            <p>Powered by Socket.IO for fast, fluid, and instant communication.</p>
          </div>
          <div className="bg-base-200 p-6 rounded-xl shadow-md" data-aos="fade-up">
            <h4 className="text-lg font-bold mb-2">Secure Media Uploads</h4>
            <p>Use Multer + Cloudinary to upload and manage files safely.</p>
          </div>
          <div className="bg-base-200 p-6 rounded-xl shadow-md" data-aos="fade-left">
            <h4 className="text-lg font-bold mb-2">Dark/Light Mode</h4>
            <p>Switch themes effortlessly with a beautiful and accessible UI.</p>
          </div>
        </div>
      </section>

      {/* Why EchoSpace Section */}
      <section className="py-20 px-6 lg:px-24 bg-base-300">
        <div className="text-center max-w-4xl mx-auto" data-aos="fade-up">
          <h2 className="text-4xl font-bold mb-6">Why Choose EchoSpace?</h2>
          <p className="text-lg">
            Echospace isn’t just another chat app — it’s a communication hub built for both fun and productivity. <br />
            With a secure backend and elegant UI, your experience is always fast and reliable. <br />
            Plus, it's packed with developer-friendly technologies like MERN, Socket.IO, and Tailwind. <br />
            Enjoy responsive design, real-time updates, and privacy-centered architecture. <br />
            Add people easily and start meaningful conversations right away. <br />
            And did we mention the smooth animations and dark/light theme support? <br />
            It's designed to feel good to use — day or night. <br />
            Whether you're a student, team, or just want to hang out — Echospace fits in. <br />
            Built with love, and made for connection.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
