// frontend/src/services/optimizerService.js

import api from './api';

const optimizerService = {

  // GET /api/optimizer/eligible/:resumeId
  // Accepts optional analysisId, mode, jobDescription as query params
  getEligibleSections: async (resumeId, analysisId, mode, jobDescription) => {
    const params = new URLSearchParams();
    if (analysisId)     params.set('analysisId',     analysisId);
    if (mode)           params.set('mode',            mode);
    if (jobDescription) params.set('jobDescription',  jobDescription);

    const query    = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/optimizer/eligible/${resumeId}${query}`);
    return response.data.data;
  },

  // POST /api/optimizer/optimize-section
  optimizeSection: async (payload) => {
    const response = await api.post('/optimizer/optimize-section', payload);
    return response.data.data;
  },

  // POST /api/optimizer/accept
  acceptOptimization: async (optimizationId) => {
    const response = await api.post('/optimizer/accept', { optimizationId });
    return response.data.data;
  },

  // GET /api/optimizer/history/:resumeId
  getOptimizationHistory: async (resumeId) => {
    const response = await api.get(`/optimizer/history/${resumeId}`);
    return response.data.data;
  },
};

export default optimizerService;
