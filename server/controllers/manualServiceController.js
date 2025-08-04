import ManualServiceSubmission from '../models/ManualServiceSubmission.js';

// Delete many manual service submissions by IDs
export const deleteManyManualServices = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No IDs provided' });
    }
    await ManualServiceSubmission.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Selected services deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete selected services' });
  }
};
