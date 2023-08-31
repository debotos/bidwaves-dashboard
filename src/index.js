import React from 'react'
import { createRoot } from 'react-dom/client'
import HttpsRedirect from 'react-https-redirect'

import 'react-perfect-scrollbar/dist/css/styles.css'

import App from './App'

window.log = function (...args) {
  if (window.location.hostname === 'localhost') {
    console.log(...args)
  }
}

const root = createRoot(document.getElementById('root'))
root.render(
  <HttpsRedirect>
    <App />
  </HttpsRedirect>
)
