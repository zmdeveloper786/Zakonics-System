
import React, { useState } from 'react';
import axios from 'axios';

const AnnouncementForm = ({ onAnnouncementAdded }) => {
  const [heading, setHeading] = useState('');
  const [paragraph, setParagraph] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('https://app.zumarlawfirm.com/announcements', { heading, paragraph });
      setHeading('');
      setParagraph('');
      if (onAnnouncementAdded) onAnnouncementAdded(res.data);
    } catch (err) {
      setError('Failed to add announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg mx-auto" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-4">Add Announcement</h2>
      <input
        type="text"
        placeholder="Heading"
        className="w-full mb-3 px-4 py-2 border rounded"
        value={heading}
        onChange={e => setHeading(e.target.value)}
        required
      />
      <textarea
        placeholder="Paragraph"
        className="w-full mb-3 px-4 py-2 border rounded"
        value={paragraph}
        onChange={e => setParagraph(e.target.value)}
        required
        rows={4}
      />
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button type="submit" className="bg-[#57123f] text-white px-6 py-2 rounded hover:bg-[#6d2c5b]" disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
};

export default AnnouncementForm;
