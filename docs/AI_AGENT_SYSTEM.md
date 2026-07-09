# AI Agent System
## Exposure v0.1

Exposure uses AI agents to make Blackwood feel alive while still protecting the mystery structure.

## Core Principle

The AI can improvise behaviour and dialogue, but the game engine controls truth.

The AI may suggest:

- dialogue
- emotional reaction
- trust change
- memory update
- possible rumour
- possible clue hint

The engine decides:

- whether evidence is real
- whether a clue is unlocked
- whether the killer is revealed
- whether a character dies
- whether story progression is allowed

## Agent Types

### 1. Director AI

The Director AI is the showrunner. It understands the full season, pacing, major beats and world state.

Responsibilities:

- Maintain coherent story progression.
- Keep the player moving when stuck.
- Prevent impossible reveals.
- Decide when major story beats are available.
- Coordinate Town AI, Killer AI and NPC AI.

The Director AI knows the truth, but does not roleplay directly to the player.

### 2. Character AI

Each important character has a profile and memory.

Character profile fields:

- id
- name
- age
- occupation
- public role
- personality
- dialogue style
- agenda
- private goal
- secrets
- fears
- relationships
- trust toward player
- known facts
- hidden facts
- current mood
- current location
- memory log

The character can only talk about what they know or believe.

### 3. Killer AI

The Killer AI controls the hidden antagonist.

It has:

- identity
- motive
- victim profile
- signature
- method
- risk tolerance
- intelligence
- confidence
- social mask
- alibi behaviour
- knowledge state
- target list

The killer cannot magically know what the player knows. Information must travel through realistic channels such as witnesses, gossip, news, social media or direct observation.

### 4. Town AI

The Town AI simulates Blackwood.

It controls:

- weather
- public fear
- rumours
- daily schedules
- business hours
- police presence
- news reports
- emergency responses
- replacement NPCs
- background events

## Conversation API Contract

Input:

```json
{
  "npcId": "emily",
  "playerMessage": "Did Noah owe anyone money?",
  "day": 2,
  "time": "16:40",
  "location": "Café Hollow",
  "trust": 42,
  "knownFacts": ["Noah is missing"],
  "npcMemory": ["Player believed Emily yesterday"],
  "allowedSecrets": ["Noah said he was being watched"]
}
```

Output:

```json
{
  "reply": "Emily looks down. 'I don't know about money... but he was definitely scared of someone.'",
  "trustChange": 2,
  "exposureChange": 0,
  "newEvidenceId": null,
  "memory": "Player asked Emily whether Noah owed money."
}
```

## Hard Rules

- AI must stay in character.
- AI must not reveal the killer early.
- AI must not invent final evidence.
- AI must not contradict locked canon.
- AI must not give a character knowledge they could not have.
- AI can lie if the character would lie.
- AI can refuse to answer.
- AI can mislead based on character agenda.

## Character Agendas

Every agent has an agenda.

Examples:

- Emily wants to protect her family.
- Mason wants a provable case.
- Sarah wants the biggest story.
- Alex wants his debts hidden.
- Mara wants the past buried.

Not every secret is related to the murders. This keeps suspects believable.

## Agent Memory

Memory is stored as compact notes, not full transcripts.

Example:

- Player accused Alex without evidence.
- Player helped Emily avoid the late shift.
- Player lied to Mason about visiting Noah's house.

Memory affects future tone, trust, availability and willingness to help.
