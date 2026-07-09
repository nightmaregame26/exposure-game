# World Memory System
## Exposure Alpha 0.4 Planning

The World Memory System records what happens in Blackwood and controls who knows about it.

## Purpose

Every important action becomes part of the town's history.

The game should remember:

- what happened
- when it happened
- where it happened
- who witnessed it
- who knows about it
- whether it is public or secret
- whether the killer knows

## Event Object

```json
{
  "id": "evt_day1_noah_missing",
  "day": 1,
  "time": "06:30",
  "location": "blackwood_high",
  "summary": "Noah Williams reported missing.",
  "public": true,
  "witnesses": ["detective_mason"],
  "knownBy": ["detective_mason", "sarah_pike", "emily_hart"],
  "killerKnows": true,
  "tags": ["missing_person", "episode_1", "public_news"]
}
```

## Memory Types

### Public Memory

Known by the town.

Examples:

- Noah is missing.
- Police warned people to avoid the forest.
- Sarah published an article.

### Private Memory

Known only to certain characters.

Examples:

- Emily lied about her location.
- Alex saw a black ute.
- Mason has an old sealed case.

### Player Memory

Known to the player through evidence, notes, conversations or scenes.

### Killer Memory

Known to the killer through realistic channels.

## Memory Compression

Long conversations should be compressed into short memory notes.

Example:

Instead of storing a full transcript:

> Player asked Emily repeatedly about Noah, and Emily eventually admitted Noah thought he was being watched.

Store:

```text
Emily told player Noah felt watched before disappearing.
```

## AI Context Use

When talking to an NPC, the AI receives only:

- memories known by that NPC
- relevant player relationship memories
- current scene memories
- public events

It does not receive the full world truth.

## Long-Term Value

World memory allows future cases and seasons to reference past events.

Years later in Blackwood, people may still remember Season 1.
