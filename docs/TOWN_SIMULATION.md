# Town Simulation
## Exposure Alpha 0.3

The Town Simulation makes Blackwood continue moving even when the player is not watching.

## Simulation Tick

The town updates in regular in-game intervals.

Recommended early version:

- every 60 in-game minutes for Alpha
- every 15 in-game minutes later

## Tick Responsibilities

Each tick can update:

- character locations
- business opening/closing
- rumours
- public fear
- police presence
- weather
- news pressure
- killer opportunity
- missed events
- phone notifications

## Character Movement

Characters follow schedules unless disrupted.

Disruptions include:

- fear
- police interviews
- player interaction
- injury
- weather
- killer threat
- work changes
- family emergency

## Rumour Spread

Rumours travel through relationships and public places.

High rumour intensity causes:

- NPCs become guarded
- police pressure increases
- Sarah publishes more stories
- the killer may learn what the player is doing

## Public Fear

Public fear changes town behaviour.

Low fear:

- normal routines
- late shifts continue
- people walk at night

Medium fear:

- people travel in groups
- shops close earlier
- police patrols increase

High fear:

- schools close early
- curfew rumours begin
- witnesses hide
- businesses suffer

## Replacement NPC System

When simulation NPCs die or leave town, the Town AI can generate replacements.

Replacement reasons:

- new hire
- transfer
- family member arrives
- temporary worker
- journalist arrives
- police support arrives

Core story characters are not simply replaced.
