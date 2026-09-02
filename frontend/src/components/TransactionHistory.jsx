import React from 'react'

const RISK_COLOR = {
  LOW     : '#276b53',
  MEDIUM  : '#a67c00',
  HIGH    : '#8a2e2e',
  CRITICAL: '#731b1b',
}

export default function TransactionHistory({ records, onClear }) {
  if (!records || records.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)', fontSize: 13 }}>
        No predictions yet. Submit a transaction to get started.
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)' }}>
          {records.length} RECORD{records.length !== 1 ? 'S' : ''}
        </div>
        <button
          onClick={onClear}
          style={{
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 6, color: 'var(--text-dim)',
            padding: '4px 12px', fontSize: 11, cursor: 'pointer', letterSpacing: 1,
          }}
        >CLEAR ALL</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {records.map((r) => {
          const color = RISK_COLOR[r.risk_level] || '#888'
          return (
            <div key={r.transaction_id} style={{
              display: 'grid',
              gridTemplateColumns: '90px 1fr auto auto',
              alignItems: 'center',
              gap: 12,
              background: 'transparent',
              border: `1px solid ${r.is_fraud ? color + '44' : 'var(--border-bright)'}`,
              borderRadius: 8,
              padding: '14px 16px',
            }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>ID</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                  #{r.transaction_id}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  ${r.amount?.toFixed(2)}
                  {r.merchant && <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 8 }}>· {r.merchant}</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2, fontFamily: 'var(--mono)' }}>
                  {new Date(r.timestamp).toLocaleTimeString()} · {r.latency_ms?.toFixed(1)}ms
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, letterSpacing: 0.5, textTransform: 'uppercase' }}>PROB</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 500, color }}>
                  {(r.fraud_probability * 100).toFixed(1)}%
                </div>
              </div>
              <div style={{
                background: color + '18',
                border: `1px solid ${color}44`,
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 10,
                color,
                letterSpacing: 1,
                fontWeight: 700,
                textAlign: 'center',
                minWidth: 72,
              }}>
                {r.risk_level}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
