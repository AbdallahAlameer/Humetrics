import { useState, useRef, useCallback } from 'react';
import API from '../api/client';

const STEPS = { SELECT: 0, PREVIEW: 1, UPLOADING: 2, DONE: 3 };

export default function DataUpload() {
    const [step, setStep] = useState(STEPS.SELECT);
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');
    const [uploadResult, setUploadResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef();

    // ── Drag & Drop handlers ──
    const onDragOver = useCallback((e) => { e.preventDefault(); setDragging(true); }, []);
    const onDragLeave = useCallback(() => setDragging(false), []);
    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFileSelect(f);
    }, []);

    const handleFileSelect = async (f) => {
        setError('');
        if (!f.name.toLowerCase().endsWith('.csv')) {
            setError('Please select a CSV file');
            return;
        }
        if (f.size > 50 * 1024 * 1024) {
            setError('File exceeds the 50 MB limit');
            return;
        }
        setFile(f);
        setLoading(true);

        try {
            const form = new FormData();
            form.append('file', f);
            const { data } = await API.post('/upload/preview', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setPreview(data);
            setStep(STEPS.PREVIEW);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to preview file');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        setStep(STEPS.UPLOADING);
        setError('');
        try {
            const form = new FormData();
            form.append('file', file);
            const { data } = await API.post('/upload/apply', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUploadResult(data);
            setStep(STEPS.DONE);
        } catch (err) {
            setError(err.response?.data?.detail || 'Upload failed');
            setStep(STEPS.PREVIEW);
        }
    };

    const reset = () => {
        setStep(STEPS.SELECT);
        setFile(null);
        setPreview(null);
        setError('');
        setUploadResult(null);
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <>
            <div className="page-header">
                <h1>📤 Upload Dataset</h1>
                <p>Upload your employee CSV dataset to replace the current data across all dashboards</p>
            </div>

            {error && (
                <div className="upload-error-banner">
                    <span className="icon">⚠️</span>
                    <span>{error}</span>
                    <button onClick={() => setError('')}>✕</button>
                </div>
            )}

            {/* ── Step 1: File Selection ── */}
            {step === STEPS.SELECT && (
                <div className="upload-section">
                    <div
                        className={`upload-zone${dragging ? ' dragging' : ''}`}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => inputRef.current?.click()}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".csv"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                if (e.target.files[0]) handleFileSelect(e.target.files[0]);
                            }}
                        />
                        {loading ? (
                            <div className="upload-zone-loading">
                                <div className="spinner" />
                                <p>Analyzing file…</p>
                            </div>
                        ) : (
                            <>
                                <div className="upload-zone-icon">📂</div>
                                <h3>Drop your CSV file here</h3>
                                <p>or click to browse</p>
                                <div className="upload-zone-hint">
                                    Maximum file size: 50 MB · CSV format only
                                </div>
                            </>
                        )}
                    </div>

                    <div className="upload-info-cards">
                        <div className="card upload-info-card">
                            <h4>📋 Required Columns</h4>
                            <div className="column-badge-list">
                                {['EmployeeID', 'Department', 'JobTitle', 'Gender', 'Salary', 'TenureYears', 'PerformanceRating', 'AbsenceDays_Last6M', 'EngagementScore', 'AttritionFlag'].map(c => (
                                    <span key={c} className="column-badge required">{c}</span>
                                ))}
                            </div>
                        </div>
                        <div className="card upload-info-card">
                            <h4>🔧 Optional Columns</h4>
                            <p className="upload-info-note">Missing optional columns will be auto-derived or set to defaults</p>
                            <div className="column-badge-list">
                                {['HighPerformerFlag', 'EarlyTenureFlag', 'BurnoutRiskScore', 'TrainingCount', 'AvgOverallScore', 'CareerStagnationFlag'].map(c => (
                                    <span key={c} className="column-badge optional">{c}</span>
                                ))}
                                <span className="column-badge optional">+13 more</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Step 2: Preview & Validation ── */}
            {step === STEPS.PREVIEW && preview && (
                <div className="upload-section">
                    {/* File info bar */}
                    <div className="upload-file-bar">
                        <div className="upload-file-info">
                            <span className="file-icon">📄</span>
                            <div>
                                <div className="file-name">{preview.filename}</div>
                                <div className="file-meta">
                                    {preview.total_rows.toLocaleString()} rows · {formatSize(preview.size_bytes)} · {preview.columns.length} columns
                                </div>
                            </div>
                        </div>
                        <button className="btn-secondary" onClick={reset}>Change file</button>
                    </div>

                    {/* Validation Results */}
                    <div className="upload-validation">
                        <h3>
                            {preview.validation.valid
                                ? '✅ Validation Passed'
                                : '❌ Validation Failed'}
                        </h3>

                        {preview.validation.found.length > 0 && (
                            <div className="validation-group">
                                <h4>✅ Required columns found ({preview.validation.found.length}/{preview.validation.found.length + preview.validation.missing.length})</h4>
                                <div className="column-badge-list">
                                    {preview.validation.found.map(c => (
                                        <span key={c} className="column-badge valid">{c}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {preview.validation.missing.length > 0 && (
                            <div className="validation-group">
                                <h4>❌ Missing required columns</h4>
                                <div className="column-badge-list">
                                    {preview.validation.missing.map(c => (
                                        <span key={c} className="column-badge missing">{c}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {preview.validation.optionalMissing.length > 0 && (
                            <div className="validation-group">
                                <h4>⚠️ Optional columns will be auto-generated ({preview.validation.optionalMissing.length})</h4>
                                <div className="column-badge-list">
                                    {preview.validation.optionalMissing.map(c => (
                                        <span key={c} className="column-badge defaulted">{c}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {preview.validation.optionalFound.length > 0 && (
                            <div className="validation-group">
                                <h4>✅ Optional columns found ({preview.validation.optionalFound.length})</h4>
                                <div className="column-badge-list">
                                    {preview.validation.optionalFound.map(c => (
                                        <span key={c} className="column-badge valid">{c}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {preview.validation.extra.length > 0 && (
                            <div className="validation-group">
                                <h4>ℹ️ Extra columns (will be kept)</h4>
                                <div className="column-badge-list">
                                    {preview.validation.extra.map(c => (
                                        <span key={c} className="column-badge extra">{c}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Data Preview Table */}
                    <div className="card" style={{ overflow: 'auto' }}>
                        <h3 style={{ marginBottom: 16, fontSize: 15 }}>📊 Data Preview (first {preview.preview.length} rows)</h3>
                        <div className="preview-table-wrap">
                            <table className="data-table preview-table">
                                <thead>
                                    <tr>
                                        {preview.columns.slice(0, 12).map(col => (
                                            <th key={col}>{col}</th>
                                        ))}
                                        {preview.columns.length > 12 && (
                                            <th>+{preview.columns.length - 12} more</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.preview.map((row, i) => (
                                        <tr key={i}>
                                            {preview.columns.slice(0, 12).map(col => (
                                                <td key={col}>{row[col] ?? ''}</td>
                                            ))}
                                            {preview.columns.length > 12 && <td>…</td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="upload-actions">
                        <button className="btn-secondary" onClick={reset}>
                            ← Back
                        </button>
                        {preview.validation.valid && (
                            <button className="btn-primary upload-apply-btn" onClick={handleApply}>
                                🚀 Upload & Apply Dataset
                            </button>
                        )}
                    </div>

                    {!preview.validation.valid && (
                        <div className="upload-warning-box">
                            <span>⚠️</span>
                            <p>Cannot apply this dataset — required columns are missing. Please update your CSV and try again.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Step 3: Uploading ── */}
            {step === STEPS.UPLOADING && (
                <div className="upload-section">
                    <div className="upload-progress-card card">
                        <div className="spinner" style={{ width: 48, height: 48 }} />
                        <h3>Processing dataset…</h3>
                        <p>Preprocessing, applying models, and updating all dashboards</p>
                        <div className="upload-progress-bar">
                            <div className="upload-progress-fill" />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Step 4: Success ── */}
            {step === STEPS.DONE && uploadResult && (
                <div className="upload-section">
                    <div className="upload-success-card card">
                        <div className="success-icon">✅</div>
                        <h2>Dataset Uploaded Successfully!</h2>
                        <p>{uploadResult.total_rows.toLocaleString()} rows processed and applied</p>

                        {uploadResult.columns_defaulted?.length > 0 && (
                            <div className="upload-defaulted-info">
                                <h4>Auto-generated columns:</h4>
                                <div className="column-badge-list" style={{ justifyContent: 'center' }}>
                                    {uploadResult.columns_defaulted.map(c => (
                                        <span key={c} className="column-badge defaulted">{c}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="upload-success-actions">
                            <button className="btn-primary" onClick={() => window.location.href = '/'}>
                                📊 View Dashboards
                            </button>
                            <button className="btn-secondary" onClick={reset}>
                                📤 Upload Another
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
