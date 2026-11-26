import "./PokemonHeader.css";
import { Heart } from "lucide-react";

interface PokemonHeaderProps {
  totalCount: number | null;
  favoriteCount: number | null;
}

export default function PokemonHeader({ totalCount, favoriteCount }: PokemonHeaderProps) {
  return (
    <header className="pokedex-header glass-panel">
      <div className="header-brand">
        <div className="pokeball-logo">
          <div className="pokeball-top" />
          <div className="pokeball-center" />
          <div className="pokeball-bottom" />
        </div>
        <div>
          <h1 className="header-title">
            CYBER<span className="text-highlight">DEX</span>
          </h1>
          <p className="header-subtitle">Pokédex Oficial PokéAPI em Tempo Real</p>
        </div>
      </div>

      <div className="header-stats">
        <div className="stat-pill">
          <span className="stat-pill-num">{totalCount ?? "—"}</span>
          <span className="stat-pill-label">Total PokéAPI</span>
        </div>
        <div className="stat-pill accent">
          <Heart size={14} fill="#ff3b5c" color="#ff3b5c" />
          <span className="stat-pill-num">{favoriteCount ?? "—"}</span>
          <span className="stat-pill-label">Favoritos</span>
        </div>
      </div>
    </header>
  );
}
