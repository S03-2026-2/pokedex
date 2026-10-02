# Pokédex (Application 9)

## About the Project

Application 9 - Pokédex is a system responsible for managing the cards known by each player. The application displays, through a graphical user interface, how many cards exist in total and how many the player has already had in their deck. The system features a permanent history: even if a player trades one of their cards, the information of the traded card remains available and visible in the player's list of known cards.

## System Actors

The system interacts with the following actors:
*   **Player (Jogador):** Main user who consumes the data and views the collection.
*   **Application 2 (Distribution):** Module or system responsible for sending data of cards obtained through distribution.
*   **Application 3 (Trades):** Module or system responsible for sending data of cards obtained through trades.
*   **PokéAPI (External):** Public API consumed to retrieve official Pokémon data.

## Features (Use Cases)

The main actions supported by the application include:
*   View the collection of Pokémons already known by the player.
*   Check card progress, showing the ratio between the total existing cards and the known Pokémons.
*   View specific details of a Pokémon, including its history and stats.
*   Search and filter Pokémons using criteria such as Name, Type, and ID.
*   Register a new known Pokémon in the database, ensuring this history is permanent.
*   Fetch and consume official information from the PokéAPI.

## Domain Structure (Classes)

The project's architecture was modeled based on the following main entities:

*   **Player (Jogador):** Entity representing the system user, containing attributes such as ID, name, and email. A player has access to a single collection.
*   **Collection (Colecao):** Manages the player's inventory, keeping track of the total known cards. Contains methods to add new cards and check if a specific Pokémon is already known.
*   **KnownCard (CartaConhecida):** Represents the record of a card that the player has owned, containing its own ID and the date it became known. Each known card represents a single Pokémon.
*   **KnowledgeOrigin (OrigemConhecimento):** An enumeration that defines how the player obtained knowledge of that card. It can assume the values `DISTRIBUICAO` (Distribution) or `TROCA` (Trade).
*   **Pokemon:** Entity that stores the creature's base data, containing ID, name, type, and its image URL.
