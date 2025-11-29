import React, { useState, useEffect } from 'react';
import { getQuote } from '../services/api';
import CancelQuoteModal from './CancelQuoteModal';
import './QuoteDetailsView.css';

interface Quote {
    quote_id: number;
    job_id: number;
    contractor_id: string;
    contractor_name: string;
    contractor_email: string;
    status: string;
    description: string;
    estimated_cost: number;
    materials_cost: number;
    labor_cost: number;
    other_costs: number;
    timeline_days: number;
    timeline_description: string;
    guarantees: string;
    payment_terms: string;
    photo_keys: string;
    created_at: string;
    cancelled_at?: string;
    cancellation_reason?: string;
}

interface QuoteDetailsViewProps {
    quoteId: number;
    currentContractorId: string;
}

const QuoteDetailsView: React.FC<QuoteDetailsViewProps> = ({ quoteId, currentContractorId }) => {
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);

    const fetchQuote = async () => {
        try {
            setLoading(true);
            const data = await getQuote(quoteId);
            setQuote(data);
        } catch (err: any) {
            console.error('Error fetching quote:', err);
            setError('Error al cargar el levantamiento');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuote();
    }, [quoteId]);

    const handleCancelSuccess = () => {
        fetchQuote(); // Reload quote data
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            active: { label: 'Activo', className: 'status-active' },
            accepted: { label: 'Aceptado', className: 'status-accepted' },
            cancelled: { label: 'Cancelado', className: 'status-cancelled' }
        };

        const config = statusConfig[status] || { label: status, className: 'status-default' };
        return <span className={`status-badge ${config.className}`}>{config.label}</span>;
    };

    if (loading) {
        return (
            <div className="quote-details-container">
                <div className="loading-state">
                    <span className="spinner"></span> Cargando detalles del levantamiento...
                </div>
            </div>
        );
    }

    if (error || !quote) {
        return (
            <div className="quote-details-container">
                <div className="error-state">
                    <span className="error-icon">⚠️</span>
                    <p>{error || 'Levantamiento no encontrado'}</p>
                </div>
            </div>
        );
    }

    const canCancel = quote.contractor_id === currentContractorId && quote.status !== 'cancelled';

    return (
        <div className="quote-details-container">
            <div className="quote-details-card">
                <div className="quote-header">
                    <div>
                        <h1>Levantamiento #{quote.quote_id}</h1>
                        {getStatusBadge(quote.status)}
                    </div>
                    {canCancel && (
                        <button
                            className="btn-cancel-quote"
                            onClick={() => setShowCancelModal(true)}
                        >
                            ❌ Cancelar Levantamiento
                        </button>
                    )}
                </div>

                <div className="quote-section">
                    <h2>Información del Contratista</h2>
                    <div className="contractor-info">
                        <p><strong>Nombre:</strong> {quote.contractor_name}</p>
                        <p><strong>Email:</strong> {quote.contractor_email}</p>
                    </div>
                </div>

                <div className="quote-section">
                    <h2>Descripción del Levantamiento</h2>
                    <p className="quote-description">{quote.description}</p>
                </div>

                <div className="quote-section">
                    <h2>Desglose de Costos</h2>
                    <div className="cost-breakdown">
                        <div className="cost-item">
                            <span className="cost-label">Materiales:</span>
                            <span className="cost-value">${Number(quote.materials_cost).toFixed(2)}</span>
                        </div>
                        <div className="cost-item">
                            <span className="cost-label">Mano de Obra:</span>
                            <span className="cost-value">${Number(quote.labor_cost).toFixed(2)}</span>
                        </div>
                        <div className="cost-item">
                            <span className="cost-label">Otros Costos:</span>
                            <span className="cost-value">${Number(quote.other_costs).toFixed(2)}</span>
                        </div>
                        <div className="cost-item cost-total">
                            <span className="cost-label">Total Estimado:</span>
                            <span className="cost-value">${Number(quote.estimated_cost).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="quote-section">
                    <h2>Cronograma</h2>
                    <p><strong>Duración:</strong> {quote.timeline_days} días</p>
                    {quote.timeline_description && (
                        <p className="timeline-description">{quote.timeline_description}</p>
                    )}
                </div>

                {quote.guarantees && (
                    <div className="quote-section">
                        <h2>Garantías</h2>
                        <p>{quote.guarantees}</p>
                    </div>
                )}

                {quote.payment_terms && (
                    <div className="quote-section">
                        <h2>Términos de Pago</h2>
                        <p>{quote.payment_terms}</p>
                    </div>
                )}

                {quote.photo_keys && JSON.parse(quote.photo_keys).length > 0 && (
                    <div className="quote-section">
                        <h2>Fotos del Levantamiento</h2>
                        <div className="photo-grid">
                            {JSON.parse(quote.photo_keys).map((key: string, index: number) => (
                                <div key={index} className="photo-item">
                                    📷 {key}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="quote-section">
                    <h2>Información</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Trabajo ID:</span>
                            <span className="info-value">#{quote.job_id}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Creado:</span>
                            <span className="info-value">{new Date(quote.created_at).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {quote.status === 'cancelled' && quote.cancellation_reason && (
                    <div className="cancellation-notice">
                        <div className="cancellation-header">
                            <span className="cancellation-icon">❌</span>
                            <strong>Levantamiento Cancelado</strong>
                        </div>
                        <p><strong>Razón:</strong> {quote.cancellation_reason}</p>
                        {quote.cancelled_at && (
                            <p className="cancellation-date">
                                Cancelado el {new Date(quote.cancelled_at).toLocaleString()}
                            </p>
                        )}
                        <div className="marketplace-notice">
                            ℹ️ El proyecto ha vuelto al marketplace para otros contratistas
                        </div>
                    </div>
                )}
            </div>

            <CancelQuoteModal
                quoteId={quote.quote_id}
                jobId={quote.job_id}
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onSuccess={handleCancelSuccess}
                contractorId={currentContractorId}
            />
        </div>
    );
};

export default QuoteDetailsView;
