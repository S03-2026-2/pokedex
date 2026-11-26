import type { Pokemon, PokemonDetails } from '../types/pokemon';

export const POKEMON_DATA: (Pokemon & PokemonDetails)[] = [
  {
    id: 1,
    name: "Bulbasaur",
    japaneseName: "フシギダネ",
    category: "Semente",
    types: ["Grass", "Poison"],
    height: 0.7,
    weight: 6.9,
    description: "Há uma semente de planta em suas costas desde o dia em que este Pokémon nasce. A semente cresce lentamente.",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
    animatedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/1.gif",
    habitat: "Florestas e Pradarias",
    generation: 1,
    cries: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/1.ogg",
    stats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 },
    abilities: [
      { name: "Overgrow", description: "Aumenta o poder dos golpes do tipo Planta em 50% quando o HP cai abaixo de 1/3." },
      { name: "Chlorophyll", description: "Dobra a Velocidade em tempo ensolarado (Habilidade Oculta)." }
    ],
    evolutions: [
      { id: 1, name: "Bulbasaur", level: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png" },
      { id: 2, name: "Ivysaur", level: 16, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png" },
      { id: 3, name: "Venusaur", level: 32, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png" }
    ]
  },
  {
    id: 4,
    name: "Charmander",
    japaneseName: "ヒトカゲ",
    category: "Lagarto",
    types: ["Fire"],
    height: 0.6,
    weight: 8.5,
    description: "Tem preferência por coisas quentes. Quando chove, diz-se que o vapor jorra da ponta de sua cauda.",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
    animatedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/4.gif",
    habitat: "Montanhas Ensolares",
    generation: 1,
    stats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 },
    abilities: [
      { name: "Blaze", description: "Aumenta o poder dos golpes do tipo Fogo em 50% quando o HP cai abaixo de 1/3." },
      { name: "Solar Power", description: "Aumenta o Ataque Especial sob sol forte, mas consome HP a cada turno." }
    ],
    evolutions: [
      { id: 4, name: "Charmander", level: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png" },
      { id: 5, name: "Charmeleon", level: 16, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png" },
      { id: 6, name: "Charizard", level: 36, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png" }
    ]
  },
  {
    id: 7,
    name: "Squirtle",
    japaneseName: "ゼニガメ",
    category: "Tartaruguinha",
    types: ["Water"],
    height: 0.5,
    weight: 9.0,
    description: "Após o nascimento, suas costas se incham e endurecem formando uma concha. Ele espirra espuma potentemente pela boca.",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
    animatedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/7.gif",
    habitat: "Lagos e Lagoas",
    generation: 1,
    stats: { hp: 44, attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43 },
    abilities: [
      { name: "Torrent", description: "Aumenta o poder dos golpes do tipo Água em 50% quando o HP cai abaixo de 1/3." },
      { name: "Rain Dish", description: "Recupera gradualmente o HP quando está chovendo." }
    ],
    evolutions: [
      { id: 7, name: "Squirtle", level: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png" },
      { id: 8, name: "Wartortle", level: 16, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png" },
      { id: 9, name: "Blastoise", level: 36, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png" }
    ]
  },
  {
    id: 25,
    name: "Pikachu",
    japaneseName: "ピカチュウ",
    category: "Rato Elétrico",
    types: ["Electric"],
    height: 0.4,
    weight: 6.0,
    description: "Quando se reúne com vários da mesma espécie, sua eletricidade pode acumular e causar tempestades elétricas.",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    animatedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif",
    habitat: "Florestas e Cidades",
    generation: 1,
    stats: { hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 },
    abilities: [
      { name: "Static", description: "Pode paralisar atacantes ao sofrer contato físico." },
      { name: "Lightning Rod", description: "Atrai golpes elétricos e aumenta o Ataque Especial." }
    ],
    evolutions: [
      { id: 172, name: "Pichu", level: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/172.png" },
      { id: 25, name: "Pikachu", level: "Felicidade", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" },
      { id: 26, name: "Raichu", level: "Pedra do Trovão", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png" }
    ]
  },
  {
    id: 133,
    name: "Eevee",
    japaneseName: "イーブイ",
    category: "Evolução",
    types: ["Normal"],
    height: 0.3,
    weight: 6.5,
    description: "Sua estrutura genética instável permite que ele se adapte a qualquer ambiente e evolua em várias formas diferentes.",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png",
    animatedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/133.gif",
    habitat: "Campos Urbanos",
    generation: 1,
    stats: { hp: 55, attack: 55, defense: 50, spAtk: 45, spDef: 65, speed: 55 },
    abilities: [
      { name: "Run Away", description: "Garante a fuga em batalhas contra Pokémon selvagens." },
      { name: "Adaptability", description: "Aumenta o bônus de ataque do mesmo tipo (STAB) de 1.5x para 2x." }
    ],
    evolutions: [
      { id: 133, name: "Eevee", level: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png" },
      { id: 134, name: "Vaporeon", level: "Pedra da Água", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/134.png" },
      { id: 135, name: "Jolteon", level: "Pedra do Trovão", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/135.png" },
      { id: 136, name: "Flareon", level: "Pedra do Fogo", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/136.png" }
    ]
  },
  {
    id: 150,
    name: "Mewtwo",
    japaneseName: "ミュウツー",
    category: "Genético",
    types: ["Psychic"],
    height: 2.0,
    weight: 122.0,
    description: "Um Pokémon criado pela manipulação de genes. Dizem que possui o coração mais selvagem entre todos os Pokémon.",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png",
    animatedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/150.gif",
    habitat: "Desconhecido / Caverna Sem Fim",
    generation: 1,
    stats: { hp: 106, attack: 110, defense: 90, spAtk: 154, spDef: 90, speed: 130 },
    abilities: [
      { name: "Pressure", description: "Faz o oponente gastar o dobro de PP ao usar habilidades contra Mewtwo." },
      { name: "Unnerve", description: "Impede os Pokémon adversários de comerem suas Berries seguradas." }
    ],
    evolutions: [
      { id: 150, name: "Mewtwo", level: "Forma Base", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png" }
    ]
  },
  {
    id: 94,
    name: "Gengar",
    japaneseName: "ゲンガー",
    category: "Sombra",
    types: ["Ghost", "Poison"],
    height: 1.5,
    weight: 40.5,
    description: "Dizem que ele se esconde nas sombras das pessoas. Quando Gengar está por perto, a temperatura da sala cai cerca de 5 graus.",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png",
    animatedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/94.gif",
    habitat: "Casas Abandonadas",
    generation: 1,
    stats: { hp: 60, attack: 65, defense: 60, spAtk: 130, spDef: 75, speed: 110 },
    abilities: [
      { name: "Cursed Body", description: "Pode desabilitar o golpe que atingiu o Pokémon por alguns turnos." }
    ],
    evolutions: [
      { id: 92, name: "Gastly", level: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/92.png" },
      { id: 93, name: "Haunter", level: 25, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/93.png" },
      { id: 94, name: "Gengar", level: "Troca", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png" }
    ]
  },
  {
    id: 448,
    name: "Lucario",
    japaneseName: "ルカリオ",
    category: "Aura",
    types: ["Fighting", "Steel"],
    height: 1.2,
    weight: 54.0,
    description: "Consegue capta a aura emitida por seres vivos a mais de 1 km de distância. Entende perfeitamente a linguagem humana.",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png",
    animatedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/448.gif",
    habitat: "Montanhas Nevadas",
    generation: 4,
    stats: { hp: 70, attack: 110, defense: 70, spAtk: 115, spDef: 70, speed: 90 },
    abilities: [
      { name: "Steadfast", description: "Aumenta a velocidade sempre que o Pokémon hesitar (Flinch)." },
      { name: "Inner Focus", description: "Protege o Pokémon de sofrer Flinch em combate." }
    ],
    evolutions: [
      { id: 447, name: "Riolu", level: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/447.png" },
      { id: 448, name: "Lucario", level: "Felicidade (Dia)", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png" }
    ]
  },
  {
    id: 282,
    name: "Gardevoir",
    japaneseName: "サーナイト",
    category: "Abraço",
    types: ["Psychic", "Fairy"],
    height: 1.6,
    weight: 48.4,
    description: "Pode prever o futuro. Se detectar perigo iminente para seu Treinador, dizem que pode criar um pequeno buraco negro.",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/282.png",
    animatedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/282.gif",
    habitat: "Jardins e Santuários",
    generation: 3,
    stats: { hp: 68, attack: 65, defense: 65, spAtk: 125, spDef: 115, speed: 80 },
    abilities: [
      { name: "Synchronize", description: "Transmite envenenamento, paralisia ou queimadura para o oponente." },
      { name: "Trace", description: "Copia a habilidade do adversário ao entrar em campo." }
    ],
    evolutions: [
      { id: 280, name: "Ralts", level: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/280.png" },
      { id: 281, name: "Kirlia", level: 20, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/281.png" },
      { id: 282, name: "Gardevoir", level: 30, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/282.png" }
    ]
  },
  {
    id: 149,
    name: "Dragonite",
    japaneseName: "カイリュー",
    category: "Dragão",
    types: ["Dragon", "Flying"],
    height: 2.2,
    weight: 210.0,
    description: "É capaz de dar uma volta ao mundo em cerca de 16 horas. É um Pokémon bondoso que guia navios perdidos na tempestade.",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png",
    animatedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/149.gif",
    habitat: "Oceano Aberto",
    generation: 1,
    stats: { hp: 91, attack: 134, defense: 95, spAtk: 100, spDef: 100, speed: 80 },
    abilities: [
      { name: "Inner Focus", description: "Impede que o Pokémon sofra Flinch." },
      { name: "Multiscale", description: "Reduz o dano sofrido pela metade quando o HP está em 100%." }
    ],
    evolutions: [
      { id: 147, name: "Dratini", level: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/147.png" },
      { id: 148, name: "Dragonair", level: 30, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/148.png" },
      { id: 149, name: "Dragonite", level: 55, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png" }
    ]
  },
  {
    id: 384,
    name: "Rayquaza",
    japaneseName: "レックウザ",
    category: "Céu",
    types: ["Dragon", "Flying"],
    height: 7.0,
    weight: 206.5,
    description: "Vive há centenas de milhões de anos na camada de ozônio da Terra sem jamais descer ao solo. Alimenta-se de meteoritos.",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png",
    animatedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/384.gif",
    habitat: "Estratosfera",
    generation: 3,
    stats: { hp: 105, attack: 150, defense: 90, spAtk: 150, spDef: 90, speed: 95 },
    abilities: [
      { name: "Air Lock", description: "Elimina todos os efeitos de condições climáticas na batalha." }
    ],
    evolutions: [
      { id: 384, name: "Rayquaza", level: "Lendário", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png" }
    ]
  },
  {
    id: 130,
    name: "Gyarados",
    japaneseName: "ギャラドス",
    category: "Atroz",
    types: ["Water", "Flying"],
    height: 6.5,
    weight: 235.0,
    description: "Raramente visto em estado selvagem. Extremamente agressivo, tem o hábito de destruir cidades inteiras quando enfurecido.",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png",
    animatedSprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/130.gif",
    habitat: "Mares Agitados",
    generation: 1,
    stats: { hp: 95, attack: 125, defense: 79, spAtk: 60, spDef: 100, speed: 81 },
    abilities: [
      { name: "Intimidate", description: "Reduz o status de Ataque dos Pokémon oponentes ao entrar em campo." },
      { name: "Moxie", description: "Aumenta o Ataque do Pokémon cada vez que ele derrota um oponente." }
    ],
    evolutions: [
      { id: 129, name: "Magikarp", level: 1, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/129.png" },
      { id: 130, name: "Gyarados", level: 20, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png" }
    ]
  }
];

export const TYPE_COLORS = {
  Grass: { bg: "#46d1a1", border: "#2ebd85", gradient: "linear-gradient(135deg, #2e7d32, #66bb6a)", text: "#ffffff" },
  Poison: { bg: "#a855f7", border: "#9333ea", gradient: "linear-gradient(135deg, #7e22ce, #c084fc)", text: "#ffffff" },
  Fire: { bg: "#f97316", border: "#ea580c", gradient: "linear-gradient(135deg, #c2410c, #fb923c)", text: "#ffffff" },
  Water: { bg: "#3b82f6", border: "#2563eb", gradient: "linear-gradient(135deg, #1d4ed8, #60a5fa)", text: "#ffffff" },
  Electric: { bg: "#eab308", border: "#ca8a04", gradient: "linear-gradient(135deg, #a16207, #fde047)", text: "#1e293b" },
  Normal: { bg: "#94a3b8", border: "#64748b", gradient: "linear-gradient(135deg, #475569, #cbd5e1)", text: "#ffffff" },
  Psychic: { bg: "#ec4899", border: "#db2777", gradient: "linear-gradient(135deg, #be185d, #f472b6)", text: "#ffffff" },
  Ghost: { bg: "#6b21a8", border: "#581c87", gradient: "linear-gradient(135deg, #3b0764, #9333ea)", text: "#ffffff" },
  Fighting: { bg: "#b91c1c", border: "#991b1b", gradient: "linear-gradient(135deg, #7f1d1d, #f87171)", text: "#ffffff" },
  Steel: { bg: "#64748b", border: "#475569", gradient: "linear-gradient(135deg, #334155, #94a3b8)", text: "#ffffff" },
  Fairy: { bg: "#f472b6", border: "#e879f9", gradient: "linear-gradient(135deg, #db2777, #fbcfe8)", text: "#ffffff" },
  Dragon: { bg: "#4338ca", border: "#3730a3", gradient: "linear-gradient(135deg, #312e81, #818cf8)", text: "#ffffff" }
};

export function getTypeStyle(type: string | undefined) {
  if (type && Object.hasOwn(TYPE_COLORS, type)) {
    return TYPE_COLORS[type as keyof typeof TYPE_COLORS];
  }

  return TYPE_COLORS.Normal;
}
