import axios from 'axios';

export const fetchEmployees = async () => {
  const response = await axios.get('https://app.zumarlawfirm.com:5000/admin/roles');
  return response.data;
};
