
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEye, FaDownload, FaMoneyBillWave, FaUserCheck, FaRegFileAlt } from 'react-icons/fa';


const UserDashboard = () => {
  const [userServices, setUserServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [certFile, setCertFile] = useState(null);
  const [certType, setCertType] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  // Handler for main checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = userServices.filter(s => (s.formFields?.status || s.status) === 'completed').map(s => s._id || s.serviceTitle);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  // Handler for row checkbox
  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }
    fetchUserServices();
  }, []);

  const fetchUserServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get('https://app.zumarlawfirm.com:5000/userpanel/services', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });

      setUserServices(response.data);
    } catch (err) {
      console.error('Failed to fetch user services:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get certificate file URL (assuming backend saves filename in service.certificate)
  const getCertificateUrl = (service) => {
    if (!service.certificate) return null;
    return `https://app.zumarlawfirm.com:5000/uploads/${service.certificate}`;
  };

  // View certificate handler
  const handleViewCertificate = (service) => {
    const certUrl = getCertificateUrl(service);
    if (!certUrl) return alert('No certificate uploaded.');
    setCertFile(certUrl);
    // Determine type by extension
    const ext = certUrl.split('.').pop().toLowerCase();
    setCertType(ext === 'pdf' ? 'pdf' : (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext) ? 'image' : 'other'));
    setShowCertModal(true);
  };

  // Download certificate handler
  const handleDownloadCertificate = (service) => {
    const certUrl = getCertificateUrl(service);
    if (!certUrl) return alert('No certificate uploaded.');
    // Create a temporary link to download
    const link = document.createElement('a');
    link.href = certUrl;
    link.download = service.certificate;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate due payments
  const dueServices = userServices.filter(s => s.paymentStatus !== 'submit');
  const totalDue = dueServices.reduce((sum, s) => sum + (parseFloat(s.paymentAmount) || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8e6f2] via-[#f3f0fa] to-[#f7f7fa] py-10 px-2 md:px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
          <div>
            <h2 className="text-3xl font-extrabold text-[#57123f] flex items-center gap-2">
              <FaUserCheck className="inline-block text-[#57123f] text-2xl" />
              Hey {userInfo?.firstName || 'User'} 👋
            </h2>
            <p className="text-gray-500 mt-1">Welcome to your Dashboard</p>
          </div>
        </div>

        {/* Top Service Summary */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="col-span-2 bg-white shadow-2xl rounded-2xl p-6 border border-[#f3e8ff]">
            <h3 className="text-lg font-bold text-[#57123f] mb-4 flex items-center gap-2">
              <FaRegFileAlt className="text-[#57123f]" /> Your Services Progress
            </h3>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : userServices.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No services found.</div>
            ) : (
              <table className="w-full text-sm rounded-xl overflow-hidden">
                <thead>
                  <tr className="text-left text-gray-600 border-b bg-[#faf5ff]">
                    <th className="py-2 px-2">Name</th>
                    <th className="py-2 px-2">Member</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2">View Details</th>
                  </tr>
                </thead>
                <tbody>
                  {userServices.slice(0, 5).map((service, idx) => (
                    <tr key={service._id} className={
                      `border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f9f5fc]'} hover:bg-[#f3e8ff]/40 transition`}
                    >
                      <td className="py-2 px-2 font-medium">{service.serviceTitle || 'N/A'}</td>
                      <td className="py-2 px-2">{service.personalId?.name || 'N/A'}</td>
                      <td className="py-2 px-2">
                        {(() => {
                          const status = service.formFields?.status || service.status || 'N/A';
                          let statusColor = 'bg-gray-100 text-gray-600';
                          if (status === 'completed') statusColor = 'bg-green-100 text-green-700';
                          else if (status === 'in-progress') statusColor = 'bg-yellow-100 text-yellow-700';
                          else if (status === 'pending') statusColor = 'bg-red-100 text-red-700';
                          return (
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold shadow ${statusColor}`}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          );
                        })()}
                    </td>
                      <td className="py-2 px-2 flex gap-2 text-[#57123f]">
                        <button className="hover:text-[#57123f] transition" title="View Certificate" onClick={() => handleViewCertificate(service)}>
                          <FaEye />
                        </button>
                        <button className="hover:text-[#57123f] transition" title="Download Certificate" onClick={() => handleDownloadCertificate(service)}>
                          <FaDownload />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Due Payment Section */}
          <div className="bg-gradient-to-br from-[#f3e8ff] to-[#f8e6f2] shadow-xl rounded-2xl p-6 border border-[#f3e8ff] flex flex-col justify-between">
            <h3 className="text-lg font-bold text-[#57123f] mb-4 flex items-center gap-2">
              <FaMoneyBillWave className="text-[#57123f]" /> Due Payment
            </h3>
            <p className="text-3xl font-extrabold text-[#57123f] mb-2">{totalDue > 0 ? totalDue.toLocaleString() + ' PKR' : '0 PKR'}</p>
            <ul className="text-sm text-gray-700 mb-4 list-disc list-inside max-h-32 overflow-y-auto">
              {dueServices.length === 0 ? (
                <li>No due payments</li>
              ) : (
                dueServices.map((s, i) => (
                  <li key={s._id || i} className="flex justify-between items-center">
                    <span>{s.serviceTitle || 'Service'}</span>
                    <span className="ml-2 text-[#57123f] font-semibold">{s.paymentAmount ? `${s.paymentAmount} PKR` : 'N/A'}</span>
                  </li>
                ))
              )}
            </ul>
            <button
              className="bg-[#57123f] hover:bg-[#4a0f35] transition text-white w-full py-2 rounded-lg font-semibold shadow"
              onClick={() => alert('Payment slip generation coming soon!')}
              disabled={dueServices.length === 0}
            >
              Generate Payment Slip
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-1 w-full bg-gradient-to-r from-[#f3e8ff] via-[#f8e6f2] to-[#f3e8ff] rounded my-6 opacity-70" />

        {/* Full Table */}
        <div className="bg-white shadow-2xl rounded-2xl p-6 border border-[#f3e8ff]">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
            <h3 className="text-lg font-bold text-[#57123f] flex items-center gap-2">
              <FaRegFileAlt className="text-[#57123f]" /> Your Services Progress
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-[#57123f] text-white px-3 py-1 rounded-full font-semibold shadow">Services Done: {userServices.filter(s => s.formFields?.status === 'completed').length}</span>
              <button className="text-[#57123f] underline hover:text-[#57123f] transition" onClick={() => alert('Filters coming soon!')}>Filters</button>
              <select className="border rounded px-2 py-1">
                <option>Last Month</option>
                <option>This Month</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : userServices.filter(s => (s.formFields?.status || s.status) === 'completed').length === 0 ? (
            <div className="text-center py-8 text-gray-400">No completed services found.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-sm rounded-xl overflow-hidden">
                <thead className="bg-gradient-to-r from-[#f3e8ff] to-[#e9d8fd] text-[#57123f] shadow-md rounded-t-xl">
                  <tr>
                    <th className="p-3 font-bold uppercase tracking-wider rounded-tl-xl text-xs text-[#57123f] bg-opacity-80 text-left">
                      <input
                        type="checkbox"
                        className="accent-[#57123f]"
                        checked={userServices.filter(s => (s.formFields?.status || s.status) === 'completed').length > 0 && selectedRows.length === userServices.filter(s => (s.formFields?.status || s.status) === 'completed').length}
                        onChange={handleSelectAll}
                        indeterminate={selectedRows.length > 0 && selectedRows.length < userServices.filter(s => (s.formFields?.status || s.status) === 'completed').length ? 'true' : undefined}
                      />
                    </th>
                    <th className="p-3 font-bold uppercase tracking-wider text-xs text-[#57123f] bg-opacity-80 text-left">Services</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-xs text-[#57123f] bg-opacity-80 text-left">Payment Date</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-xs text-[#57123f] bg-opacity-80 text-left">Payment</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-xs text-[#57123f] bg-opacity-80 text-left">Status</th>
                    <th className="p-3 font-bold uppercase tracking-wider rounded-tr-xl text-xs text-[#57123f] bg-opacity-80 text-left">Certificates</th>
                  </tr>
                </thead>
                <tbody>
                  {userServices.filter(s => (s.formFields?.status || s.status) === 'completed').map((service, index) => {
                    const rowId = service._id || service.serviceTitle;
                    return (
                      <tr
                        key={rowId}
                        className={`border-b last:border-0 group transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-[#f6f0fa]'} hover:shadow-lg hover:scale-[1.01] hover:bg-[#f3e8ff]/60`}
                        style={{ borderRadius: '12px' }}
                      >
                        <td className="p-2 align-middle">
                          <input
                            type="checkbox"
                            className="accent-[#57123f]"
                            checked={selectedRows.includes(rowId)}
                            onChange={() => handleSelectRow(rowId)}
                          />
                        </td>
                        <td className="p-2 font-semibold text-[#57123f] align-middle">{service.serviceTitle || 'N/A'}</td>
                        <td className="p-2 align-middle">
                          {service.paymentStatus === 'submit' && service.paymentDate
                            ? <span className="bg-green-50 text-green-700 px-2 py-1 rounded font-medium text-xs shadow">{new Date(service.paymentDate).toLocaleDateString()}</span>
                            : <span className="bg-gray-50 text-gray-400 px-2 py-1 rounded font-medium text-xs shadow">N/A</span>}
                        </td>
                        <td className="p-2 align-middle">
                          {service.paymentAmount ? <span className="bg-purple-50 text-[#57123f] px-2 py-1 rounded font-medium text-xs shadow">{service.paymentAmount} PKR</span> : <span className="bg-gray-50 text-gray-400 px-2 py-1 rounded font-medium text-xs shadow">N/A</span>}
                        </td>
                        <td className="p-2 align-middle">
                          {(() => {
                            const status = service.formFields?.status || service.status || 'N/A';
                            let statusColor = 'bg-gray-100 text-gray-600';
                            if (status === 'completed') statusColor = 'bg-green-100 text-green-700';
                            else if (status === 'in-progress') statusColor = 'bg-yellow-100 text-yellow-700';
                            else if (status === 'pending') statusColor = 'bg-red-100 text-red-700';
                            return (
                              <span className={`text-xs px-2 py-1 rounded-full font-semibold shadow ${statusColor}`}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="p-2 flex gap-2 items-center align-middle">
                          <button
                            className="bg-[#f3e8ff] hover:bg-[#e2d6f7] text-[#57123f] p-2 rounded-full shadow transition-all duration-150"
                            title="View Certificate"
                            onClick={() => handleViewCertificate(service)}
                          >
                            <FaEye />
                          </button>
                          <button
                            className="bg-[#f3e8ff] hover:bg-[#e2d6f7] text-[#57123f] p-2 rounded-full shadow transition-all duration-150"
                            title="Download Certificate"
                            onClick={() => handleDownloadCertificate(service)}
                          >
                            <FaDownload />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* Certificate Modal */}
      {showCertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
              onClick={() => setShowCertModal(false)}
              title="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4">Service Completion Certificate</h2>
            {/* Show status of the service */}
            {(() => {
              // Find the service object for the current certFile
              const service = userServices.find(s => getCertificateUrl(s) === certFile);
              if (!service) return null;
              const status = service.formFields?.status || 'N/A';
              let statusColor = 'bg-gray-100 text-gray-600';
              if (status === 'completed') statusColor = 'bg-green-100 text-green-700';
              else if (status === 'in-progress') statusColor = 'bg-yellow-100 text-yellow-700';
              else if (status === 'pending') statusColor = 'bg-red-100 text-red-700';
              return (
                <div className={`mb-4 text-sm font-semibold px-3 py-1 rounded-full inline-block shadow ${statusColor}`}>
                  Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
              );
            })()}
            {certType === 'pdf' ? (
              <iframe src={certFile} title="Certificate PDF" className="w-full h-96 border rounded" />
            ) : certType === 'image' ? (
              <img src={certFile} alt="Certificate" className="w-full max-h-96 object-contain border rounded" />
            ) : (
              <div className="text-gray-500">Cannot preview this file type.</div>
            )}
            <div className="mt-4 flex justify-end">
              <a
                href={certFile}
                download
                className="bg-[#57123f] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#4a0f35] transition"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
