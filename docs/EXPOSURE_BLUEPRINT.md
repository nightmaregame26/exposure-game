# EXPOSURE
## Master Game Blueprint v0.1

Exposure is a single-player AI-driven serial killer investigation game set in the fictional town of Blackwood.

The player has just moved to town. A missing person case begins. Over time, the player investigates, builds trust, gathers evidence, manages stamina and Exposure, and tries to identify the killer before becoming a target.

## Core Identity

Exposure is not a normal horror game. It is a detective mystery, survival RPG, AI town simulation, serial killer investigation, social deduction game and interactive thriller.

Main hook:

> You are trying to find the killer before the killer realises you are a threat.

## Core Gameplay Loop

Each day:

1. Wake up.
2. Watch/read Blackwood News.
3. Check messages.
4. Review available tasks.
5. Choose tasks based on time, stamina, risk and trust.
6. Visit locations.
7. Talk to characters.
8. Collect evidence.
9. Update suspects.
10. Write diary notes.
11. Manage Exposure.
12. End the day.
13. The town and killer act overnight.

The player cannot do everything in one day. Missed tasks may lead to lost evidence, characters dying, witnesses leaving town, trust opportunities missed, or the killer changing behaviour.

## Main Systems

### Time System

The game uses a 24-hour day. Every task costs time. Time affects character availability, location danger, business hours, killer activity, news reports and night events.

### Stamina System

Actions cost stamina. Low stamina reduces options such as running, searching longer, fighting back, climbing, or investigating at night safely. Rest restores stamina but costs time.

### Exposure System

Exposure measures how much attention the player has attracted. High Exposure causes the killer to watch, threaten, manipulate, target friends, destroy evidence, or hunt the player.

### Trust System

Every character has hidden trust toward the player. Trust unlocks phone numbers, rumours, secrets, evidence, warnings and help.

### Suspect System

The player can mark characters as Unknown, Cleared, Suspicious or Prime Suspect. The game does not confirm whether the player is right until major story events.

### Evidence System

Evidence has strength. To convince Detective Mason, the player needs motive, opportunity, physical evidence, witness support and Mason's trust. Knowing the killer is not enough. The player must prove it.

## AI Architecture

### Director AI

The Director AI controls pacing and story structure. It knows the season plot, episode goals, major beats, killer identity, characters and current world state. It ensures the story stays coherent.

### Character AI

Every major character is role-played by AI. Each has name, age, occupation, personality, agenda, secrets, fears, trust, memory, relationships, mood, goals, known facts and hidden facts.

The player can type anything and the AI responds in character.

### Killer AI

The killer is also an AI agent. The killer has identity, victim profile, motive, signature, MO, risk tolerance, intelligence, social mask, alibi strategy and targeting rules.

The killer only knows what they could realistically know. The killer does not cheat.

### Town AI

The Town AI controls Blackwood as a living place: news, rumours, weather, public fear, business hours, police presence, character schedules, replacement NPCs and town events.

## Killer Rules

At the start of each game, a killer profile is generated. The killer targets people based on set rules, such as:

- Works late shifts.
- Lives alone.
- Recently discovered something.
- Connected to a previous victim.
- Walks home at night.
- Has low social protection.
- Matches the killer's psychological pattern.

The killer can choose not to kill if risk is too high. The killer can change targets, delay attacks, frame others, destroy evidence, manipulate witnesses, befriend the player, protect the player if useful, or hunt the player if threatened.

## Character Death and Replacement

There are two character types:

### Core Story Characters

Major story characters. If they die, the season changes significantly. They are not instantly replaced.

### Simulation Characters

Town residents. If one dies or leaves, the Town AI may create a replacement with a unique personality, agenda and secrets.

## Blackwood

Blackwood is the permanent setting.

Core locations include Your House, Blackwood High, Café Hollow, Police Station, Blackwood Forest, Lake Road, Blackwood Motel, Hospital, Library, Old Church, Sawmill, Abandoned Mine, Water Tower, Town Hall, Trailer Park and Cemetery.

## Season 1: The Hunter

The player and family move to Blackwood. Noah Williams goes missing. At first it looks like a runaway case. Then more clues appear. The player realises someone in town is hunting people.

The killer is one of the people the player can meet. The killer may even become the player's friend.

## Core Rule

The AI can improvise scenes, dialogue and behaviour, but the AI cannot break the season.

The mystery must always have a real answer. The killer must be discoverable through evidence, behaviour and patterns.

The player should be able to say:

> I should have seen it earlier.
