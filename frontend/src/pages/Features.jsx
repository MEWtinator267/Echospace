import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Features = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="min-h-screen bg-base-100 space-y-24 py-12">

      {/* Feature 1 - Real-time Messaging */}
      <div className="hero bg-base-200 min-h-[500px]" data-aos="fade-right">
        <div className="hero-content flex-col lg:flex-row">
          <img
            src="/assets/realtime-chat.png"
            className="max-w-sm rounded-lg shadow-2xl"
            alt="Real-time chat"
          />
          <div>
            <h1 className="text-5xl font-bold">Real-time Messaging</h1>
            <p className="py-6">
              Experience instant chat with live updates, typing indicators, and zero delays. Stay connected in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Feature 2 - Custom Themes */}
      <div className="hero bg-base-200 min-h-[500px]" data-aos="fade-left">
        <div className="hero-content flex-col-reverse lg:flex-row-reverse">
          <img
            src="https://res.cloudinary.com/dpki2sd5o/image/upload/v1754049598/Screenshot_2025-08-01_at_5.27.23_PM_c4unti.png"
            className="max-w-sm rounded-lg shadow-2xl"
            alt="Dark mode UI"
          />
          <div>
            <h1 className="text-5xl font-bold">Custom Themes</h1>
            <p className="py-6">
              Light or dark? Switch between themes anytime with one click. Your eyes will thank you.
            </p>
          </div>
        </div>
      </div>

      {/* Feature 3 - Group Chats */}
      <div className="hero bg-base-200 min-h-[500px]" data-aos="fade-right">
        <div className="hero-content flex-col lg:flex-row">
          <img
            src="/assets/group-chat.png"
            className="max-w-sm rounded-lg shadow-2xl"
            alt="Group chats"
          />
          <div>
            <h1 className="text-5xl font-bold">Group Chats</h1>
            <p className="py-6">
              Create, join, and manage groups easily. Talk with friends, classmates, or communities in a single space.
            </p>
          </div>
        </div>
      </div>

      {/* Feature 4 - File Sharing */}
      <div className="hero bg-base-200 min-h-[500px]" data-aos="fade-left">
        <div className="hero-content flex-col-reverse lg:flex-row-reverse">
          <img
            src="/assets/file-sharing.png"
            className="max-w-sm rounded-lg shadow-2xl"
            alt="File sharing"
          />
          <div>
            <h1 className="text-5xl font-bold">File Sharing</h1>
            <p className="py-6">
              Share images, voice notes, or documents with one click. Fast, secure, and simple sharing at your fingertips.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Features;
