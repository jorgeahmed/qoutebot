import React, { useState } from 'react';
import { AuthKitProvider, useAuth } from '@workos-inc/authkit-react';
import axios from 'axios';
import NotificationCenter from './components/NotificationCenter';
import JobDetailsView from './components/JobDetailsView';
import QuoteDetailsView from './components/QuoteDetailsView';
import './App.css';

const WORKOS_CLIENT_ID = process.env.REACT_APP_WORKOS_CLIENT_ID;
const API_URL = process.env.REACT_APP_API_URL;

function QuoteBot() {
  const { user, signIn, signOut } = useAuth();
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('home'); // 'home', 'job-details', 'quote-details'
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const uploadPhotos = async (filesToUpload) => {
    // Mock implementation
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        if (progress >= 100) {
          clearInterval(interval);
          const mockKeys = filesToUpload.map(f => `mock_key_${f.name}_${Date.now()}`);
          resolve(mockKeys);
        }
      }, 200);
    });
  };

  const handleQuote = async () => {
    if (!description) return;
    setLoading(true);
    setError('');
    setQuote(null);

    try {
      let photoKeys = [];
      if (files.length > 0) {
        photoKeys = await uploadPhotos(files);
      }

      const response = await axios.post(`${API_URL}/jobs/create`, {
        description: description,
        photo_keys: photoKeys,
        user_id: user?.id || user?.email
      });

      const precio = response.data.aiEstimate;

      if (precio !== undefined) {
        setQuote(precio);
        setSelectedJobId(response.data.job_id);
      } else {
        setError('La IA respondió, pero no dio un precio. Revisa la consola.');
      }
    } catch (err) {
      console.error(err);
      setError('Error conectando al servidor: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Demo functions to switch views
  const viewJobDetails = (jobId) => {
    setSelectedJobId(jobId);
    setCurrentView('job-details');
  };

  const viewQuoteDetails = (quoteId) => {
    setSelectedQuoteId(quoteId);
    setCurrentView('quote-details');
  };

  const goHome = () => {
    setCurrentView('home');
  };

  if (!user) {
    return (
      <div className="container">
        <div className="card">
          <h1>🏗️ QuoteBot AI</h1>
          <p>Sistema de Cotización Inteligente con Cancelación de Trabajos y Levantamientos</p>
          <br />
          <button onClick={signIn} className="btn-primary">
            Iniciar Sesión con WorkOS
          </button>
        </div>
      </div>
    );
  }

  // Render different views based on currentView state
  if (currentView === 'job-details' && selectedJobId) {
    return (
      <div className="app-with-header">
        <header className="app-header">
          <div className="header-left">
            <button onClick={goHome} className="btn-back">← Volver</button>
            <h2>QuoteBot AI</h2>
          </div>
          <div className="header-right">
            <NotificationCenter userId={user?.id || user?.email} />
            <div className="user-info">
              <span>👤</span>
              <span>{user.firstName || user.email}</span>
            </div>
            <button onClick={signOut} className="btn-secondary">Salir</button>
          </div>
        </header>
        <JobDetailsView
          jobId={selectedJobId}
          currentUserId={user?.id || user?.email}
        />
      </div>
    );
  }

  if (currentView === 'quote-details' && selectedQuoteId) {
    return (
      <div className="app-with-header">
        <header className="app-header">
          <div className="header-left">
            <button onClick={goHome} className="btn-back">← Volver</button>
            <h2>QuoteBot AI</h2>
          </div>
          <div className="header-right">
            <NotificationCenter userId={user?.id || user?.email} />
            <div className="user-info">
              <span>👤</span>
              <span>{user.firstName || user.email}</span>
            </div>
            <button onClick={signOut} className="btn-secondary">Salir</button>
          </div>
        </header>
        <QuoteDetailsView
          quoteId={selectedQuoteId}
          currentContractorId={user?.id || user?.email}
        />
      </div>
    );
  }

  // Home view
  return (
    <div className="container">
      <div className="card">
        <div className="header-row">
          <div className="user-info">
            <span>👤</span>
            <span>{user.firstName || user.email}</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <NotificationCenter userId={user?.id || user?.email} />
            <button onClick={signOut} className="btn-secondary">
              Salir
            </button>
          </div>
        </div>

        <h2>Nueva Cotización</h2>

        <div className="input-group">
          <label className="label">Descripción del Trabajo</label>
          <textarea
            rows="4"
            className="textarea-field"
            placeholder="Ej: Reparación de puerta de madera en la entrada..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="photos" className="label">Fotos del Problema</label>
          <div className="file-input-wrapper">
            <input
              id="photos"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="photos" className="file-label-text">
              {files.length > 0 ? '📸 Agregar más fotos' : '📸 Haz clic para subir fotos'}
            </label>
          </div>

          {files.length > 0 && (
            <div className="file-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <span>{file.name}</span>
                  <button onClick={() => removeFile(index)} className="btn-remove">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleQuote} className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span> Analizando...
            </>
          ) : 'Obtener Cotización'}
        </button>

        {error && <div className="error-msg">{error}</div>}

        {quote !== null && (
          <div className="result-card">
            <h3>Costo Estimado (IA)</h3>
            <div className="price-tag">${Number(quote).toFixed(2)}</div>
            <p>Calculado por QuoteBot AI en Vultr.</p>
            {selectedJobId && (
              <button
                onClick={() => viewJobDetails(selectedJobId)}
                className="btn-view-details"
              >
                Ver Detalles del Trabajo
              </button>
            )}
          </div>
        )}

        {/* Demo buttons to test cancellation views */}
        <div className="demo-section">
          <h3>🧪 Demo: Probar Vistas de Cancelación</h3>
          <div className="demo-buttons">
            <button
              onClick={() => viewJobDetails(1)}
              className="btn-demo"
            >
              Ver Trabajo #1 (Cliente)
            </button>
            <button
              onClick={() => viewQuoteDetails(1)}
              className="btn-demo"
            >
              Ver Levantamiento #1 (Contratista)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthKitProvider
      clientId={WORKOS_CLIENT_ID}
      redirectUri="http://localhost:3000"
    >
      <QuoteBot />
    </AuthKitProvider>
  );
}
