import React, { useState } from 'react';
import { FaUsers, FaBoxOpen, FaChartLine, FaClock } from 'react-icons/fa';
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
const stats = [
  {
    title: "New Leads",
    value: "150",
    icon: <FaUsers className="text-[#57123f]" />,
    change: "8.5%",
    color: "text-green-500",
    direction: "up",
  },
  {
    title: "Services Booked",
    value: "60",
    icon: <FaBoxOpen className="text-[#57123f]" />,
    change: "1.3%",
    color: "text-green-500",
    direction: "up",
  },
  {
    title: "Total Sales",
    value: "Rs 60,000",
    icon: <FaChartLine className="text-[#57123f]" />,
    change: "1.8%",
    color: "text-green-500",
    direction: "up",
  },
  {
    title: "Pending Certificates",
    value: "20",
    icon: <FaClock className="text-[#57123f]" />,
    change: "1.8%",
    color: "text-red-500",
    direction: "down",
  },
];


const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const StatsCards = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  return (
    <>
      <div className='flex justify-between items-center'>
        <div>
          <p className="text-gray-500">Leads</p>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#57123f] focus:border-transparent"
        >
          {months.map((month, index) => (
            <option key={month} value={index}>
              {month}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md px-6 py-4 flex justify-between items-start h-32"
          >
            <div className="flex flex-col justify-between h-full w-3/4">
              <div>
                <p className="text-gray-500 text-sm font-medium truncate">{stat.title}</p>
                <h2 className="text-2xl font-bold mt-1 truncate">{stat.value}</h2>
              </div>
              <p className={`${stat.color} text-sm flex items-center`}>
                {stat.direction === "up" ? (
                  <FiArrowUpRight className="mr-1 flex-shrink-0" />
                ) : (
                  <FiArrowDownRight className="mr-1 flex-shrink-0" />
                )}
                <span className="whitespace-nowrap">{stat.change} from last month</span>
              </p>
            </div>
            <div className="bg-purple-100 text-[#57123f] p-2 rounded-full text-xl">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default StatsCards;