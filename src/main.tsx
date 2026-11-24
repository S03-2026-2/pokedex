import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AppErrorBoundary from './components/AppErrorBoundary'
import { PokeApiAdapter } from './services/pokeapi/poke-api.adapter'
import './index.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Elemento #root não encontrado.')
}

const pokemonProvider = new PokeApiAdapter()

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App pokemonProvider={pokemonProvider} />
    </AppErrorBoundary>
  </React.StrictMode>,
)
