import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import store from './store/index'
import { ToastProvider } from './components/common/Toast/Toast'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
)
