import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FaEye, FaDownload } from 'react-icons/fa';

const data = [
  { name: 'Active', value: 70 },
  { name: 'In Hold', value: 20 },
  { name: 'Done', value: 30 },
];
const COLORS = ['#10b981', '#facc15', '#6366f1'];

const ServiceProcessing = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-6">
      {/* Pie Chart (30%) */}
      <div className="bg-white p-6 rounded-[20px] shadow-md w-full lg:w-[30%] flex flex-col items-center justify-center">
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
      <div className="bg-white p-6 rounded-[20px] shadow-md w-full lg:w-[70%]">
        <h2 className="font-semibold text-lg text-gray-700 mb-4">Latest Client Certificates</h2>
        <input
          type="text"
          placeholder="Search by Name or CNIC no."
          className="border border-gray-300 px-4 py-2 w-full rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#57123f]"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-auto">
            <thead>
              <tr className="text-gray-600 bg-gray-50">
                <th className="text-left py-3 px-4">Lead Name</th>
                <th className="text-left py-3 px-4">Service</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Certification</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Ahmad Khan', service: 'NTN Registration' },
                { name: 'Irfan Liaquat', service: 'LTD Company Registration' },
                { name: 'Adv. Kamraan', service: 'Tax Filing' },
                { name: 'Amjad', service: 'Tax Filing' },
              ].map((client, index) => (
                <tr key={index} className="hover:bg-gray-50 border-t">
                  <td className="py-3 px-4">{client.name}</td>
                  <td className="py-3 px-4 truncate max-w-[180px]">{client.service}</td>
                  <td className="py-3 px-4">
                    <span className="text-green-500 font-medium">Done</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-3 justify-center w-full">
                      <button className="text-[#57123f] hover:underline ">
                        <FaEye /> 
                      </button>
                      <button className="text-[#57123f] hover:underline ">
                        <FaDownload /> 
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServiceProcessing;
