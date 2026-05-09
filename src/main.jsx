import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SelfOrder from './SelfOrder.jsx'

// If URL has ?rid= param, show customer self-order page
const params = new URLSearchParams(window.location.search);
const isSelfOrder = params.has('rid');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isSelfOrder ? <SelfOrder /> : <App />}
  </StrictMode>,
)
