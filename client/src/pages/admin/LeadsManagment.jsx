import { useState, useEffect } from "react";
import { serviceData } from "../../data/serviceSchemas";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Edit, Trash2, UserPlus } from "lucide-react";
import { BiImport } from "react-icons/bi";


export default function LeadsManagment() {

  const [editModal, setEditModal] = useState({ open: false, lead: null });
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All Leads");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [leads, setLeads] = useState([]);
  const leadsPerPage = 5;

  // Dynamic tab counts
  const tabCounts = {
    "All Leads": leads.length,
    "Mature Leads": leads.filter(l => l.status === "Mature").length,
    "Follow-up Leads": leads.filter(l => l.status === "Follow-ups" || l.status === "Follow-up").length,
    "Contacted Leads": leads.filter(l => l.status === "Contacted").length,
  };
  const tabs = [
    { name: "All Leads", count: tabCounts["All Leads"], link: "/admin/leads/all" },
    { name: "Mature Leads", count: tabCounts["Mature Leads"], link: "/admin/leads/mature" },
    { name: "Follow-up Leads", count: tabCounts["Follow-up Leads"], link: "/admin/leads/followup" },
    { name: "Contacted Leads", count: tabCounts["Contacted Leads"], link: "/admin/leads/contacted" },
  ];

  const statusColor = {
    "New Lead": "bg-purple-100 text-[#57123f]",
    "Follow-up": "bg-yellow-100 text-yellow-700",
    "Contacted": "bg-green-100 text-green-700",
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await axios.get("https://app.zumarlawfirm.com/leads");
      setLeads(res.data);
    } catch (err) {
      setLeads([]);
    }
  };

  // Filter leads by search, date, and status 'New'
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      (lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDate = filterDate
      ? (lead.createdAt && new Date(lead.createdAt).toISOString().slice(0, 10) === filterDate)
      : true;

    const isNewStatus = (lead.status === 'New' || lead.status === 'New Lead');

    return matchesSearch && matchesDate && isNewStatus;
  });

  const indexOfLast = currentPage * leadsPerPage;
  const indexOfFirst = indexOfLast - leadsPerPage;
  const paginatedLeads = filteredLeads.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  // Action handlers
  const handleView = (leadId) => {
    navigate(`/admin/leads/view/${leadId}`);
  };

  const handleEdit = (leadId) => {
    const lead = leads.find(l => l._id === leadId);
    setEditModal({ open: true, lead });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditModal((prev) => ({ ...prev, lead: { ...prev.lead, [name]: value } }));
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`https://app.zumarlawfirm.com/leads/${editModal.lead._id}`, editModal.lead);
      setLeads(prev => prev.map(l => l._id === editModal.lead._id ? { ...editModal.lead } : l));
      setEditModal({ open: false, lead: null });
    } catch (err) {
      alert('Failed to update lead');
    }
  };

  const handleDelete = async (leadId) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await axios.delete(`https://app.zumarlawfirm.com/leads/${leadId}`);
        setLeads(prev => prev.filter(l => l._id !== leadId));
      } catch (err) {
        alert("Failed to delete lead.");
      }
    }
  };

  return (
    <div className="w-auto space-y-5 py-6 bg-white">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-2 px-2">
        <Link to="/admin" className="hover:underline">Dashboard</Link> &gt; <span className="text-[#57123f] font-semibold">Leads</span>
      </div>

      {/* Header & Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Leads</h2>
        <div className="space-x-2 flex">
          <Link
            to="/admin/leads/add"
            className="bg-[#57123f] hover:bg-[#7a1a59] text-white px-4 py-2 rounded-full flex items-center gap-2"
          >
            <UserPlus size={18} />
            Add New Lead
          </Link>
          <Link
            to="/admin/leads/import"
            className="bg-[#57123f] hover:bg-[#7a1a59] text-white px-4 py-2 rounded-full flex items-center gap-2"
          >
            <BiImport size={18} />
            Import Leads (.csv)
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            to={tab.link}
            className={`px-4 py-2 rounded-full border ${
              activeTab === tab.name
                ? "bg-[#57123f] text-white"
                : "bg-gray-100 text-gray-800"
            }`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.name} <span className="ml-1">({tab.count})</span>
          </Link>
        ))}
      </div>

      {/* Search and Date Filter */}
      <div className="flex flex-wrap gap-4 items-center px-2">
        <input
          type="text"
          placeholder="Search by name, phone, CNIC, email"
          className="border px-4 py-2 rounded w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="date"
          className="border px-4 py-2 rounded"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      {/* Leads Table */}
      <div className="overflow-auto rounded border">
        <table className="w-full min-w-[957px] text-sm text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-2"><input type="checkbox" /></th>
              <th className="p-2">Name & Email</th>
              <th className="p-2">Phone & Registered</th>
              <th className="p-2">Service Interested</th>
              <th className="p-2">Status</th>
              <th className="p-2">Assigned To</th>
              <th className="p-2">Remarks</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.length > 0 ? (
              paginatedLeads.map((lead, idx) => (
                <tr key={lead._id || idx} className="border-b hover:bg-gray-50">
                  <td className="p-2"><input type="checkbox" /></td>
                  <td className="p-2">
                    <div className="font-medium" title={lead.name}>{lead.name}</div>
                    <div className="text-gray-500 text-xs" title={lead.email}>{lead.email}</div>
                  </td>
                  <td className="p-2">
                    <div className="text-xs text-gray-700">Phone: {lead.phone}</div>
                    <div className="text-xs text-gray-500">Registered: {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ''}</div>
                  </td>
                  <td className="p-2">{lead.service || '-'}</td>
                  <td className="p-2" title={lead.status}>
                    <select
                      value={lead.status || "New"}
                      onChange={async e => {
                        const value = e.target.value;
                        try {
                          await axios.put(`https://app.zumarlawfirm.com/leads/${lead._id}/status`, { status: value });
                        } catch (err) {
                          // Optionally show error to user
                        }
                        setLeads(prev => {
                          // Update status and remove from current page if status changes
                          let updated = prev.map(l => l._id === lead._id ? { ...l, status: value } : l);
                          // Only keep leads with status 'New' or 'New Lead' in the current page
                          updated = updated.filter(l => l.status === 'New' || l.status === 'New Lead');
                          return updated;
                        });
                      }}
                      className="border rounded px-2 py-1 text-xs" style={{ color: '#57123f', borderColor: '#57123f' }}
                    >
                      <option value="New">New</option>
                      <option value="Mature">Mature</option>
                      <option value="Follow-up">Follow-ups</option>
                      <option value="Contacted">Contacted</option>
                    </select>
                  </td>
                  <td className="p-2" title={lead.assigned}>{lead.assigned}</td>
                  <td className="p-2" title={lead.remarks}>{lead.remarks || '-'}</td>
                  <td className="p-2 flex gap-1 text-[#57123f]">
                    <Eye size={18} className="cursor-pointer" title="View"
                      onClick={() => handleView(lead._id)} />
                    <Edit size={18} className="cursor-pointer" title="Edit"
                      onClick={() => handleEdit(lead._id)} />
                    <Trash2 size={18} className="cursor-pointer" title="Delete"
                      onClick={() => handleDelete(lead._id)} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="p-4 text-center text-gray-500">No leads found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2 px-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded border ${
                currentPage === i + 1
                  ? "bg-[#57123f] text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    {/* Edit Modal */}
    {editModal.open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-bold mb-4">Edit Lead</h3>
          <div className="space-y-3">
            <input
              type="text"
              name="name"
              value={editModal.lead.name || ''}
              onChange={handleEditChange}
              className="border rounded px-3 py-2 w-full"
              placeholder="Name"
            />
            <input
              type="email"
              name="email"
              value={editModal.lead.email || ''}
              onChange={handleEditChange}
              className="border rounded px-3 py-2 w-full"
              placeholder="Email"
            />
            <input
              type="text"
              name="phone"
              value={editModal.lead.phone || ''}
              onChange={handleEditChange}
              className="border rounded px-3 py-2 w-full"
              placeholder="Phone"
            />
            <select
              name="service"
              value={editModal.lead.service || ''}
              onChange={handleEditChange}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">Select Service Interested</option>
              {Object.keys(serviceData.prices).map((service) => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
            <input
              type="text"
              name="assigned"
              value={editModal.lead.assigned || ''}
              onChange={handleEditChange}
              className="border rounded px-3 py-2 w-full"
              placeholder="Assigned To"
            />
            <textarea
              name="remarks"
              value={editModal.lead.remarks || ''}
              onChange={handleEditChange}
              className="border rounded px-3 py-2 w-full"
              placeholder="Remarks"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              className="px-4 py-2 rounded bg-gray-200 text-gray-700"
              onClick={() => setEditModal({ open: false, lead: null })}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-[#57123f] text-white"
              onClick={handleEditSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
