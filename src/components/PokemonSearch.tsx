import { Loader2, Search } from "lucide-react";

interface PokemonSearchProps {
  value: string;
  isLoading: boolean;
  onChange: (value: string) => void;
}

export default function PokemonSearch({ value, isLoading, onChange }: PokemonSearchProps) {
  return (
    <div className="search-input-wrapper">
      <Search className="search-icon" size={20} />
      <input
        type="text"
        placeholder="Pesquisar por trecho do nome ou ID (ex: char, pika, 150)..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="search-input"
      />
      {isLoading ? (
        <Loader2 className="clear-search-btn spin-icon" size={18} style={{ right: "16px" }} />
      ) : value ? (
        <button className="clear-search-btn" onClick={() => onChange("")}>
          ×
        </button>
      ) : null}
    </div>
  );
}
