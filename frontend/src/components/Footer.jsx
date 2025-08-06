import React, { useContext } from 'react';
import ThemeContext from './ThemeContext';

function Footer() {
  const { theme } = useContext(ThemeContext);

  return (
    <footer
      className={`footer sm:footer-horizontal p-10 
        ${theme === 'dark' ? 'bg-base-100 text-base-content' : 'bg-base-200 text-base-content'}`}
    >
      <aside>
        <svg
          width="50"
          height="50"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fillRule="evenodd"
          clipRule="evenodd"
          className="fill-current"
        >
          <path d="M12 0C5.37258 0 0 5.3726 0 12C0 18.6274 5.37258 24 12 24C18.6274 24 24 18.6274 24 12C24 5.3726 18.6274 0 12 0ZM16 13H13V20H11V13H8V11H11V9C11 7.89543 11.8954 7 13 7H16V9H13C12.4477 9 12 9.44772 12 10V11H16V13Z" />
        </svg>
        <p>
          ACME Industries Ltd.
          <br />
          Providing reliable tech since 1992
        </p>
      </aside>

      <nav>
        <h6 className="footer-title">Social</h6>
        <div className="grid grid-flow-col gap-4">
          {/* Twitter */}
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724 9.864 9.864 0 0 1-3.127 1.195 4.924 4.924 0 0 0-8.384 4.482A13.978 13.978 0 0 1 1.671 3.149a4.916 4.916 0 0 0 1.524 6.574 4.903 4.903 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.935 4.935 0 0 1-2.224.084 4.928 4.928 0 0 0 4.6 3.419A9.868 9.868 0 0 1 0 19.54a13.945 13.945 0 0 0 7.548 2.212c9.057 0 14.01-7.496 14.01-13.986 0-.213-.005-.425-.014-.636A10.025 10.025 0 0 0 24 4.557Z" />
            </svg>
          </a>

          {/* YouTube */}
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.03 5.804 0 12c.03 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zM9 16.5v-9l8 4.5-8 4.5z" />
            </svg>
          </a>

          {/* Facebook */}
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898v-2.89h2.54V9.797c0-2.506 1.493-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.772-1.63 1.562v1.874h2.773l-.443 2.89h-2.33V22C18.343 21.128 22 16.991 22 12z" />
            </svg>
          </a>
        </div>
      </nav>
    </footer>
  );
}

export default Footer;
