import React, { useState } from 'react';
import { FaUsers, FaBoxOpen, FaChartLine, FaClock } from 'react-icons/fa';
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FaEye, FaDownload } from 'react-icons/fa';


const data = [
    { name: 'Active', value: 70 },
    { name: 'In Hold', value: 20 },
    { name: 'Done', value: 30 },
];
const COLORS = ['#10b981', '#facc15', '#6366f1'];


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
const Account = () => {

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    return (
        <>
            <div className='flex justify-between items-center'>
                <p>
                    
                </p>
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

            <div className="flex flex-col lg:flex-row gap-6 mt-6">
                {/* Pie Chart (30%) */}
                <div className="bg-white p-6 rounded-[20px] shadow-md w-full lg:w-[40%] flex flex-col items-center justify-center">
                    <h2 className="font-semibold text-lg text-gray-700 mb-4">Service Status</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                label
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-1 w-full flex gap-2 text-[10px] text-gray-600">
                        {data.map((item, i) => (
                            <div key={i} className="flex gap-3 items-center">
                                <span
                                    className="w-3 h-3 inline-block rounded-full"
                                    style={{ backgroundColor: COLORS[i] }}
                                ></span>
                                {item.name}: {item.value}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Table (70%) */}
                <div className="bg-white p-6 rounded-[20px] shadow-md w-full lg:w-[60%]">
                    <h2 className="text-lg font-semibold mb-6 text-gray-800">Revenue by services</h2>
                    {[
                        "Tax Return Filing",
                        "NTN Registration",
                        "Company Registration",
                        "Trademark Registration",
                        "Brand Registration",
                        "NTN",
                    ].map((service, index) => (
                        <div key={index} className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700">{service}</span>
                                <span className="text-sm font-semibold text-gray-800">60,000 PKR</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white p-6 rounded-[20px] shadow-md w-full overflow-x-auto">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-semibold text-gray-800">Payment History</h2>
    <select className="border text-sm rounded-md px-3 py-1 text-gray-600">
      <option>Last Month</option>
    </select>
  </div>
  
  <table className="min-w-full text-sm text-left text-gray-700">
    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
      <tr>
        <th className="px-4 py-2">
          <input type="checkbox" />
        </th>
        <th className="px-4 py-2">Client Name</th>
        <th className="px-4 py-2">Invoice no.</th>
        <th className="px-4 py-2">Charges</th>
        <th className="px-4 py-2">Pay. Method</th>
        <th className="px-4 py-2">Branch</th>
        <th className="px-4 py-2">Service</th>
        <th className="px-4 py-2">Action buttons</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-t hover:bg-gray-50">
        <td className="px-4 py-3">
          <input type="checkbox" />
        </td>
        <td className="px-4 py-3 flex items-center gap-2">
          <div>
            <p className="font-medium ">Zara Khan</p>
            <p className="text-xs ">12345-6789012-3</p>
          </div>
        </td>
        <td className="px-4 py-3 ">INV-2231</td>
        <td className="px-4 py-3 ">20,000 <span className="text-gray-500">PKR</span></td>
        <td className="px-4 py-3  ">Bank Transfer</td>
        <td className="px-4 py-3 ">Chaburji</td>
        <td className="px-4 py-3">NTN Registration</td>
        <td className="px-4 py-3 flex gap-2">
          <button className="text-white bg-[#57123f] hover:bg-[#57123f] p-2 rounded-full">
            👁️
          </button>
          <button className="text-white bg-[#57123f] hover:bg-[#57123f] p-2 rounded-full">
            🗑️
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>

        </>
    )
}

export default Account
