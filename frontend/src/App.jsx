import React, { useState, useEffect, useCallback } from 'react'
import Home from './components/Home'
import TransactionForm from './components/TransactionForm'
import ResultCard from './components/ResultCard'
import StatsPanel from './components/StatsPanel'
import TransactionHistory from './components/TransactionHistory'
import { predictTransaction, getStats, getHistory, clearHistory } from './api'

const TAB_STYLE = (active) => ({
  background: 'none',
  border: 'none',
  borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
  color: active ? 'var(--accent)' : 'var(--text-muted)',
  padding: '12px 24px',
  fontSize: 13,
  fontFamily: 'var(--sans)',
  fontWeight: active ? 500 : 400,
  letterSpacing: 1,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
})

export default function App() {
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [stats, setStats]       = useState(null)
  const [history, setHistory]   = useState([])
  const [tab, setTab]           = useState('predict')
  const [view, setView]         = useState('home')
  const [backendOk, setBackendOk] = useState(null)

  const refreshData = useCallback(async () => {
    try {
      const [s, h] = await Promise.all([getStats(), getHistory(50)])
      setStats(s.data)
      setHistory(h.data.records)
      setBackendOk(true)
    } catch {
      setBackendOk(false)
    }
  }, [])

  useEffect(() => {
    refreshData()
    const id = setInterval(refreshData, 10000)
    return () => clearInterval(id)
  }, [refreshData])

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    try {
      const res = await predictTransaction(formData)
      setResult(res.data)
      refreshData()
    } catch (e) {
      setError(e.response?.data?.detail || 'Backend unreachable. Is the server running on port 8000?')
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = async () => {
    await clearHistory()
    setHistory([])
    refreshData()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 70,
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <div 
          onClick={() => setView('home')}
          style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
        >
          <div style={{
            width: 38, height: 38,
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: 'var(--accent)', fontFamily: 'var(--serif)', fontStyle: 'italic'
          }}>F</div>
          <div>
            <div style={{ fontSize: 18, fontFamily: 'var(--serif)', fontWeight: 600, letterSpacing: 0.5 }}>FraudShield</div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 1.5, textTransform: 'uppercase' }}>XGBoost Analytics</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: backendOk === null ? '#888' : backendOk ? 'var(--accent)' : 'var(--danger)',
          }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1 }}>
            {backendOk === null ? 'CONNECTING' : backendOk ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </header>

      {/* Backend offline warning */}
      {backendOk === false && (
        <div style={{
          background: 'rgba(255,69,96,0.1)',
          border: '1px solid rgba(255,69,96,0.3)',
          borderRadius: 0,
          padding: '10px 32px',
          fontSize: 13,
          color: '#ff4560',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>⚠</span>
          Backend not connected. Run <code style={{ fontFamily:'var(--mono)', background:'rgba(255,255,255,0.1)', padding:'2px 6px', borderRadius:4 }}>uvicorn main:app --reload --port 8000</code> in the backend folder.
        </div>
      )}

      {/* Core Views */}
      {view === 'home' ? (
        <Home onStart={() => setView('dashboard')} />
      ) : (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 900,
          width: '100%',
          margin: '0 auto',
          padding: '48px 32px',
          alignItems: 'stretch',
        }}>

        {/* Left column */}
        <div className="fade-up" style={{ animationDelay: '0s' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 28, gap: 4 }}>
            <button style={TAB_STYLE(tab === 'predict')} onClick={() => setTab('predict')}>PREDICT</button>
            <button style={TAB_STYLE(tab === 'history')} onClick={() => setTab('history')}>
              HISTORY
              {history.length > 0 && (
                <span style={{
                  marginLeft: 8, background: 'var(--surface2)',
                  border: '1px solid var(--border)', borderRadius: 10,
                  padding: '1px 7px', fontSize: 10, color: 'var(--text-muted)',
                }}>{history.length}</span>
              )}
            </button>
            <button style={TAB_STYLE(tab === 'metrics')} onClick={() => setTab('metrics')}>METRICS</button>
          </div>

          {tab === 'predict' && (
            <>
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '32px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
              }}>
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 22, fontFamily: 'var(--serif)', fontWeight: 500, marginBottom: 8 }}>Analyze Transaction</h2>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Submit a transaction to the XGBoost model for real-time fraud detection.
                    Select a preset below to populate sample data.
                  </p>
                </div>

                {error && (
                  <div style={{
                    background: 'var(--danger-dim)',
                    border: '1px solid rgba(255,69,96,0.3)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    marginBottom: 20,
                    fontSize: 13,
                    color: 'var(--danger)',
                  }}>⚠ {error}</div>
                )}

                <TransactionForm onSubmit={handleSubmit} loading={loading} />
              </div>

              <ResultCard result={result} onClear={() => setResult(null)} />
            </>
          )}

          {tab === 'history' && (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontFamily: 'var(--serif)', fontWeight: 500, marginBottom: 8 }}>Prediction History</h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  Recent predictions made during this session. Automatically refreshes.
                </p>
              </div>
              <TransactionHistory records={history} onClear={handleClearHistory} />
            </div>
          )}
        </div>

          {tab === 'metrics' && (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontFamily: 'var(--serif)', fontWeight: 500, marginBottom: 8 }}>Model Metrics</h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Live predictive performance data and telemetry.</p>
              </div>
              <StatsPanel stats={stats} history={history} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
