import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const predictTransaction = (data) => api.post('/predict', data)
export const predictBatch       = (transactions) => api.post('/predict/batch', { transactions })
export const getStats           = () => api.get('/stats')
export const getHistory         = (limit = 50) => api.get(`/history?limit=${limit}`)
export const clearHistory       = () => api.delete('/history')
export const healthCheck        = () => api.get('/')

// Demo transaction presets
export const PRESETS = {
  normal: {
    label: 'Normal transaction',
    data: {
      V1: -1.36, V2: -0.07, V3: 2.54, V4: 1.38, V5: -0.34,
      V6: 0.46, V7: 0.24, V8: 0.10, V9: 0.36, V10: 0.09,
      V11: -0.55, V12: -0.62, V13: -0.99, V14: -0.31, V15: 1.47,
      V16: -0.47, V17: 0.21, V18: 0.03, V19: 0.40, V20: 0.25,
      V21: -0.02, V22: 0.28, V23: -0.11, V24: 0.07, V25: 0.13,
      V26: -0.19, V27: 0.13, V28: -0.02,
      Amount: 149.62, Time: 0,
      merchant: 'Amazon', card_last4: '4242', location: 'New York, US',
    }
  },
  suspicious: {
    label: 'Suspicious transaction',
    data: {
      V1: -3.04, V2: -3.16, V3: 1.09, V4: 2.29, V5: -1.36,
      V6: -1.47, V7: -3.65, V8: 0.75, V9: -0.57, V10: -2.39,
      V11: 2.04, V12: -4.79, V13: 0.39, V14: -5.38, V15: 0.31,
      V16: -1.17, V17: -1.55, V18: -0.97, V19: -0.40, V20: -0.33,
      V21: -0.29, V22: -0.16, V23: -0.01, V24: 0.25, V25: 0.03,
      V26: 0.56, V27: 0.08, V28: 0.09,
      Amount: 1299.00, Time: 3600,
      merchant: 'Unknown Crypto Exchange', card_last4: '9999', location: 'Lagos, NG',
    }
  },
  highAmount: {
    label: 'High amount',
    data: {
      V1: 1.19, V2: 0.26, V3: 0.17, V4: 0.45, V5: -0.24,
      V6: -0.47, V7: 0.60, V8: -0.06, V9: -0.27, V10: -0.82,
      V11: -0.33, V12: 0.08, V13: 0.17, V14: 0.16, V15: 0.04,
      V16: -0.05, V17: -0.15, V18: 0.07, V19: 0.24, V20: 0.05,
      V21: 0.09, V22: -0.33, V23: -0.05, V24: -0.23, V25: 0.08,
      V26: -0.07, V27: 0.11, V28: 0.01,
      Amount: 4500.00, Time: 86400,
      merchant: 'Luxury Goods Store', card_last4: '1234', location: 'Miami, US',
    }
  }
}
