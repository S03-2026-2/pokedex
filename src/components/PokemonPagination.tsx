import { ChevronLeft, ChevronRight } from "lucide-react";

interface PokemonPaginationProps {
  currentPage: number;
  totalPages: number;
  firstItem: number;
  lastItem: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function PokemonPagination({
  currentPage,
  totalPages,
  firstItem,
  lastItem,
  totalCount,
  onPrevious,
  onNext,
}: PokemonPaginationProps) {
  return (
    <div className="pagination-bar glass-panel">
      <button className="pagination-btn" onClick={onPrevious} disabled={currentPage === 1}>
        <ChevronLeft size={18} />
        <span>Anterior</span>
      </button>

      <div className="pagination-info">
        <span>
          Página{" "}
          <strong className="highlight-num">{currentPage}</strong> de{" "}
          <strong>{totalPages}</strong>
        </span>
        <span className="pagination-subtext">
          Exibindo {firstItem} - {lastItem} de {totalCount}
        </span>
      </div>

      <button className="pagination-btn" onClick={onNext} disabled={currentPage === totalPages}>
        <span>Próxima</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
