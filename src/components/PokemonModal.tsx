import React from 'react';
import { Volume2, Sparkles, Heart, Zap, Swords, Loader2 } from 'lucide-react';
import { getTypeStyle } from '../data/pokemon';
import type { Pokemon, PokemonDetails } from '../types/pokemon';

interface PokemonModalProps {
  pokemon: (Pokemon & Partial<PokemonDetails>) | null;
  isLoading: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

interface StatRowProps {
  label: string;
  value?: number;
  max?: number;
  color: string;
}

export default function PokemonModal({ pokemon, isLoading, onClose, isFavorite, onToggleFavorite }: PokemonModalProps) {
  if (!pokemon) return null;

  const playCry = () => {
    if (pokemon.cries) {
      const audio = new Audio(pokemon.cries);
      audio.play().catch(() => {});
    }
  };

  const typeStyle = getTypeStyle(pokemon.types[0]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header bar */}
        <div className="modal-header">
          <div className="pokemon-id-tag">
            #{String(pokemon.id).padStart(3, '0')}
          </div>
          <div className="modal-actions">
            <button 
              className={`fav-btn ${isFavorite ? 'active' : ''}`}
              onClick={() => onToggleFavorite(pokemon.id)}
              title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Heart size={20} fill={isFavorite ? "#ff3b5c" : "none"} color={isFavorite ? "#ff3b5c" : "currentColor"} />
            </button>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="modal-hero" style={{ background: typeStyle.gradient }}>
          <div className="hero-bg-text">{pokemon.japaneseName || pokemon.name}</div>
          
          <img 
            src={pokemon.sprite ?? undefined}
            alt={pokemon.name} 
            className="modal-artwork float-img"
          />

          {pokemon.animatedSprite && (
            <div className="animated-preview-badge">
              <img src={pokemon.animatedSprite} alt="sprite" />
              <span>Animação de Batalha</span>
            </div>
          )}
        </div>

        {/* Info Content */}
        <div className="modal-body">
          {isLoading ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <Loader2 size={36} color="#ff3b5c" className="spin-icon" />
              <p>Buscando detalhes avançados na PokéAPI...</p>
            </div>
          ) : (
            <>
              <div className="title-row">
                <div>
                  <h2 className="pokemon-name">{pokemon.name}</h2>
                  <span className="category-tag">Pokémon {pokemon.category || 'Selvagem'}</span>
                </div>
                {pokemon.cries && (
                  <button className="cry-btn" onClick={playCry} title="Ouvir rugido">
                    <Volume2 size={18} />
                    <span>Voz</span>
                  </button>
                )}
              </div>

              {/* Types */}
              <div className="types-container">
                {pokemon.types && pokemon.types.map((type) => {
                  const style = getTypeStyle(type);
                  return (
                    <span 
                      key={type} 
                      className="type-badge" 
                      style={{ backgroundColor: style.bg, color: style.text }}
                    >
                      {type}
                    </span>
                  );
                })}
              </div>

              {/* Physical specs */}
              <div className="specs-grid">
                <div className="spec-card">
                  <span className="spec-label">ALTURA</span>
                  <span className="spec-value">{pokemon.height} m</span>
                </div>
                <div className="spec-card">
                  <span className="spec-label">PESO</span>
                  <span className="spec-value">{pokemon.weight} kg</span>
                </div>
                <div className="spec-card">
                  <span className="spec-label">HABITAT</span>
                  <span className="spec-value">{pokemon.habitat || 'N/A'}</span>
                </div>
                <div className="spec-card">
                  <span className="spec-label">GERAÇÃO</span>
                  <span className="spec-value">Gen {pokemon.generation || 'I'}</span>
                </div>
              </div>

              {/* Description */}
              <div className="description-box">
                <p>{pokemon.description || "Descrição em carregamento..."}</p>
              </div>

              {/* Stats Bar */}
              {pokemon.stats && (
                <>
                  <div className="section-title">
                    <Sparkles size={16} color="#ff3b5c" />
                    <span>Estatísticas de Base</span>
                  </div>

                  <div className="stats-list">
                    <StatRow label="HP" value={pokemon.stats.hp} max={255} color="#ef4444" />
                    <StatRow label="Ataque" value={pokemon.stats.attack} max={255} color="#f97316" />
                    <StatRow label="Defesa" value={pokemon.stats.defense} max={255} color="#eab308" />
                    <StatRow label="Sp. Atk" value={pokemon.stats.spAtk} max={255} color="#3b82f6" />
                    <StatRow label="Sp. Def" value={pokemon.stats.spDef} max={255} color="#10b981" />
                    <StatRow label="Velocidade" value={pokemon.stats.speed} max={255} color="#ec4899" />
                  </div>
                </>
              )}

              {/* Abilities */}
              {pokemon.abilities && pokemon.abilities.length > 0 && (
                <>
                  <div className="section-title" style={{ marginTop: '20px' }}>
                    <Zap size={16} color="#eab308" />
                    <span>Habilidades</span>
                  </div>
                  <div className="abilities-list">
                    {pokemon.abilities.map((ab, idx) => (
                      <div key={idx} className="ability-card">
                        <span className="ability-name">{ab.name}</span>
                        <span className="ability-desc">{ab.description}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Evolution Chain */}
              {pokemon.evolutions && pokemon.evolutions.length > 0 && (
                <>
                  <div className="section-title" style={{ marginTop: '20px' }}>
                    <Swords size={16} color="#6366f1" />
                    <span>Cadeia Evolutiva</span>
                  </div>
                  <div className="evolution-chain">
                    {pokemon.evolutions.map((evo, i) => (
                      <React.Fragment key={evo.id}>
                        {i > 0 && <div className="evo-arrow">➜</div>}
                        <div className={`evo-item ${evo.id === pokemon.id ? 'current' : ''}`}>
                          <img src={evo.sprite} alt={evo.name} />
                          <span className="evo-name">{evo.name}</span>
                          <span className="evo-req">{typeof evo.level === 'number' ? `Nvl ${evo.level}` : evo.level}</span>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value = 0, max = 255, color }: StatRowProps) {
  const percentage = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      <div className="stat-bar-bg">
        <div 
          className="stat-bar-fill" 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
