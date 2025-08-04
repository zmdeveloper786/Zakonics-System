import axios from 'axios';

export const fetchEmployees = async () => {
  const response = await axios.get('http://app.zumarlawfirm.com:5000/admin/roles');
  return response.data;
};
