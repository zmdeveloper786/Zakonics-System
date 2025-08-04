import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';

const clients = [
  { name: 'Ahmad Khan', service: 'NTN Registration', date: '01.05.2025 - 03.05.2025', amount: 'Rs 3500', status: 'Active', action: 'Done' },
  { name: 'Irfan Liaquat', service: 'LTD Company Registration', date: '01.05.2025 - 01.05.2025', amount: 'Rs 10,000', status: 'Active', action: 'In Hold' },
  { name: 'Adv. Kamraan', service: 'Tax Filing', date: '01.05.2025 - 01.05.2025', amount: 'Rs 2500', status: 'On Hold', action: 'Done' },
];

const ActiveClients = () => {
  return (
    <div className="bg-white p-6 mt-6 rounded-[20px] shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Active Clients</h2>
        <div className="relative inline-block">
          <select className="appearance-none border border-gray-300 text-sm rounded-md px-3 py-1 text-gray-500 bg-white pr-6 focus:outline-none focus:ring-2 focus:ring-[#57123f]">
            <option>Last 7 Days</option>
            <option>Last Month</option>
            <option>Last 3 Months</option>
            <option>All Time</option>
          </select>
          <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-500 text-sm rounded-lg">
              <th className="py-3 px-4 rounded-l-xl">Lead Name</th>
              <th className="py-3 px-4">Service Booked</th>
              <th className="py-3 px-4">Timeline</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 rounded-r-xl">Action</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, idx) => (
              <tr key={idx} className="border-t text-sm text-gray-700 hover:bg-gray-50">
                <td className="py-4 px-4 flex items-center gap-2 font-medium">
                  <FaUserCircle className="text-2xl text-gray-400" />
                  {client.name}
                </td>
                <td className="py-4 px-4 max-w-[160px] truncate">{client.service}</td>
                <td className="py-4 px-4">{client.date}</td>
                <td className="py-4 px-4">{client.amount}</td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${client.status === 'Active' ? 'bg-green-500 text-white' :
                      client.status === 'On Hold' ? 'bg-red-500 text-white' :
                        'bg-yellow-400 text-black'
                    }`}>
                    {client.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${client.action === 'Done' ? 'bg-green-500 text-white' :
                      'bg-yellow-400 text-black'
                    }`}>
                    {client.action}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 text-center">
        <button className="text-[#57123f] font-semibold text-sm flex items-center justify-center gap-1 mx-auto hover:underline">
          View Lead List <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default ActiveClients;
