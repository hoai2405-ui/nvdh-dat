import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const IS_GOOGLE_SCRIPT = API_URL.includes('script.google.com');

const callBackend = (method, path, data) => {
  const url = `${API_URL}${path}`;
  const config = { headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' } };
  if (method === 'get') return axios.get(url, { params: data }).then(r => r.data);
  if (method === 'post') return axios.post(url, data, config).then(r => r.data);
  if (method === 'patch') return axios.patch(url, data, config).then(r => r.data);
  if (method === 'delete') return axios.delete(url).then(r => r.data);
};

const gsPost = (action, data = {}) => {
  return axios.post(API_URL, { action, ...data }, {
    headers: { 'Content-Type': 'application/json' }
  }).then(r => {
    const body = r.data;
    if (body && body.success !== undefined) {
      if (!body.success) throw new Error(body.error || 'Lỗi không xác định');
      return body.data;
    }
    return body;
  });
};

export const api = {
  // Students
  getStudents: () =>
    IS_GOOGLE_SCRIPT ? gsPost('getStudents') : callBackend('get', '/students'),
  getClasses: () =>
    IS_GOOGLE_SCRIPT ? gsPost('getClasses') : callBackend('get', '/classes'),
  updateStudent: (id, data) =>
    IS_GOOGLE_SCRIPT ? gsPost('updateStudent', { id, ...data }) : callBackend('patch', `/students/${id}`, data),
  deleteClass: (className) =>
    IS_GOOGLE_SCRIPT ? gsPost('deleteClass', { className }) : callBackend('delete', `/students/class/${className}`),
  importXML: (file) => {
    if (IS_GOOGLE_SCRIPT) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => gsPost('importXML', { xml: e.target.result }).then(resolve).catch(reject);
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }
    const formData = new FormData();
    formData.append('file', file);
    return callBackend('post', '/import-xml', formData);
  },

  // Instructors
  getInstructors: () =>
    IS_GOOGLE_SCRIPT ? gsPost('getInstructors') : callBackend('get', '/instructors'),
  addInstructor: (data) =>
    IS_GOOGLE_SCRIPT ? gsPost('addInstructor', data) : callBackend('post', '/instructors', data),
  deleteInstructor: (id) =>
    IS_GOOGLE_SCRIPT ? gsPost('deleteInstructor', { id }) : callBackend('delete', `/instructors/${id}`),

  // Vehicles
  getVehicles: () =>
    IS_GOOGLE_SCRIPT ? gsPost('getVehicles') : callBackend('get', '/vehicles'),
  addVehicle: (data) =>
    IS_GOOGLE_SCRIPT ? gsPost('addVehicle', data) : callBackend('post', '/vehicles', data),
  updateVehicle: (id, data) =>
    IS_GOOGLE_SCRIPT ? gsPost('updateVehicle', { id, ...data }) : callBackend('patch', `/vehicles/${id}`, data),
  deleteVehicle: (id) =>
    IS_GOOGLE_SCRIPT ? gsPost('deleteVehicle', { id }) : callBackend('delete', `/vehicles/${id}`),

  // Boxes
  getBoxes: () =>
    IS_GOOGLE_SCRIPT ? gsPost('getBoxes') : callBackend('get', '/boxes'),
  addBox: (data) =>
    IS_GOOGLE_SCRIPT ? gsPost('addBox', data) : callBackend('post', '/boxes', data),
  updateBox: (id, data) =>
    IS_GOOGLE_SCRIPT ? gsPost('updateBox', { id, ...data }) : callBackend('patch', `/boxes/${id}`, data),
  deleteBox: (id) =>
    IS_GOOGLE_SCRIPT ? gsPost('deleteBox', { id }) : callBackend('delete', `/boxes/${id}`),

  // Auth / Users
  login: (username, password) =>
    IS_GOOGLE_SCRIPT ? gsPost('login', { username, password }) : callBackend('post', '/auth/login', { username, password }),
  getUsers: () =>
    IS_GOOGLE_SCRIPT ? gsPost('getUsers') : callBackend('get', '/auth/users'),
  addUser: (data) =>
    IS_GOOGLE_SCRIPT ? gsPost('addUser', data) : callBackend('post', '/auth/register', data),
  deleteUser: (id) =>
    IS_GOOGLE_SCRIPT ? gsPost('deleteUser', { id }) : callBackend('delete', `/auth/users/${id}`),
};
