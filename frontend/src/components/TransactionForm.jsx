import React, { useState } from 'react'
import { PRESETS } from '../api'

const inputStyle = {
  background: 'transparent',
  border: '1px solid var(--border-bright)',
  borderRadius: 4,
  color: 'var(--text)',
  padding: '10px 14px',
  fontSize: 14,
  fontFamily: 'var(--sans)',
  width: '100%',
  outline: 'none',
  transition: 'all 0.3s ease',
}

const labelStyle = {
  fontSize: 12,
  color: 'var(--text-muted)',
  letterSpacing: 0.5,
  marginBottom: 6,
  display: 'block',
}

function Field({ label, name, value, onChange, type = 'number', step }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        style={inputStyle}
        type={type}
        step={step || 'any'}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}

const INITIAL = {
  V1:0,V2:0,V3:0,V4:0,V5:0,V6:0,V7:0,V8:0,V9:0,V10:0,
  V11:0,V12:0,V13:0,V14:0,V15:0,V16:0,V17:0,V18:0,V19:0,V20:0,
  V21:0,V22:0,V23:0,V24:0,V25:0,V26:0,V27:0,V28:0,
  Amount:150,Time:50000,
  merchant:'',card_last4:'',location:'',
}

export default function TransactionForm({ onSubmit, loading }) {
  const [form, setForm] = useState(INITIAL)
  const [showPCA, setShowPCA] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: ['merchant','card_last4','location'].includes(name) ? value : parseFloat(value) || 0,
    }))
  }

  const loadPreset = (key) => {
    setForm({ ...INITIAL, ...PRESETS[key].data })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  const vFeatures = Array.from({ length: 28 }, (_, i) => `V${i + 1}`)

  return (
    <form onSubmit={handleSubmit}>
      {/* Presets */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Quick Presets</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(PRESETS).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              onClick={() => loadPreset(key)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-bright)',
                borderRadius: 4,
                color: 'var(--text-muted)',
                padding: '8px 16px',
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'var(--sans)',
              }}
              onMouseEnter={e => { e.target.style.borderColor='var(--accent)'; e.target.style.color='var(--accent)' }}
              onMouseLeave={e => { e.target.style.borderColor='var(--border-bright)'; e.target.style.color='var(--text-muted)' }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction info */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Transaction Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <Field label="AMOUNT ($)" name="Amount" value={form.Amount} onChange={handleChange} step="0.01" />
          <Field label="TIME (seconds from start)" name="Time" value={form.Time} onChange={handleChange} step="1" />
          <Field label="MERCHANT" name="merchant" value={form.merchant} onChange={handleChange} type="text" />
          <Field label="CARD LAST 4 DIGITS" name="card_last4" value={form.card_last4} onChange={handleChange} type="text" />
        </div>
      </div>

      {/* PCA features toggle */}
      <div style={{ marginBottom: 32, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
        <button
          type="button"
          onClick={() => setShowPCA(!showPCA)}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text)',
            padding: 0, fontSize: 13, cursor: 'pointer',
            letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--serif)', fontWeight: 500
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>{showPCA ? '–' : '+'}</span>
          Advanced PCA Features
        </button>

        {showPCA && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 10 }}>
              These are PCA-transformed features (anonymized). V14, V4, V12 are most predictive of fraud.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {vFeatures.map(v => (
                <Field key={v} label={v} name={v} value={form[v]} onChange={handleChange} step="0.0001" />
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          background: loading ? 'var(--border-bright)' : 'var(--accent)',
          color: loading ? 'var(--text-muted)' : '#ffffff',
          border: 'none',
          borderRadius: 8,
          padding: '16px 24px',
          fontSize: 16,
          fontWeight: 400,
          fontFamily: 'var(--serif)',
          cursor: loading ? 'not-allowed' : 'pointer',
          letterSpacing: 0.5,
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(44,62,80,0.15)'
        }}
      >
        {loading ? 'Analyzing...' : 'Analyze Transaction'}
      </button>
    </form>
  )
}
