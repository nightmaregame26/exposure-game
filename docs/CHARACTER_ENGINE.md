# Character Engine
## Exposure Alpha 0.3

The Character Engine defines every living person in Blackwood.

## Goals

- Make each NPC feel like a real person.
- Give every NPC an agenda, memory and relationships.
- Allow AI roleplay without breaking canon.
- Track what each NPC knows, believes, hides and wants.

## Character Object

```json
{
  "id": "emily_hart",
  "name": "Emily Hart",
  "age": 22,
  "role": "Cafe worker",
  "core": true,
  "alive": true,
  "homeLocation": "hart_house",
  "workLocation": "cafe_hollow",
  "currentLocation": "cafe_hollow",
  "personality": ["empathetic", "guarded", "observant"],
  "agenda": "Protect her family and avoid becoming involved with police.",
  "privateGoal": "Find out what happened to Noah without exposing her own lie.",
  "secrets": ["She lied about where she was the night Noah vanished."],
  "knownFacts": ["Noah said someone was watching him."],
  "hiddenFacts": ["Noah argued with someone in a black ute."],
  "trust": 22,
  "fear": 30,
  "stress": 45,
  "suspicion": "Unknown",
  "relationships": {
    "noah_williams": "friend",
    "alex_vale": "friendly",
    "detective_mason": "distrust"
  },
  "memory": []
}
```

## Core vs Simulation Characters

### Core Characters

Core characters carry story weight. Their death or disappearance changes the season.

Examples:

- Emily Hart
- Detective Mason
- Sarah Pike
- Alex Vale
- Mara Bell
- Noah Williams

### Simulation Characters

Simulation characters make Blackwood feel alive. They have routines, relationships and secrets, but can be replaced if they die or leave town.

## Memory Rules

Do not store full conversations as memory. Store compact memory notes.

Examples:

- Player believed Emily about Noah being watched.
- Player accused Alex without proof.
- Player shared evidence with Sarah.
- Player lied to Mason about entering Noah's house.

## Knowledge Rules

Every NPC has separate fields for:

- What they know is true
- What they believe is true
- What they suspect
- What they are hiding
- What they refuse to reveal

This prevents AI agents from knowing impossible information.

## Character State Updates

Character state changes through:

- Player conversations
- Town events
- Killer actions
- Rumours
- News
- NPC-to-NPC interactions
- Daily schedule movement

## AI Roleplay Contract

When talking to a character, the backend sends only the context they are allowed to know.

The AI receives:

- character profile
- current mood
- trust toward player
- known facts
- relevant memory
- location
- time
- player message

The AI does not receive:

- killer identity unless the NPC knows it
- future episode beats
- hidden Director notes
- full town state
