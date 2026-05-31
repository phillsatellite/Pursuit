import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// mount the React app into the #root div from index.html. StrictMode is a
// dev-only helper that double-invokes effects to flush out bugs; it compiles
// out of the production build.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
