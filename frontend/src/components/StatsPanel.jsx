import React from 'react'
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'

function StatBox({ label, value, sub, color = 'var(--accent)' }) {
  return (
    <div style={{
      padding: '16px 0',
      borderBottom: '1px solid var(--border-bright)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 400, color, fontFamily: 'var(--serif)', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>{sub}</div>}
    </div>
  )
}

export default function StatsPanel({ stats, history }) {
  if (!stats) return (
    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)', fontSize: 13 }}>
      Loading stats...
    </div>
  )

  const { model, dataset, session } = stats

  // Feature importance data
  const featData = (model.top_features || []).slice(0, 8).map(([name, val]) => ({
    name, value: Math.round(val * 1000) / 10,
  }))

  // History trend data
  const histItems = [...(history || [])].reverse().slice(-20)
  const trendData = histItems.map((r, i) => ({
    i: i + 1,
    prob: Math.round(r.fraud_probability * 100),
    fraud: r.is_fraud ? 1 : 0,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Model metrics */}
      <section>
        <div style={{ fontSize: 12, letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Model Analytics</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', columnGap: 24 }}>
          <StatBox label="ROC-AUC" value={model.roc_auc} sub="Area under ROC" color="var(--accent)" />
          <StatBox label="PR-AUC" value={model.pr_auc} sub="Area under P-R" color="#5a7a96" />
          <StatBox label="F1 SCORE" value={model.f1_score} sub={`Threshold: ${model.threshold?.toFixed(3)}`} color="var(--warn)" />
          <StatBox label="BEST ITERATION" value={model.best_iteration} sub="Early stopped" color="var(--text-muted)" />
        </div>
      </section>

      {/* Dataset stats */}
      <section>
        <div style={{ fontSize: 12, letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Dataset Baseline</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', columnGap: 24 }}>
          <StatBox label="TOTAL TXNS" value={dataset.total_transactions?.toLocaleString()} color="var(--text)" />
          <StatBox label="FRAUD CASES" value={dataset.fraud_transactions?.toLocaleString()} sub={`${dataset.fraud_rate_pct}% of total`} color="var(--danger)" />
        </div>
      </section>

      {/* Session stats */}
      <section>
        <div style={{ fontSize: 12, letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Session Activity</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', columnGap: 16 }}>
          <StatBox label="PREDICTIONS" value={session.predictions_made} color="var(--text)" />
          <StatBox label="FLAGGED" value={session.fraud_detected} color="var(--danger)" />
          <StatBox label="AVG SPEED" value={`${session.avg_latency_ms}ms`} color="var(--accent)" />
        </div>
      </section>

      {trendData.length > 1 && (
        <section>
          <div style={{ fontSize: 12, letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Probability Trend</div>
          <div style={{ margin: '0 -8px' }}>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a94442" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#a94442" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="i" tick={{ fill: '#737373', fontSize: 10 }} axisLine={{ stroke: 'transparent' }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#737373', fontSize: 10 }} unit="%" axisLine={{ stroke: 'transparent' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid var(--border-bright)', borderRadius: 4, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  formatter={(v) => [`${v}%`, 'Probability']}
                />
                <Area type="monotone" dataKey="prob" stroke="#a94442" fill="url(#probGrad)" strokeWidth={1.5} dot={{ fill: '#a94442', r: 2, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {featData.length > 0 && (
        <section>
          <div style={{ fontSize: 12, letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Top Contributors</div>
          <div>
            {featData.map(({ name, value }, i) => (
              <div key={name} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{name}</span>
                  <span style={{ color: 'var(--text-dim)' }}>{value}%</span>
                </div>
                <div style={{ background: 'var(--surface2)', borderRadius: 2, height: 3 }}>
                  <div style={{
                    width: `${(value / featData[0].value) * 100}%`,
                    height: '100%', borderRadius: 2,
                    background: i < 3 ? 'var(--accent)' : 'var(--border-bright)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
