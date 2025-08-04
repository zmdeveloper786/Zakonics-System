import React from 'react';
import { FaBell, FaUserCircle } from 'react-icons/fa';

const Topbar = () => {
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
      <input
        type="text"
        placeholder="Search"
        className="border p-2 rounded w-1/3 focus:outline-none"
      />
      <div className="flex items-center gap-4">
        <FaBell className="text-gray-600" />
        <FaUserCircle className="text-gray-600 text-2xl" />
      </div>
    </header>
  );
};

export default Topbar;