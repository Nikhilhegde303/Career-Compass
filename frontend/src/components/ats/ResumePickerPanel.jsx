// frontend/src/components/ats/ResumePickerPanel.jsx

import { useState, useEffect, useRef } from 'react';
import resumeService from '../../services/resumeService';
import './ResumePickerPanel.css';

function ResumePickerPanel({ onResumeSelected }) {
  const [resumes, setResumes]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError]               = useState('');
  const [uploadError, setUploadError]   = useState('');
  const [isDragging, setIsDragging]     = useState(false);
  const fileInputRef                    = useRef(null);

  // ── Load saved resumes ──────────────────────────────────────────
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await resumeService.getResumes();
        setResumes(response.data || []);
      } catch (err) {
        setError('Failed to load your resumes. Please refresh and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  // ── Handle resume upload ────────────────────────────────────────
  const handleFileUpload = async (file) => {
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a PDF or DOCX file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB.');
      return;
    }

    setUploadError('');
    setUploadLoading(true);

    try {
      const result = await resumeService.uploadResume(file);
      // Upload creates a new resume in DB and returns it
      // Pass the resume object to parent so analysis can run
      onResumeSelected({ ...result.data, id: result.data.resumeId });
    } catch (err) {
      setUploadError(
        err.response?.data?.message || 'Failed to process resume. Please try again.'
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileChange = (e) => handleFileUpload(e.target.files[0]);

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true);  };
  const handleDragLeave = ()  => setIsDragging(false);
  const handleDrop      = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files[0]);
  };

  // ── Format date ─────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  // ── Get completeness from resume content ────────────────────────
  const getCompleteness = (content) => {
    if (!content) return 0;
    let filled = 0;
    if (content.personal?.fullName) filled++;
    if (content.education?.length > 0) filled++;
    if (content.experience?.length > 0) filled++;
    if (content.skills?.technical?.length > 0) filled++;
    if (content.projects?.length > 0) filled++;
    return Math.round((filled / 5) * 100);
  };

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="resume-picker">
      <div className="resume-picker__header">
        <h2 className="resume-picker__title">Select a Resume to Analyze</h2>
        <p className="resume-picker__subtitle">
          Choose from your saved resumes or upload a new one
        </p>
      </div>

      {/* ── Saved Resumes ─────────────────────────────────────── */}
      <section className="resume-picker__section">
        <h3 className="resume-picker__section-title">Your Saved Resumes</h3>

        {error && (
          <div className="resume-picker__error">{error}</div>
        )}

        {loading ? (
          <div className="resume-picker__loading">
            <div className="resume-picker__spinner" />
            <span>Loading your resumes...</span>
          </div>
        ) : resumes.length === 0 ? (
          <div className="resume-picker__empty">
            <span className="resume-picker__empty-icon">📄</span>
            <p>You haven't created any resumes yet.</p>
            <p>Upload one below, or build a resume first.</p>
          </div>
        ) : (
          <div className="resume-picker__grid">
            {resumes.map((resume) => {
              const completeness = getCompleteness(resume.content);
              return (
                <div key={resume.id} className="resume-picker__card">
                  <div className="resume-picker__card-body">
                    <div className="resume-picker__card-icon">📝</div>
                    <div className="resume-picker__card-info">
                      <h4 className="resume-picker__card-title">
                        {resume.title || 'Untitled Resume'}
                      </h4>
                      <span className="resume-picker__card-date">
                        Updated {formatDate(resume.updated_at)}
                      </span>
                      <div className="resume-picker__completeness">
                        <div className="resume-picker__completeness-bar">
                          <div
                            className="resume-picker__completeness-fill"
                            style={{ width: `${completeness}%` }}
                          />
                        </div>
                        <span className="resume-picker__completeness-label">
                          {completeness}% complete
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="resume-picker__select-btn"
                    onClick={() => onResumeSelected(resume)}
                  >
                    Select →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Upload Section ────────────────────────────────────── */}
      <section className="resume-picker__section">
        <h3 className="resume-picker__section-title">
          Upload a Resume for Analysis
        </h3>
        <p className="resume-picker__upload-desc">
          Upload a PDF or DOCX file. It will be parsed and analyzed automatically.
        </p>

        {uploadError && (
          <div className="resume-picker__error">{uploadError}</div>
        )}

        <div
          className={`resume-picker__drop-zone ${isDragging ? 'resume-picker__drop-zone--dragging' : ''} ${uploadLoading ? 'resume-picker__drop-zone--loading' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploadLoading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {uploadLoading ? (
            <div className="resume-picker__upload-loading">
              <div className="resume-picker__spinner" />
              <span>Parsing your resume...</span>
            </div>
          ) : (
            <>
              <div className="resume-picker__drop-icon">📤</div>
              <p className="resume-picker__drop-primary">
                {isDragging ? 'Drop your file here' : 'Click to upload or drag & drop'}
              </p>
              <p className="resume-picker__drop-secondary">
                PDF or DOCX · Max 5MB
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default ResumePickerPanel;
