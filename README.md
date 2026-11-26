# Pokédex — Aplicação 9

Projeto desenvolvido para a disciplina de Arquitetura e Desenho de Software (S203) do Instituto Nacional de Telecomunicações (Inatel).

## Navegação

- [Sobre o projeto](#1-sobre-o-projeto)
- [Arquitetura de software](#2-arquitetura-de-software)
- [Modelagem UML](#3-modelagem-uml)
- [Princípios SOLID](#4-princípios-solid)
- [Design Patterns](#5-design-patterns)
  - [Adapter](#adapter)
  - [Decorator no cache da PokéAPI](#decorator)
  - [Observer no recebimento de cartas](#observer)
- [Tecnologias utilizadas](#6-tecnologias-utilizadas)
- [Escopo e limitações](#7-escopo-e-limitações)

## 1. Sobre o projeto

A Pokédex é a aplicação responsável por gerenciar o histórico de Pokémon conhecidos por cada jogador no sistema de cartas Pokémon. Seu objetivo é permitir que o jogador acompanhe suas descobertas e o progresso de sua coleção.

Diferentemente de um inventário, a Pokédex não representa apenas as cartas que o jogador possui atualmente. Uma vez recebido um Pokémon por distribuição ou troca, ele permanece conhecido, mesmo que a carta seja posteriormente transferida para outro jogador. Receber o mesmo Pokémon novamente não gera uma nova descoberta.

O sistema utiliza a PokéAPI como fonte de informações públicas sobre os Pokémon e um backend próprio para persistir as descobertas individuais dos jogadores.

### Funcionalidades

- Visualização do catálogo de Pokémon, distinguindo os conhecidos dos desconhecidos.
- Consulta de detalhes dos Pokémon conhecidos, incluindo imagens, tipos, atributos e habilidades.
- Pesquisa por nome ou número, filtros por tipo e favoritos, paginação e ordenação.
- Visualização da quantidade de Pokémon conhecidos, desconhecidos e do percentual de conclusão da Pokédex.
- Registro permanente das descobertas, com identificação do jogador, origem e data de conhecimento.
- Simulação do recebimento de cartas por distribuição e troca.

### Atores e sistemas externos

| Ator ou sistema | Responsabilidade |
| --- | --- |
| Jogador | Consulta a Pokédex, visualiza detalhes e acompanha seu progresso. |
| Aplicação 1 — Jogadores | Responsável pela identidade dos jogadores no ecossistema. Integração prevista, não realizada. |
| Aplicação 2 — Distribuição | Origina eventos de recebimento de cartas por distribuição. Integração simulada. |
| Aplicação 3 — Trocas | Origina eventos de recebimento de cartas por troca. Integração simulada. |
| Aplicação 11 — Broker | Intermediação de mensagens prevista para a integração entre aplicações. Não implementada neste projeto. |
| PokéAPI | Fornece os dados públicos do catálogo de Pokémon. Integração implementada. |

## 2. Arquitetura de software

O padrão arquitetural principal adotado é a **SOA (Service-Oriented Architecture)**, considerando o papel da Pokédex como um serviço de consulta e gerenciamento de descobertas dentro do ecossistema de aplicações. A implementação disponibiliza uma API REST com um contrato de comunicação HTTP/JSON, permitindo que diferentes clientes consumam suas funcionalidades sem conhecer os detalhes internos de persistência.

A solução combina diferentes abordagens arquiteturais, cada uma aplicada a uma parte do sistema:

| Abordagem | Aplicação no projeto |
| --- | --- |
| SOA | Serviço da Pokédex com responsabilidade própria, persistência independente e interface REST. |
| Client-Server | Separação entre a aplicação cliente React e o servidor NestJS. |
| SPA (Single-Page Application) | Interface web em React, com atualização dinâmica dos componentes sem recarregamento integral da página. |
| Arquitetura em camadas | Organização interna do backend, separando apresentação, regras de negócio e persistência. |
| MOM (Message-Oriented Middleware) | Integração proposta com o broker para recebimento de eventos de distribuição e troca. No protótipo, a recepção é simulada localmente. |

A implementação do backend é monolítica e organizada em camadas. Não há microserviços internos nem um broker distribuído em execução. A classificação SOA refere-se ao serviço da Pokédex no contexto do ecossistema proposto, conforme a abordagem de serviços REST estudada na disciplina.

### 2.1. Visão geral

O jogador utiliza a interface React, que consulta a PokéAPI para obter o catálogo público e a API da Pokédex para recuperar suas descobertas. O backend persiste as coleções no PostgreSQL. A comunicação com as aplicações de distribuição e troca foi prevista por meio de um broker, mas é simulada localmente no protótipo.

### 2.2. Frontend

O frontend é uma SPA desenvolvida com React, TypeScript e Vite. A interface combina duas fontes de informação: a PokéAPI, para os dados públicos dos Pokémon, e a API da Pokédex, para os IDs conhecidos pelo jogador.

Sua organização separa as responsabilidades de apresentação, gerenciamento de estado e acesso a recursos externos:

- **Components:** renderização dos cards, filtros, paginação, modal e indicador de progresso.
- **Hooks:** gerenciamento de estados, consultas, busca, coleção e favoritos.
- **Providers:** interfaces que definem os contratos de acesso aos dados.
- **Services:** implementações dos contratos, incluindo adapters de API, armazenamento local e cache.
- **Types:** representação dos modelos utilizados pela aplicação.

O `App.tsx` coordena os dados da coleção e do catálogo. O `main.tsx` instancia os adapters e injeta as dependências no componente principal, funcionando como Composition Root.

Na listagem geral, o frontend consulta o índice do catálogo e evita buscar individualmente os dados dos Pokémon ainda desconhecidos. Esses Pokémon são representados por seu número e um card bloqueado. O progresso é calculado pela interseção entre os IDs conhecidos e o índice completo do catálogo, independentemente da página ou filtro atual.

### 2.3. Backend

O backend é desenvolvido com NestJS, TypeORM e PostgreSQL. As funcionalidades da Pokédex são distribuídas entre as seguintes camadas e componentes:

| Componente | Responsabilidade |
| --- | --- |
| `CollectionController` | Receber consultas HTTP, acionar o contrato de leitura e construir a resposta da API. |
| `CardEventConsumer` | Receber eventos de cartas e encaminhar cada descoberta ao contrato de escrita. |
| `CollectionService` | Implementar as regras de leitura e registro de descobertas. |
| `ICollectionReader` e `ICollectionWriter` | Separar os contratos de consulta e escrita da coleção. |
| `ICollectionRepository` | Definir as operações de persistência necessárias ao service. |
| `CollectionRepository` | Implementar as operações de persistência utilizando TypeORM. |
| `Collection` e `KnownCard` | Representar os dados da coleção e das descobertas, mapeados para o banco de dados. |
| `CollectionModule` | Configurar a injeção de dependências e os componentes da aplicação. |

#### Fluxo de consulta

1. O frontend utiliza o adapter da coleção para consultar os Pokémon conhecidos do jogador.
2. O `CollectionController` aciona `viewCollection()` por meio de `ICollectionReader`.
3. O `CollectionService` consulta o repository através de `ICollectionRepository`.
4. O `CollectionRepository` recupera a coleção e as cartas conhecidas no PostgreSQL.
5. O controller devolve ao frontend os IDs conhecidos e sua quantidade. Se ainda não houver coleção, a resposta contém uma lista vazia.

#### Fluxo de registro de descobertas

1. Uma distribuição ou troca é simulada por uma requisição ao `SimulationController`.
2. O controller cria um evento `CardReceivedEvent` e o emite através de `FakeCardEventSource`.
3. O `CardEventConsumer`, inscrito na fonte, recebe o evento e chama `addCard()` através de `ICollectionWriter` para cada Pokémon recebido.
4. O `CollectionService` obtém ou cria a coleção do jogador e verifica se o Pokémon já é conhecido.
5. O repository registra somente as novas descobertas no PostgreSQL, preservando os dados das descobertas anteriores.

A interface `ICardEventSource` permite que o consumidor dependa de uma abstração da fonte de eventos. A integração real com o broker poderia ser acrescentada mediante uma nova implementação desse contrato.

## 3. Modelagem UML

### Diagrama de casos de uso

O diagrama representa as interações do jogador e dos sistemas externos com a Pokédex, incluindo a consulta da coleção, o acompanhamento do progresso, a visualização de detalhes e o registro de novas descobertas.

[Diagrama de casos de uso em PDF](docs/use_case_pokedex_v1.pdf) · [Arquivo Draw.io](docs/use_case_pokedex_v1.drawio)

Os casos de uso que dependem das demais aplicações representam a integração planejada. A autenticação, a auditoria administrativa e a comunicação real com as equipes externas não fazem parte da implementação atual.

### Diagrama de classes

O diagrama de classes apresenta a estrutura principal da solução, destacando os relacionamentos do domínio, os contratos de leitura e escrita, a persistência e os adapters do frontend.

| Versão | PDF | Arquivo editável |
| --- | --- | --- |
| Modelo inicial | [PDF](docs/uml_pokedex_v1.pdf) | [Draw.io](docs/uml_pokedex_v1.drawio) |
| Modelo SOLID | [PDF](docs/uml_pokedex_v2%28SOLID%29.pdf) | [Draw.io](docs/uml_pokedex_v2%28SOLID%29.drawio) |
| Solução integrada | [PDF](docs/uml_SOLID_final.pdf) | [Draw.io](docs/uml_SOLID_final.drawio) |

O diagrama está em português e apresenta uma visão simplificada da estrutura do sistema, omitindo detalhes de implementação e componentes auxiliares.

### Modelo de domínio e persistência

O jogador é identificado por um ID externo. A Pokédex não mantém uma tabela de jogadores nem é responsável por suas credenciais. Cada jogador pode possuir uma coleção, criada no primeiro registro de descoberta, e uma coleção pode possuir zero ou mais cartas conhecidas.

- **Collection:** possui identificador UUID, identificador do jogador, data de criação e relação com as cartas conhecidas.
- **KnownCard:** possui identificador UUID, referência à coleção, ID do Pokémon, origem e data da descoberta.
- **DiscoveryOrigin:** enumeração com os valores `DISTRIBUTION` e `TRADE`.
- **Pokemon:** modelo de dados públicos da criatura, obtido pela PokéAPI e utilizado no frontend, sem tabela correspondente no banco da Pokédex.

O banco possui duas tabelas principais: `collections` e `known_cards`. A restrição de unicidade em `player_id` impede que um jogador tenha múltiplas coleções. A restrição composta em `collection_id` e `pokemon_id` impede registros duplicados de uma mesma descoberta.

## 4. Princípios SOLID

Os princípios SOLID foram aplicados para reduzir o acoplamento entre os componentes, organizar suas responsabilidades e facilitar a manutenção e a extensão do sistema.

### 4.1. SRP — Single Responsibility Principle

O princípio da responsabilidade única estabelece que uma unidade de software deve possuir uma responsabilidade coesa, com um motivo principal para mudar.

No backend, o `CollectionController` trata a comunicação HTTP, o `CollectionService` concentra as regras de descoberta e o `CollectionRepository` implementa a persistência. O `CardEventConsumer` trata a entrada de eventos, sem implementar novamente as regras de negócio.

No frontend, os componentes cuidam da apresentação, os hooks gerenciam os estados e os adapters realizam a comunicação com fontes externas. Por exemplo, `useCollection` gerencia a consulta e os estados da coleção, enquanto `CollectionApiAdapter` é responsável pela requisição HTTP e validação da resposta.

### 4.2. OCP — Open/Closed Principle

O princípio aberto/fechado estabelece que componentes devem permitir extensões de comportamento sem exigir alterações desnecessárias em sua implementação original.

O exemplo mais evidente é o `CachedPokemonProvider`, que acrescenta cache ao `PokeApiAdapter` sem modificar sua implementação. Ambos respeitam o contrato `PokemonProvider`, de modo que os hooks continuam utilizando a mesma interface.

A fonte de eventos também é extensível: uma implementação conectada a um broker poderia substituir a fonte simulada no consumidor, preservando o contrato de inscrição e as regras de negócio. Essa extensão ainda não foi realizada.

### 4.3. LSP — Liskov Substitution Principle

O princípio da substituição de Liskov estabelece que implementações de uma abstração devem poder substituir umas às outras sem quebrar as expectativas de seus consumidores.

O `PokeApiAdapter` e o `CachedPokemonProvider` implementam `PokemonProvider`. O segundo delega as consultas ao provider encapsulado e procura preservar o comportamento do contrato, inclusive o tratamento de ausência de resultados e falhas. Assim, os hooks podem utilizar o provider direto ou sua versão com cache sem alterar sua forma de consumo.

A estrutura favorece a substituição de implementações, mas a conformidade comportamental completa depende de testes, ainda pendentes nesta versão.

### 4.4. ISP — Interface Segregation Principle

O princípio da segregação de interfaces determina que um consumidor não deve depender de operações que não utiliza.

A aplicação separa as operações de leitura e escrita em duas interfaces. A interface de leitura disponibiliza a consulta da coleção e a verificação de Pokémon conhecidos; a interface de escrita disponibiliza o registro de novas descobertas.

O `CollectionController` depende somente de `ICollectionReader`, enquanto o `CardEventConsumer` depende de `ICollectionWriter`. O mesmo `CollectionService` implementa os dois contratos, sem a necessidade de duplicar o service.

No endpoint de consulta, o controller recebe apenas o contrato de leitura: [Controller da coleção](backend/src/controllers/collection.controller.ts)

```typescript
@Controller('collections')
export class CollectionController {
  constructor(
    @Inject(COLLECTION_READER)
    private readonly collectionReader: ICollectionReader,
  ) {}
```
Já o consumidor de eventos recebe apenas o contrato de escrita para registrar novas descobertas: Consumidor de eventos

```typescript
@Injectable()
export class CardEventConsumer implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(COLLECTION_WRITER)
    private readonly collectionWriter: ICollectionWriter,
    @Inject(CARD_EVENT_SOURCE)
    private readonly eventSource: ICardEventSource,
  ) {}
  ```

### 4.5. DIP — Dependency Inversion Principle

O princípio da inversão de dependência estabelece que componentes de alto nível devem depender de abstrações, e não diretamente de implementações de infraestrutura.

O `CollectionService` recebe o contrato `ICollectionRepository`, em vez de instanciar ou depender diretamente do repository do TypeORM.

O NestJS associa os tokens de injeção às implementações no `CollectionModule`. Os contratos de leitura e escrita são associados à mesma instância do service por meio de `useExisting`. [Módulo da coleção](backend/src/modules/collection.module.ts)

```typescript
providers: [
  { provide: COLLECTION_REPOSITORY, useClass: CollectionRepository },
  CollectionService,
  { provide: COLLECTION_READER, useExisting: CollectionService },
  { provide: COLLECTION_WRITER, useExisting: CollectionService },
  FakeCardEventSource,
  { provide: CARD_EVENT_SOURCE, useExisting: FakeCardEventSource },
  CardEventConsumer,
],
```

## 5. Design Patterns

O projeto utiliza três padrões de projeto GoF: Adapter, Decorator e Observer. Cada padrão atende a uma necessidade concreta da aplicação.

<a name="adapter"></a>

### 5.1. Adapter — Padrão estrutural

O Adapter permite que componentes com interfaces diferentes possam colaborar por meio de um contrato comum.

A Pokédex utiliza fontes de dados com formatos e mecanismos de acesso distintos. Para evitar que componentes React e hooks dependam diretamente desses detalhes, foram criados os seguintes adapters:

| Adapter | Contrato | Recurso adaptado |
| --- | --- | --- |
| `PokeApiAdapter` | `PokemonProvider` | API pública PokéAPI. |
| `CollectionApiAdapter` | `CollectionProvider` | API REST do backend da Pokédex. |
| `LocalStorageFavoritesAdapter` | `FavoritesStorage` | Armazenamento local do navegador. |

O `PokeApiAdapter` realiza requisições HTTP, valida respostas com Zod e utiliza funções de mapeamento para convertê-las nos modelos internos. O `CollectionApiAdapter` adapta a resposta da API da coleção ao contrato do frontend. O adapter de favoritos encapsula a leitura, validação e gravação no `localStorage`.

Dessa forma, mudanças nos formatos externos podem ser tratadas dentro dos adapters, reduzindo seu impacto sobre a interface visual.

<a name="decorator"></a>

### 5.2. Decorator — Padrão estrutural

O Decorator permite acrescentar responsabilidades a um objeto por composição, mantendo a interface utilizada por seus consumidores.

O `CachedPokemonProvider` implementa `PokemonProvider` e recebe outro objeto do mesmo contrato em seu construtor. Ele acrescenta cache às consultas, delegando ao provider encapsulado quando necessário.

O ponto de composição cria o adapter e o entrega ao Decorator. O `App` recebe esse objeto pelo contrato `PokemonProvider`. [Composição no frontend](frontend/src/main.tsx)

```typescript
const pokemonProvider = new CachedPokemonProvider(new PokeApiAdapter())
```

Em `getPokemonPage`, a combinação de `offset` e `limit` identifica a entrada. `getOrLoad` devolve um resultado válido do cache, reaproveita uma requisição em andamento ou chama o provider encapsulado. [Implementação do cache](frontend/src/services/cache/cached-pokemon.provider.ts)

```typescript
getPokemonPage(offset: number, limit: number, signal?: AbortSignal): Promise<PokemonPage> {
  return this.getOrLoad(this.pages, `${offset}:${limit}`, (sharedSignal) =>
    this.provider.getPokemonPage(offset, limit, sharedSignal), signal);
}
```

Por exemplo, duas consultas a `getPokemonPage(0, 100)` compartilham a requisição se ela ainda estiver em andamento. Depois que ela termina com sucesso, a página pode ser reutilizada enquanto a entrada estiver válida.

O cache é mantido em memória, com validade padrão de dez minutos, e permite o reaproveitamento de requisições em andamento para a mesma chave. Isso reduz consultas repetidas à PokéAPI sem exigir mudanças nos hooks ou no adapter original.

A coleção do jogador não utiliza esse cache, pois suas descobertas podem mudar após novos eventos.

<a name="observer"></a>

### 5.3. Observer — Padrão comportamental

O Observer estabelece uma relação de inscrição e notificação, permitindo que um objeto informe seus observadores sobre acontecimentos sem conhecer suas regras internas.

Como a integração real entre equipes não foi realizada, o backend possui um mecanismo local de eventos para testar as descobertas recebidas por distribuição e troca.

- `ICardEventSource`: define o contrato de inscrição em uma fonte de eventos.
- `FakeCardEventSource`: armazena os handlers inscritos em um `Set` e os notifica quando `emit()` é chamado.
- `CardEventConsumer`: inscreve um handler na fonte durante a inicialização e encaminha os eventos recebidos ao contrato de escrita da coleção.
- `SimulationController`: produz eventos de distribuição ou troca para fins de demonstração.

O `CardEventConsumer` se inscreve em `onModuleInit` e cancela a inscrição em `onModuleDestroy`. A fonte guarda o callback e, ao receber um evento, aguarda cada inscrito em sequência. [Inscrição do consumidor](backend/src/events/consumers/card-event.consumer.ts) · [Fonte simulada](backend/src/events/sources/fake-card-event.source.ts)

```typescript
subscribe(handler: (event: CardReceivedEvent) => Promise<void>): () => void {
  this.handlers.add(handler);
  return () => {
    this.handlers.delete(handler);
  };
}

async emit(event: CardReceivedEvent): Promise<void> {
  for (const handler of this.handlers) {
    await handler(event);
  }
}
```

O `SimulationController` emite o mesmo tipo de evento tanto para distribuição quanto para troca. A origem acompanha o evento, e o consumidor chama `addCard` para cada ID recebido. [Emissão no controller](backend/src/events/simulation/simulation.controller.ts) · [Contrato do evento](backend/src/events/card-received.event.ts)

```typescript
private emitCards(
  { playerId, pokemonIds }: SimulateCardsDto,
  origin: DiscoveryOrigin,
): Promise<void> {
  return this.eventSource.emit({
    playerId,
    pokemonIds,
    origin,
    occurredAt: new Date(),
  });
}
```

A fonte de eventos não acessa diretamente o service nem o repository. O consumidor é responsável por encaminhar as notificações para as regras de negócio.

O padrão Observer está efetivamente implementado no protótipo, mas o mecanismo funciona em memória, dentro do mesmo processo, e aguarda o processamento dos handlers. Ele não equivale a um MOM distribuído e não oferece fila persistente, garantia de entrega ou retentativas automáticas.

### Outros padrões e técnicas

Além dos padrões GoF, o projeto utiliza Repository Pattern para encapsular a persistência, Dependency Injection para fornecer implementações a partir de contratos e Composition Root para centralizar a construção das dependências. Esses recursos não são classificados como padrões GoF.

## 6. Tecnologias utilizadas

| Área | Tecnologias |
| --- | --- |
| Frontend | React, TypeScript, Vite, CSS e Lucide React |
| Backend | NestJS, TypeScript |
| Persistência | PostgreSQL 17, TypeORM e migrations |
| Validação | Zod e pipes do NestJS |
| Infraestrutura de desenvolvimento | Docker Compose e npm |
| Integração externa | PokéAPI (`https://pokeapi.co/`) |

## 7. Escopo e limitações

A aplicação implementa o fluxo de consulta e persistência das descobertas. Algumas funcionalidades do ecossistema completo permanecem fora do protótipo:

- Não houve integração real com as aplicações de Jogadores, Distribuição, Trocas e Broker. O recebimento de cartas é simulado localmente.
- O frontend utiliza um jogador fixo para a demonstração. Não há autenticação ou autorização no backend.
- A origem e a data da descoberta são persistidas, mas o endpoint atual de consulta retorna apenas os IDs e a quantidade conhecida. Essas informações históricas ainda não são exibidas na interface.
- A unicidade no banco e as verificações do service e repository evitam duplicações no processamento sequencial. Operações concorrentes podem gerar conflitos de unicidade; não há garantia de processamento idempotente sob concorrência nem atomicidade de todo um evento com várias cartas.
- O bloqueio de Pokémon desconhecidos é uma regra de apresentação, não uma restrição de acesso aos dados públicos da PokéAPI. A busca direta e a cadeia evolutiva ainda possuem exceções às restrições de descoberta.
- A ordenação é aplicada sobre o conjunto atualmente carregado; falhas parciais nas consultas à PokéAPI podem omitir alguns cards. Favoritos são armazenados localmente no navegador, sem separação por jogador, e possuem valores iniciais predefinidos.
- A infraestrutura de testes do backend está configurada, mas a implementação de uma suíte de testes unitários e E2E permanece pendente.

Essas limitações refletem o escopo acadêmico do projeto. A solução prioriza a demonstração dos conceitos de arquitetura de software, SOLID, padrões de projeto e separação de responsabilidades.
