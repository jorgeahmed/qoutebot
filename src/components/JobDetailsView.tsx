import React, { useState, useEffect } from 'react';
import { getJob } from '../services/api';
import CancelJobModal from './CancelJobModal';
import './JobDetailsView.css';

interface Job {
    job_id: number;
    description: string;
    status: string;
    ai_estimate: number;
    photo_keys: string;
    user_id: string;
    created_at: string;
    cancelled_at?: string;
    cancellation_reason?: string;
    cancelled_by?: string;
}

interface JobDetailsViewProps {
    jobId: number;
    currentUserId: string;
}

const JobDetailsView: React.FC<JobDetailsViewProps> = ({ jobId, currentUserId }) => {
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);

    const fetchJob = async () => {
        try {
            setLoading(true);
            const data = await getJob(jobId);
            setJob(data);
        } catch (err: any) {
            console.error('Error fetching job:', err);
            setError('Error al cargar el trabajo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJob();
    }, [jobId]);

    const handleCancelSuccess = () => {
        fetchJob(); // Reload job data
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            published: { label: 'Publicado', className: 'status-published' },
            assigned: { label: 'Asignado', className: 'status-assigned' },
            in_progress: { label: 'En Progreso', className: 'status-in-progress' },
            completed: { label: 'Completado', className: 'status-completed' },
            cancelled: { label: 'Cancelado', className: 'status-cancelled' }
        };

        const config = statusConfig[status] || { label: status, className: 'status-default' };
        return <span className={`status-badge ${config.className}`}>{config.label}</span>;
    };

    if (loading) {
        return (
            <div className="job-details-container">
                <div className="loading-state">
                    <span className="spinner"></span> Cargando detalles del trabajo...
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="job-details-container">
                <div className="error-state">
                    <span className="error-icon">⚠️</span>
                    <p>{error || 'Trabajo no encontrado'}</p>
                </div>
            </div>
        );
    }

    const canCancel = job.user_id === currentUserId && job.status !== 'cancelled' && job.status !== 'completed';

    return (
        <div className="job-details-container">
            <div className="job-details-card">
                <div className="job-header">
                    <div>
                        <h1>Trabajo #{job.job_id}</h1>
                        {getStatusBadge(job.status)}
                    </div>
                    {canCancel && (
                        <button
                            className="btn-cancel-job"
                            onClick={() => setShowCancelModal(true)}
                        >
                            🚫 Cancelar Trabajo
                        </button>
                    )}
                </div>

                <div className="job-section">
                    <h2>Descripción</h2>
                    <p className="job-description">{job.description}</p>
                </div>

                <div className="job-section">
                    <h2>Estimación de IA</h2>
                    <div className="estimate-box">
                        <span className="estimate-label">Costo Estimado:</span>
                        <span className="estimate-value">${Number(job.ai_estimate).toFixed(2)}</span>
                    </div>
                </div>

                {job.photo_keys && JSON.parse(job.photo_keys).length > 0 && (
                    <div className="job-section">
                        <h2>Fotos</h2>
                        <div className="photo-grid">
                            {JSON.parse(job.photo_keys).map((key: string, index: number) => (
                                <div key={index} className="photo-item">
                                    📷 {key}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="job-section">
                    <h2>Información</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Creado:</span>
                            <span className="info-value">{new Date(job.created_at).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {job.status === 'cancelled' && job.cancellation_reason && (
                    <div className="cancellation-notice">
                        <div className="cancellation-header">
                            <span className="cancellation-icon">🚫</span>
                            <strong>Trabajo Cancelado</strong>
                        </div>
                        <p><strong>Razón:</strong> {job.cancellation_reason}</p>
                        {job.cancelled_at && (
                            <p className="cancellation-date">
                                Cancelado el {new Date(job.cancelled_at).toLocaleString()}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <CancelJobModal
                jobId={job.job_id}
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onSuccess={handleCancelSuccess}
                userId={currentUserId}
            />
        </div>
    );
};

export default JobDetailsView;
