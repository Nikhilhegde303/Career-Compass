// frontend/src/services/analysisService.js

import api from './api';

const analysisService = {
  // Run Resume Health Analysis
  // POST /api/analysis/resume/:resumeId
  runHealthAnalysis: async (resumeId) => {
    const response = await api.post(`/analysis/resume/${resumeId}`);
    return response.data.data;
  },

  // Run Job Match Analysis
  // POST /api/analysis/job-match/:resumeId
  runJobMatchAnalysis: async (resumeId, payload) => {
    const response = await api.post(`/analysis/job-match/${resumeId}`, payload);
    return response.data.data;
  },

  // Fetch analysis history for a resume (last 10)
  // GET /api/analysis/:resumeId
  getAnalysisHistory: async (resumeId) => {
    const response = await api.get(`/analysis/${resumeId}`);
    return response.data.data;
  },

  // Fetch most recent analysis for a resume
  // GET /api/analysis/latest/:resumeId
  getLatestAnalysis: async (resumeId) => {
    const response = await api.get(`/analysis/latest/${resumeId}`);
    return response.data.data;
  },
};

export default analysisService;
