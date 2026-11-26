import "./DiscoveryProgress.css";

interface DiscoveryProgressProps {
  totalKnown: number;
  totalPokemon: number;
}

const countFormat = new Intl.NumberFormat("pt-BR");
const percentFormat = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 2,
});

export default function DiscoveryProgress({
  totalKnown,
  totalPokemon,
}: DiscoveryProgressProps) {
  const totalUnknown = totalPokemon - totalKnown;
  const completion = totalPokemon > 0 ? totalKnown / totalPokemon : 0;

  return (
    <section className="discovery-progress glass-panel" aria-labelledby="discovery-progress-title">
      <div className="discovery-progress-heading">
        <h2 id="discovery-progress-title">Progresso da coleção</h2>
        <span className="discovery-progress-percent">{percentFormat.format(completion)}</span>
      </div>

      <progress
        className="discovery-progress-bar"
        aria-label="Conclusão da Pokédex"
        value={totalKnown}
        max={Math.max(totalPokemon, 1)}
      />

      <dl className="discovery-progress-stats">
        <div>
          <dt>Conhecidos</dt>
          <dd>{countFormat.format(totalKnown)}</dd>
        </div>
        <div>
          <dt>Desconhecidos</dt>
          <dd>{countFormat.format(totalUnknown)}</dd>
        </div>
        <div>
          <dt>Total no catálogo</dt>
          <dd>{countFormat.format(totalPokemon)}</dd>
        </div>
      </dl>
    </section>
  );
}
