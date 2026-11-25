import type { ReactNode } from "react";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import type { PokemonSummary } from "../types/pokemon";
import PokemonCard from "./PokemonCard";

interface PokemonResultsProps {
  status: "loading" | "error" | "not-found" | "success";
  pokemon: readonly PokemonSummary[];
  searchTerm: string | null;
  currentPage: number;
  isFavorite: (id: number) => boolean;
  onToggleFavorite: (id: number) => void;
  onSelectPokemon: (pokemon: PokemonSummary) => void;
  onRetry: () => void;
  onClearFilters: () => void;
  children?: ReactNode;
}

export default function PokemonResults({
  status,
  pokemon,
  searchTerm,
  currentPage,
  isFavorite,
  onToggleFavorite,
  onSelectPokemon,
  onRetry,
  onClearFilters,
  children,
}: PokemonResultsProps) {
  if (status === "loading") {
    return (
      <div className="empty-state glass-panel">
        <Loader2 size={48} color="#ff3b5c" className="spin-icon" />
        <h3>
          {searchTerm !== null
            ? `Buscando "${searchTerm}" na PokéAPI...`
            : `Carregando Página ${currentPage}...`}
        </h3>
        <p>Aguarde um instante...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="empty-state glass-panel" role="alert">
        <h3>{searchTerm !== null ? "Falha na busca" : "Falha ao carregar a página"}</h3>
        <p>Tente novamente para consultar a PokéAPI.</p>
        <button type="button" className="reset-filters-btn" onClick={onRetry}>
          <RefreshCw size={16} />
          <span>Tentar novamente</span>
        </button>
      </div>
    );
  }

  if (pokemon.length === 0) {
    return (
      <div className="empty-state glass-panel">
        <Sparkles size={48} color="#ff3b5c" />
        <h3>Nenhum Pokémon Encontrado</h3>
        <p>
          {status === "not-found" && searchTerm !== null
            ? `Nenhum Pokémon encontrado com "${searchTerm}".`
            : "Tente buscar por outro nome, ID ou ajuste os filtros de tipo."}
        </p>
        <button className="reset-filters-btn" onClick={onClearFilters}>
          <RefreshCw size={16} />
          <span>Limpar Filtros</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="pokemon-grid">
        {pokemon.map((entry) => (
          <PokemonCard
            key={entry.id}
            pokemon={entry}
            isFavorite={isFavorite(entry.id)}
            onToggleFavorite={onToggleFavorite}
            onClick={onSelectPokemon}
          />
        ))}
      </div>
      {children}
    </>
  );
}
