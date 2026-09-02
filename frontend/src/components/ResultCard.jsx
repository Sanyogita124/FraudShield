import React from 'react'

const RISK_CONFIG = {
  LOW      : { color: '#276b53', bg: 'rgba(39,107,83,0.08)',  label: 'LEGITIMATE',  icon: '✓' },
  MEDIUM   : { color: '#a67c00', bg: 'rgba(166,124,0,0.08)',  label: 'SUSPICIOUS',  icon: '!' },
  HIGH     : { color: '#8a2e2e', bg: 'rgba(138,46,46,0.08)',  label: 'HIGH RISK',   icon: '✕' },
  CRITICAL : { color: '#731b1b', bg: 'rgba(115,27,27,0.12)',   label: 'FRAUD',       icon: '✕' },
}

export default function ResultCard({ result, onClear }) {
  if (!result) return null
  const cfg = RISK_CONFIG[result.risk_level] || RISK_CONFIG.LOW

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.color}33`,
      borderRadius: 12,
      padding: '32px',
      marginTop: 24,
      position: 'relative',
      boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: cfg.color + '22',
            border: `1px solid ${cfg.color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: cfg.color, fontWeight: 500, fontFamily: 'var(--serif)'
          }}>{cfg.icon}</div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase' }}>Verdict</div>
            <div style={{ fontSize: 28, fontFamily: 'var(--serif)', fontWeight: 600, color: cfg.color }}>{cfg.label}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' }}>Transaction ID</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: cfg.color }}>#{result.transaction_id}</div>
        </div>
      </div>

      {/* Probability bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-muted)' }}>
          <span>Fraud Probability</span>
          <span style={{ color: cfg.color, fontFamily: 'var(--mono)', fontWeight: 500 }}>
            {(result.fraud_probability * 100).toFixed(2)}%
          </span>
        </div>
        <div style={{ background: 'var(--border)', borderRadius: 2, height: 6, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${result.fraud_probability * 100}%`,
            background: cfg.color,
            borderRadius: 2,
            transition: 'width 0.6s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--text-dim)' }}>
          <span>0% (Safe)</span>
          <span style={{ color: 'var(--text-muted)' }}>Threshold: {(result.threshold_used * 100).toFixed(1)}%</span>
          <span>100% (Fraud)</span>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { label: 'Amount',      value: `$${result.amount.toFixed(2)}` },
          { label: 'Latency',     value: `${result.latency_ms.toFixed(1)}ms` },
          { label: 'Confidence',  value: `${(result.confidence * 100).toFixed(1)}%` },
          { label: 'Risk Level',  value: result.risk_level },
          { label: 'Merchant',    value: result.merchant || '—' },
          { label: 'Card',        value: result.card_last4 ? `•••• ${result.card_last4}` : '—' },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-bright)',
            borderRadius: 8,
            padding: '12px 14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: 14, fontFamily: 'var(--serif)', color: 'var(--text)' }}>{value}</div>
          </div>
        ))}
      </div>

      <button
        onClick={onClear}
        style={{
          marginTop: 20, background: 'none',
          border: '1px solid var(--border)', borderRadius: 8,
          color: 'var(--text-muted)', padding: '8px 16px',
          fontSize: 12, cursor: 'pointer', letterSpacing: 1,
        }}
      >CLEAR RESULT</button>
    </div>
  )
}
