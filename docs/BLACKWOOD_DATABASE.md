# Blackwood Database
## Exposure Alpha 0.3

Blackwood is the permanent setting for Exposure Season 1.

## Design Goal

Blackwood should feel like a town that exists whether the player is watching or not.

Every location should have:

- purpose
- opening hours
- risk level
- people who live or work there
- possible events
- clues or rumours
- story relevance

## Core Locations

### Your House

The player's starting location. Safe early, less safe as Exposure rises.

### Café Hollow

Central social hub. Emily works here. Rumours spread quickly here.

### Blackwood High

Noah's school. Students know more than adults think.

### Police Station

Detective Mason's workplace. Evidence and trust matter here.

### Blackwood Forest

High-risk area. Connected to old disappearances and the first killer hint.

### Lake Road

Remote road outside town. Used for anonymous tips and staged clues.

### Blackwood Gazette

Sarah Pike's office. News, leaks and public fear originate here.

### Vale's Garage

Alex Vale's workplace. Vehicles, old roads and local gossip connect here.

### Hospital

Injuries, autopsies, medical staff and late-night incidents.

### Old Church

Historic location with old town secrets and community meetings.

### Blackwood Motel

Travellers, affairs, temporary residents and suspicious alibis.

### Sawmill

Industrial edge of town. Isolated, noisy and dangerous.

### Cemetery

Memorials, old graves, hidden meetings and symbolic killer behaviour.

## Location Object

```json
{
  "id": "cafe_hollow",
  "name": "Café Hollow",
  "type": "business",
  "risk": "Low",
  "unlocked": true,
  "openingHours": { "open": "06:00", "close": "22:00" },
  "workers": ["emily_hart"],
  "regulars": ["alex_vale", "sarah_pike"],
  "possibleEvents": ["rumour", "argument", "witness_tip", "late_shift"],
  "storyTags": ["social_hub", "episode_1"]
}
```

## Population Targets

Alpha 0.3 should define:

- 10 core story characters
- 40 simulation characters
- 20+ locations
- 8 businesses
- 6 family groups
- 5 police/medical characters
- 10 school/community characters

## Town State

Town-wide state values:

- publicFear
- policePresence
- mediaAttention
- rumourIntensity
- weather
- currentMajorEvent
- missingPeopleCount
- murderCount

These values affect schedules, dialogue and location risk.
