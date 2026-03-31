import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const api = {
  getStudents: (className) => 
    axios.get(`${API_URL}/students`, { params: { className } }),
  
  getClasses: () => 
    axios.get(`${API_URL}/classes`),
  
  updateStudent: (id, data) => 
    axios.patch(`${API_URL}/students/${id}`, data),
  
  bulkUpdate: (ids, data) => 
    axios.patch(`${API_URL}/students/bulk`, { ids, data }),
  
  importXML: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_URL}/import-xml`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
