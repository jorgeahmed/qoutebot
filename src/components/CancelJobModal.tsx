import React, { useState } from 'react';
import { cancelJob } from '../services/api';
import './CancelJobModal.css';

interface CancelJobModalProps {
    jobId: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: string;
}

const CancelJobModal: React.FC<CancelJobModalProps> = ({
    jobId,
    isOpen,
    onClose,
    onSuccess,
    userId
}) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason.trim()) {
            setError('Por favor ingresa una razón para la cancelación');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await cancelJob(jobId, reason, userId);
            setReason('');
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error cancelling job:', err);
            setError(err.response?.data?.error || 'Error al cancelar el trabajo');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setReason('');
            setError('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Cancelar Trabajo</h2>
                    <button
                        className="modal-close-btn"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    <div className="warning-box">
                        <span className="warning-icon">⚠️</span>
                        <div>
                            <strong>Advertencia:</strong> Esta acción cancelará el trabajo permanentemente.
                            Todos los contratistas con cotizaciones activas serán notificados.
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="cancellation-reason">
                                Razón de la cancelación <span className="required">*</span>
                            </label>
                            <textarea
                                id="cancellation-reason"
                                rows={4}
                                className="textarea-field"
                                placeholder="Ej: Ya no necesito el servicio, encontré otra solución..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        {error && <div className="error-msg">{error}</div>}

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                Volver
                            </button>
                            <button
                                type="submit"
                                className="btn-danger"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span> Cancelando...
                                    </>
                                ) : (
                                    'Confirmar Cancelación'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CancelJobModal;
