import { useState, useRef, useCallback } from 'react';
import API from '../api/client';
import { Upload, FileText, CheckCircle2, XCircle, AlertTriangle, Info, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            {error && (
                <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-sm">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                    <button onClick={() => setError('')} className="text-destructive hover:text-destructive/80">
                        <XCircle className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* ── Step 1: File Selection ── */}
            {step === STEPS.SELECT && (
                <div className="flex flex-col gap-6 rise">
                    <div
                        className={`relative flex flex-col items-center justify-center min-h-[320px] p-10 border-2 border-dashed transition-all cursor-pointer bg-card ${dragging ? 'border-primary bg-primary/5 shadow-[0_0_40px_rgba(var(--primary),0.15)]' : 'border-rule hover:bg-accent/5 hover:border-primary/40'}`}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => inputRef.current?.click()}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files[0]) handleFileSelect(e.target.files[0]);
                            }}
                        />
                        {loading ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-rule border-t-primary" />
                                <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Analyzing file…</span>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/20 mb-6">
                                    <Upload className="h-10 w-10 text-primary" />
                                </div>
                                <h3 className="font-display text-3xl text-ink mb-2">Drop your CSV file here</h3>
                                <p className="text-muted-foreground">or click to browse</p>
                                <div className="mt-8 px-4 py-2 bg-accent/10 border border-rule/50 rounded-full inline-block">
                                    <span className="text-xs text-muted-foreground font-mono">Max size: 50 MB · CSV format only</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 border border-rule bg-card">
                            <h4 className="font-display text-xl text-ink mb-4 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-success" /> Required Columns</h4>
                            <div className="flex flex-wrap gap-2">
                                {['EmployeeID', 'Department', 'JobTitle', 'Gender', 'Salary', 'TenureYears', 'PerformanceRating', 'AbsenceDays_Last6M', 'EngagementScore', 'AttritionFlag'].map(c => (
                                    <span key={c} className="font-mono text-[10px] px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-sm">{c}</span>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 border border-rule bg-card">
                            <h4 className="font-display text-xl text-ink mb-2 flex items-center gap-2"><Info className="h-5 w-5 text-muted-foreground" /> Optional Columns</h4>
                            <p className="text-sm text-muted-foreground mb-4">Missing columns will be auto-derived or set to defaults.</p>
                            <div className="flex flex-wrap gap-2">
                                {['HighPerformerFlag', 'EarlyTenureFlag', 'BurnoutRiskScore', 'TrainingCount', 'AvgOverallScore', 'CareerStagnationFlag'].map(c => (
                                    <span key={c} className="font-mono text-[10px] px-2 py-1 bg-accent/30 text-muted-foreground border border-rule rounded-sm">{c}</span>
                                ))}
                                <span className="font-mono text-[10px] px-2 py-1 bg-accent/30 text-muted-foreground border border-rule rounded-sm">+13 more</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Step 2: Preview & Validation ── */}
            {step === STEPS.PREVIEW && preview && (
                <div className="flex flex-col gap-8 rise">
                    {/* File info bar */}
                    <div className="flex items-center justify-between p-4 border border-rule bg-card">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 flex items-center justify-center bg-accent/20 rounded-sm">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium text-ink">{preview.filename}</h3>
                                <p className="font-numeric text-xs text-muted-foreground mt-1">
                                    {preview.total_rows.toLocaleString()} rows · {formatSize(preview.size_bytes)} · {preview.columns.length} columns
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={reset} size="sm" className="rounded-none">Change file</Button>
                    </div>

                    {/* Validation Results */}
                    <div className="p-6 border border-rule bg-card">
                        <h2 className={`font-display text-2xl mb-6 flex items-center gap-2 ${preview.validation.valid ? 'text-success' : 'text-destructive'}`}>
                            {preview.validation.valid ? <><CheckCircle2 className="h-6 w-6" /> Validation Passed</> : <><XCircle className="h-6 w-6" /> Validation Failed</>}
                        </h2>

                        <div className="space-y-6">
                            {preview.validation.found.length > 0 && (
                                <div>
                                    <h4 className="eyebrow text-success mb-3 flex items-center gap-2"><Check className="h-3 w-3" /> Required found ({preview.validation.found.length}/{preview.validation.found.length + preview.validation.missing.length})</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {preview.validation.found.map(c => (
                                            <span key={c} className="font-mono text-[10px] px-2 py-1 bg-success/10 text-success border border-success/30 rounded-sm">{c}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {preview.validation.missing.length > 0 && (
                                <div>
                                    <h4 className="eyebrow text-destructive mb-3 flex items-center gap-2"><XCircle className="h-3 w-3" /> Missing required</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {preview.validation.missing.map(c => (
                                            <span key={c} className="font-mono text-[10px] px-2 py-1 bg-destructive/10 text-destructive border border-destructive/30 rounded-sm">{c}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {preview.validation.optionalMissing.length > 0 && (
                                <div>
                                    <h4 className="eyebrow text-warning-foreground mb-3 flex items-center gap-2"><AlertTriangle className="h-3 w-3" /> Auto-generated ({preview.validation.optionalMissing.length})</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {preview.validation.optionalMissing.map(c => (
                                            <span key={c} className="font-mono text-[10px] px-2 py-1 bg-warning/10 text-warning-foreground border border-warning/30 rounded-sm">{c}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Data Preview Table */}
                    <div className="border border-rule bg-card overflow-hidden">
                        <div className="p-4 border-b border-rule bg-paper/50">
                            <h3 className="font-display text-xl text-ink">Data Preview <span className="text-base text-muted-foreground italic">(first {preview.preview.length} rows)</span></h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-rule bg-paper/20">
                                        {preview.columns.slice(0, 10).map(col => (
                                            <th key={col} className="py-2 px-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">{col}</th>
                                        ))}
                                        {preview.columns.length > 10 && (
                                            <th className="py-2 px-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">+{preview.columns.length - 10} more</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-rule/50">
                                    {preview.preview.map((row, i) => (
                                        <tr key={i} className="hover:bg-accent/10">
                                            {preview.columns.slice(0, 10).map(col => (
                                                <td key={col} className="py-2 px-3 whitespace-nowrap max-w-[150px] truncate text-ink">{row[col] ?? ''}</td>
                                            ))}
                                            {preview.columns.length > 10 && <td className="py-2 px-3 text-muted-foreground">…</td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-4 mt-2">
                        <Button variant="outline" onClick={reset} className="rounded-none">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        {preview.validation.valid ? (
                            <Button onClick={handleApply} className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90">
                                Upload & Apply Dataset <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <div className="flex-1 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Cannot apply this dataset. Required columns are missing.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Step 3: Uploading ── */}
            {step === STEPS.UPLOADING && (
                <div className="flex flex-col items-center justify-center p-20 border border-rule bg-card text-center rise">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-rule border-t-primary mb-6" />
                    <h3 className="font-display text-3xl text-ink mb-2">Processing dataset…</h3>
                    <p className="text-muted-foreground mb-8">Preprocessing, applying models, and updating all dashboards.</p>
                    <div className="w-full max-w-md h-1 bg-rule rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-1/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
                    </div>
                </div>
            )}

            {/* ── Step 4: Success ── */}
            {step === STEPS.DONE && uploadResult && (
                <div className="flex flex-col items-center p-16 border border-rule bg-card text-center rise">
                    <div className="h-24 w-24 rounded-full bg-success/20 flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-12 w-12 text-success" />
                    </div>
                    <h2 className="font-display text-4xl text-ink mb-3">Dataset Uploaded Successfully</h2>
                    <p className="text-muted-foreground mb-10 font-numeric text-lg">
                        {uploadResult.total_rows.toLocaleString()} rows processed and applied.
                    </p>

                    {uploadResult.columns_defaulted?.length > 0 && (
                        <div className="mb-10 p-6 bg-warning/10 border border-warning/30 rounded-sm w-full max-w-2xl text-left">
                            <h4 className="eyebrow text-warning-foreground mb-3">Auto-generated columns:</h4>
                            <div className="flex flex-wrap gap-2">
                                {uploadResult.columns_defaulted.map(c => (
                                    <span key={c} className="font-mono text-[10px] px-2 py-1 bg-warning/20 text-warning-foreground border border-warning/40 rounded-sm">{c}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <Button onClick={() => window.location.href = '/'} className="rounded-none">
                            View Dashboards
                        </Button>
                        <Button variant="outline" onClick={reset} className="rounded-none">
                            Upload Another
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
