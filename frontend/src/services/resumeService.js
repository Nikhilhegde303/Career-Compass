import api from './api';

class ResumeService {
  async createResume(data) {
    const response = await api.post('/resumes', data);
    return response.data;
  }

  async getResumes() {
    const response = await api.get('/resumes');
    return response.data;
  }

  async getResume(id) {
    const response = await api.get(`/resumes/${id}`);
    return response.data;
  }

  async updateResume(id, data) {
    const response = await api.put(`/resumes/${id}`, data);
    return response.data;
  }

  async deleteResume(id) {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  }

  async duplicateResume(id) {
    const response = await api.post(`/resumes/${id}/duplicate`);
    return response.data;
  }

  // Add this method to the existing ResumeService class
async uploadResume(file) {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await api.post('/resumes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    transformRequest: [(data) => data] // Don't transform FormData
  });

  return response.data;
}
  
}



export default new ResumeService();