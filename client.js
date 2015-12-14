import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/app'

window.addEventListener('load', function load(e) {
    let origin = document.getElementById('origin')
    ReactDOM.render(<App />, origin)

    window.removeEventListener('load', load, false)
}, false)
