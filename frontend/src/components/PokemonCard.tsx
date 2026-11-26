import './PokemonCard.css';
import { Heart, Eye, LockKeyhole } from 'lucide-react';
import { getTypeStyle } from '../data/pokemon';
import type { PokemonSummary } from '../types/pokemon';

interface PokemonCardProps {
  id: number;
  pokemon: PokemonSummary | null;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onClick: (pokemon: PokemonSummary) => void;
}

export default function PokemonCard({ id, pokemon, isFavorite, onToggleFavorite, onClick }: PokemonCardProps) {
  const number = "#" + String(id).padStart(3, "0");
  if (!pokemon) {
    return (
      <article className="pokemon-card locked-card glass-panel animate-fade" aria-label={"Pokémon bloqueado " + number}>
        <span className="card-id">{number}</span>
        <div className="card-image-wrapper" aria-hidden="true"><LockKeyhole size={48} /></div>
        <h3 className="card-title">???</h3>
      </article>
    );
  }

  const typeStyle = getTypeStyle(pokemon.types[0]);

  return (
    <div 
      className="pokemon-card glass-panel animate-fade"
      onClick={() => onClick(pokemon)}
    >
      {/* Background card accent glow */}
      <div 
        className="card-glow" 
        style={{ background: `radial-gradient(circle at 50% 30%, ${typeStyle.bg}33, transparent 70%)` }} 
      />

      {/* Header with ID and Favorite button */}
      <div className="card-header">
        <span className="card-id">{number}</span>
        <button 
          className={`card-fav-btn ${isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(pokemon.id);
          }}
        >
          <Heart size={18} fill={isFavorite ? "#ff3b5c" : "none"} color={isFavorite ? "#ff3b5c" : "currentColor"} />
        </button>
      </div>

      {/* Image Artwork Container */}
      <div className="card-image-wrapper">
        <img 
          src={pokemon.sprite ?? undefined}
          alt={pokemon.name} 
          className="card-image" 
          loading="lazy"
        />
      </div>

      {/* Basic Details */}
      <div className="card-details">
        <h3 className="card-title">{pokemon.name}</h3>
        
        {/* Type pills */}
        <div className="card-types">
          {pokemon.types.map((type) => {
            const style = getTypeStyle(type);
            return (
              <span 
                key={type} 
                className="card-type-pill" 
                style={{ backgroundColor: style.bg, color: style.text }}
              >
                {type}
              </span>
            );
          })}
        </div>

        {/* Mini stats preview */}
        <div className="card-stats-preview">
          <div className="mini-stat">
            <span className="mini-stat-label">HP</span>
            <span className="mini-stat-val">{pokemon.stats.hp}</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-label">ATK</span>
            <span className="mini-stat-val">{pokemon.stats.attack}</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-label">DEF</span>
            <span className="mini-stat-val">{pokemon.stats.defense}</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-label">SPD</span>
            <span className="mini-stat-val">{pokemon.stats.speed}</span>
          </div>
        </div>
      </div>

      {/* Hover prompt footer */}
      <div className="card-footer">
        <span>Ver Detalhes Completos</span>
        <Eye size={14} />
      </div>
    </div>
  );
}
