# Relationship Engine
## Exposure Alpha 0.4 Planning

The Relationship Engine controls how people in Blackwood know, trust, avoid, protect, love, hate and mislead each other.

## Purpose

The game should not treat NPCs as isolated chatbots. Every character sits inside a social network.

A player action toward one person can affect another person later.

Example:

- Player accuses Alex.
- Sarah hears about it.
- Emily loses trust because Alex told her.
- Mason becomes suspicious because the accusation was public.
- The killer learns the player is focused on vehicles.

## Relationship Fields

Each relationship can include:

- trust
- affection
- fear
- resentment
- loyalty
- suspicion
- dependency
- history
- secretsShared
- lastInteraction

## Relationship Object

```json
{
  "from": "emily_hart",
  "to": "alex_vale",
  "trust": 54,
  "affection": 30,
  "fear": 4,
  "resentment": 10,
  "suspicion": 22,
  "history": "Emily knows Alex from the café and considers him friendly but evasive.",
  "secretsShared": []
}
```

## Rumour Transmission

Information moves through the graph.

A rumour travels faster if:

- relationship trust is high
- rumour intensity is high
- location is public
- public fear is high
- Sarah publishes it

A rumour travels slower if:

- NPC is isolated
- fear is high
- relationship trust is low
- police pressure is high

## Gameplay Use

The Relationship Engine affects:

- phone replies
- trust changes
- alibis
- gossip
- who protects whom
- who lies for whom
- who becomes a target
- who tells the killer information

## Killer Knowledge

The killer can learn through the relationship graph.

Example:

Emily tells Alex the player asked about a black ute. If Alex is the killer, he now knows. If Alex is not the killer, the information may continue through rumours.

The killer cannot learn through impossible channels.
