import React from 'react'

export default function Home({ onStart }) {
  return (
    <div style={{
      flex: 1,
      minHeight: 'calc(100vh - 70px)',
      background: 'var(--bg)',
      display: 'grid',
      gridTemplateColumns: 'minmax(400px, 1fr) 1fr',
      overflow: 'hidden'
    }}>
      {/* Editorial Image Panel */}
      <div 
        className="fade-up"
        style={{ 
          position: 'relative',
          padding: '60px',
          animationDelay: '0s'
        }}
      >
        <div style={{
          height: '100%',
          width: '100%',
          backgroundImage: 'url(/custom_hero.jpg)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#0d1b2a' // Adding a dark background fallback referencing the image's dark navy tone.
        }}>
        </div>
      </div>

      {/* Content Panel */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 80px',
      }}>
        <div className="fade-up" style={{ animationDelay: '0.2s', maxWidth: 640 }}>
          <div style={{ 
            fontSize: 12, 
            color: 'var(--accent)', 
            letterSpacing: 3, 
            textTransform: 'uppercase', 
            marginBottom: 24,
            fontFamily: 'var(--sans)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{ width: 24, height: 1, background: 'var(--accent)' }} />
            Intelligence Engine
          </div>
          
          <h1 style={{ 
            fontSize: 72, 
            fontFamily: 'var(--serif)', 
            fontWeight: 400, 
            color: 'var(--text)', 
            lineHeight: 1.05,
            marginBottom: 32,
            letterSpacing: -1
          }}>
            Redefining <br/>Transaction <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Security.</span>
          </h1>
          
          <p style={{ 
            fontSize: 17, 
            color: 'var(--text-muted)', 
            lineHeight: 1.7, 
            marginBottom: 48,
            fontFamily: 'var(--sans)'
          }}>
            Powered by state-of-the-art XGBoost algorithms, FraudShield identifies suspicious patterns natively and provides comprehensive risk insights with absolute precision. Elegantly crafted for supreme decision-making.
          </p>

          <button 
            onClick={onStart}
            style={{
              background: 'var(--accent)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 4,
              padding: '20px 40px',
              fontSize: 16,
              fontFamily: 'var(--serif)',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 8px 30px rgba(44,62,80,0.2)',
              letterSpacing: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(44,62,80,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(44,62,80,0.2)'; }}
          >
            Launch Analyzer
            <span style={{ fontSize: 24, lineHeight: 0.5, fontWeight: 300 }}>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
