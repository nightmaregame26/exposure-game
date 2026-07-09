# Case Generation Engine
## Exposure Long-Term System

The Case Generation Engine will allow Exposure to create new solvable investigations after Season 1.

## Purpose

Exposure should become an AI crime simulation platform, not just one fixed mystery.

A case should generate:

- killer
- motive
- victim profile
- victim timeline
- clues
- red herrings
- suspects
- alibis
- witness statements
- evidence strength
- police response
- possible endings

## Fair Mystery Rules

Every generated case must be solvable.

Rules:

- Killer must be introduced early.
- Killer must have motive, means and opportunity.
- At least three evidence paths must lead toward the truth.
- Red herrings must have believable unrelated secrets.
- The player can be wrong, but the game cannot be unfair.
- The killer cannot be random.

## Case Seed

Each case starts from a seed.

```json
{
  "caseId": "season2_collector_001",
  "theme": "collector",
  "town": "blackwood",
  "killerArchetype": "organized_power_control",
  "victimProfile": "people who keep trophies from the past",
  "signatureTheme": "objects returned to owners",
  "difficulty": "medium"
}
```

## Generated Structure

```text
Case
├── Killer truth
├── Victim timeline
├── Suspect map
├── Evidence map
├── Red herring map
├── Police theory
├── Public rumour layer
├── Killer adaptation rules
└── Ending conditions
```

## Director Role

The Director AI controls pacing, but it cannot change the underlying truth once a case starts.

The truth is locked when the case begins.

## Player Outcome

Possible outcomes:

- Correct arrest
- Wrong arrest
- Killer escapes
- Killer dies
- Player dies
- Key witness dies
- Case goes cold
- Partial truth discovered

## Season One

Season 1 should remain authored. The Case Generation Engine should be introduced after the base systems are stable.
