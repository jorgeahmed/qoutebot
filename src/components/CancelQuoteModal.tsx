import React, { useState } from 'react';
import { cancelQuote } from '../services/api';
import './CancelQuoteModal.css';

interface CancelQuoteModalProps {
    quoteId: number;
    jobId: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    contractorId: string;
}

const CancelQuoteModal: React.FC<CancelQuoteModalProps> = ({
    quoteId,
    jobId,
    isOpen,
    onClose,
    onSuccess,
    contractorId
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
            await cancelQuote(quoteId, reason, contractorId);
            setReason('');
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error cancelling quote:', err);
            setError(err.response?.data?.error || 'Error al cancelar el levantamiento');
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
                    <h2>Cancelar Levantamiento</h2>
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
                            <strong>Importante:</strong> Al cancelar este levantamiento, el proyecto
                            volverá automáticamente al marketplace para que otros contratistas puedan tomarlo.
                            El cliente será notificado de la cancelación.
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
                                placeholder="Ej: No puedo completar el trabajo, conflicto de agenda..."
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

export default CancelQuoteModal;
