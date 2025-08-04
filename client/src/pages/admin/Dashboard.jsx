import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import ServiceProcessing from '../../components/admin/ServiceProcessing';
import StatsCards from '../../components/admin/StatsCards';
import ActiveClients from '../../components/admin/ActiveClients';

const Dashboard = () => {


  return (
    <>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>
          <p className="text-gray-500">Role-based Admin Panel</p>
        </div>
        <button className='bg-[#57123f] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-all'>
          <FaPlus />
          Add New Lead
        </button>

      </div>

      <StatsCards />
      <ActiveClients />

      <ServiceProcessing />

    </>
  );
};

export default Dashboard;
