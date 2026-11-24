import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AppErrorBoundary from './components/AppErrorBoundary'
import { CachedPokemonProvider } from './services/cache/cached-pokemon.provider'
import { PokeApiAdapter } from './services/pokeapi/poke-api.adapter'
import { LocalStorageFavoritesAdapter } from './services/storage/local-storage-favorites.adapter'
import './index.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Elemento #root não encontrado.')
}

const pokemonProvider = new CachedPokemonProvider(new PokeApiAdapter())
const favoritesStorage = new LocalStorageFavoritesAdapter()

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App pokemonProvider={pokemonProvider} favoritesStorage={favoritesStorage} />
    </AppErrorBoundary>
  </React.StrictMode>,
)
