# EXPOSURE  
## Master Game Blueprint v0.1

Exposure is a single-player AI-driven serial killer investigation game set in the fictional town of Blackwood.

The player has just moved to town. A missing person case begins. Over time, the player investigates, builds trust, gathers evidence, manages stamina and Exposure, and tries to identify the killer before becoming a target.

---

# Core Identity

Exposure is not a normal horror game.

It is:

- Detective mystery
- Survival RPG
- AI town simulation
- Serial killer investigation
- Social deduction game
- Interactive thriller

The main hook:

> You are trying to find the killer before the killer realises you are a threat.

---

# Core Gameplay Loop

Each day:

1. Wake up
2. Watch/read Blackwood News
3. Check messages
4. Review available tasks
5. Choose tasks based on time, stamina, risk and trust
6. Visit locations
7. Talk to characters
8. Collect evidence
9. Update suspects
10. Write diary notes
11. Manage Exposure
12. End the day
13. The town and killer act overnight

The player cannot do everything in one day.

Missed tasks may lead to:
- Lost evidence
- Characters dying
- Witnesses leaving town
- Trust opportunities missed
- Killer changing behaviour

---

# Main Systems

## 1. Time System

The game uses a 24-hour day.

Every task costs time.

Examples:

- Meet Emily: 45 minutes
- Visit Noah's house: 2 hours
- Search forest: 3 hours
- Talk to Detective Mason: 1 hour
- Stake out motel: 4 hours
- Rest: 2 hours

Time affects:
- Character availability
- Location danger
- Business opening hours
- Killer activity
- News reports
- Night events

---

## 2. Stamina System

Actions cost stamina.

Low stamina reduces options.

Examples:

- Cannot run
- Cannot search longer
- Cannot fight back
- Cannot climb
- Cannot investigate at night safely

Rest restores stamina but costs time.

---

## 3. Exposure System

Exposure measures how much attention the player has attracted.

Exposure rises when the player:

- Visits crime scenes
- Asks too many questions
- Talks to police
- Follows anonymous tips
- Appears in news
- Interferes with the killer
- Accuses people publicly

High Exposure causes:

- Killer watches player
- Friends become targets
- Anonymous messages
- Break-ins
- Evidence destroyed
- Player becomes hunted

---

## 4. Trust System

Every character has trust toward the player.

Trust is hidden from the player in the final game.

Low trust:
- Basic conversation only

Medium trust:
- Character may share rumours
- Character may give phone number

High trust:
- Character reveals secrets
- Character gives evidence
- Character warns player
- Character may risk themselves to help

Trust is affected by:

- Dialogue
- Helping characters
- Accusing characters
- Sharing evidence
- Lying
- Breaking promises
- Ignoring requests

---

## 5. Suspect System

The player can mark characters as:

- Unknown
- Cleared
- Suspicious
- Prime Suspect

The game never confirms if the player is right until major story events.

Wrong accusations can:
- Damage trust
- Alert the killer
- Mislead Detective Mason
- Cause innocent characters to be targeted

---

## 6. Evidence System

Evidence has strength.

Examples:

- Rumour: weak
- Witness statement: medium
- CCTV: strong
- Physical evidence: strong
- Confession: very strong

To convince Detective Mason, the player needs:

- Motive
- Opportunity
- Physical evidence
- Witness support
- Mason's trust

Knowing the killer is not enough.

The player must prove it.

---

# AI Architecture

Exposure uses several AI systems.

## Director AI

The Director AI controls pacing and story structure.

It knows:
- Season plot
- Episode goals
- Major story beats
- Killer identity
- All characters
- Current world state

It ensures the story stays coherent.

The Director AI does not allow random story chaos.

---

## Character AI

Every major character is role-played by AI.

Each character has:

- Name
- Age
- Occupation
- Personality
- Agenda
- Secrets
- Fears
- Trust level
- Memory
- Relationships
- Current mood
- Current goal
- Known facts
- Hidden facts
- Things they will not reveal yet

The player can type anything.

The AI responds in character.

---

## Killer AI

The killer is also an AI agent.

The killer has:

- Identity
- Victim profile
- Motive
- Signature
- Modus operandi
- Risk tolerance
- Intelligence
- Social mask
- Alibi strategy
- Targeting rules

The killer only knows what they could realistically know.

The killer does not cheat.

---

## Town AI

The Town AI controls Blackwood as a living place.

It manages:

- News reports
- Rumours
- Weather
- Public fear
- Business hours
- Police presence
- Character schedules
- Replacement NPCs
- Town events

If people die, move away, or disappear, the town changes.

---

# Killer Rules

At the start of each game, a killer profile is generated.

The killer targets people based on set rules.

Example victim rules:

- Works late shifts
- Lives alone
- Recently discovered something
- Connected to a previous victim
- Walks home at night
- Has low social protection
- Matches killer's psychological pattern

The killer can choose not to kill if risk is too high.

The killer can:
- Change targets
- Delay attacks
- Frame others
- Destroy evidence
- Manipulate witnesses
- Befriend the player
- Protect the player if useful
- Hunt the player if threatened

---

# Character Death and Replacement

There are two character types:

## Core Story Characters

These are major story characters.

If they die, the season changes significantly.

They are not instantly replaced.

Example:
- Detective Mason dies
- A new detective may arrive
- But the new detective has different methods and trust starts low

## Simulation Characters

These are town residents.

If one dies or leaves, the Town AI may create a replacement.

Example:
- Café worker dies
- Café hires new worker
- New worker has unique personality, agenda and secrets

This keeps Blackwood alive.

---

# Blackwood

Blackwood is the permanent setting.

The town includes:

- Your House
- Blackwood High
- Café Hollow
- Police Station
- Blackwood Forest
- Lake Road
- Blackwood Motel
- Hospital
- Library
- Old Church
- Sawmill
- Abandoned Mine
- Water Tower
- Town Hall
- Trailer Park
- Cemetery

Locations unlock as the player investigates.

---

# Main Tabs

## Home

Shows:
- Day
- Time
- News
- Messages
- Available tasks
- Stamina
- Exposure

## Map

Shows:
- Unlocked locations
- Locked mystery locations
- Risk level
- Last known events

## Contacts

Shows:
- People met
- Relationship
- Trust behaviour
- Phone unlocked or locked
- Last seen
- Known facts

## Suspects

Shows:
- All known people
- Player suspicion rating
- Notes
- Linked evidence

## Diary

Shows:
- Player notes
- Theories
- Evidence
- Timeline

## Case File

Shows:
- Killer behavioural profile
- Evidence strength
- Victim pattern
- Detective Mason trust
- Arrest readiness

---

# Season 1: The Hunter

Opening:

The player and family move to Blackwood.

Noah Williams goes missing.

At first, it looks like a runaway case.

Then more clues appear.

The player realises someone in town is hunting people.

The killer is one of the people the player can meet.

The killer may even become the player's friend.

---

# Core Rule

The AI can improvise scenes, dialogue and behaviour.

But the AI cannot break the season.

The mystery must always have a real answer.

The killer must be discoverable through evidence, behaviour and patterns.

The player should be able to say:

> I should have seen it earlier.
