import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const About = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="min-h-screen bg-base-100 px-4 md:px-16 py-12 space-y-24">

      {/* Title */}
      <div data-aos="fade-down">
        <h1 className="text-5xl font-bold text-center">About EchoSpace</h1>
        <p className="text-center mt-4 text-lg max-w-2xl mx-auto">
          Discover the story behind EchoSpace and where it's heading.
        </p>
      </div>

      {/* Section: What is EchoSpace */}
      <div className="hero bg-base-200 min-h-[500px]" data-aos="fade-right">
        <div className="hero-content flex-col lg:flex-row">
          <img
            src="/assets/chat-ui.png"
            className="max-w-sm rounded-lg shadow-2xl"
            alt="Chat UI"
          />
          <div>
            <h1 className="text-4xl font-bold">What is EchoSpace?</h1>
            <p className="py-6">
              EchoSpace is a modern, minimal chat platform built for speed and simplicity. It enables users to connect in real-time, create group chats, and share media — all within a sleek and responsive interface.
            </p>
          </div>
        </div>
      </div>

      {/* Section: Who Built It */}
      <div className="hero bg-base-200 min-h-[500px]" data-aos="fade-left">
        <div className="hero-content flex-col-reverse lg:flex-row-reverse">
          <img
            src="/assets/dev.png"
            className="max-w-sm rounded-lg shadow-2xl"
            alt="Developer"
          />
          <div>
            <h1 className="text-4xl font-bold">Who Built EchoSpace?</h1>
            <p className="py-6">
              Hi, I'm Shivam Koshyari — a full stack MERN developer building EchoSpace from scratch to master backend logic, JWT authentication, MongoDB, and secure, scalable web apps. This project is a part of my learning and growth journey.
            </p>
          </div>
        </div>
      </div>

      {/* Section: Tech Stack */}
      <div className="hero bg-base-200 min-h-[500px]" data-aos="fade-right">
        <div className="hero-content flex-col lg:flex-row">
          <img
            src="/assets/stack.png"
            className="max-w-sm rounded-lg shadow-2xl"
            alt="Tech Stack"
          />
          <div>
            <h1 className="text-4xl font-bold">Tech Stack</h1>
            <ul className="list-disc list-inside py-6 space-y-2 text-lg">
              <li>React + TailwindCSS + DaisyUI</li>
              <li>Node.js + Express.js</li>
              <li>MongoDB + Mongoose</li>
              <li>JWT for secure authentication</li>
              <li>Coming soon: Socket.io for real-time messaging</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section: Future Goals */}
      <div className="hero bg-base-200 min-h-[500px]" data-aos="fade-left">
        <div className="hero-content flex-col-reverse lg:flex-row-reverse">
          <img
            src="/assets/roadmap.png"
            className="max-w-sm rounded-lg shadow-2xl"
            alt="Future goals"
          />
          <div>
            <h1 className="text-4xl font-bold">Where We're Heading</h1>
            <p className="py-6">
              The journey doesn’t stop here. Future updates include live typing indicators, online presence tracking, voice messages, and fully encrypted chat with Socket.io.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;
