# Living Time, Appointments and Social Suspicion

## Purpose

Exposure follows the player's real local time. Blackwood uses that clock to determine lighting, atmosphere, NPC availability, appointment windows and mission outcomes.

The system is designed to create urgency without punishing players for work, family or other real-life commitments.

## Core Rules

- Blackwood uses the device's local time.
- Day, evening and night create different versions of the same mission.
- Important meetings can be negotiated through the Phone.
- NPCs do not automatically agree to a new time.
- Trust, affection, respect, reliability, fear, suspicion and interest affect their willingness.
- Arriving unannounced is possible for some meetings, but changes the relationship.
- Missing an agreed appointment becomes part of the story rather than a generic mission failure.
- Offline events are recorded in the Memory Book under `While You Were Away`.

## Social Profile

Each important NPC privately tracks:

- Trust
- Affection
- Respect
- Reliability
- Fear
- Suspicion
- Interest
- Appointments kept
- Appointments missed

The player sees a calculated Social Score and an approximate suspicion status.

Possible suspicion states include:

- Does not currently suspect you
- Watching you carefully
- Wary of your involvement
- Treating you as a possible suspect
- Believes you may be the killer

## Appointment States

- Proposed
- Confirmed
- In progress
- Completed
- Missed
- Cancelled
- Changed by a world event

## Rescheduling

A request is evaluated using:

```text
Trust
+ Affection
+ Respect
+ Reliability
+ Interest
+ Urgency
- Fear
- Suspicion
- Schedule conflict
- Night aversion
```

Each NPC has an individual threshold and schedule.

Emily may change plans because Noah is missing, but fear can prevent her from meeting after dark. Mason may trust the player and still refuse because he is on duty. Sarah may accept with low trust because the information benefits her investigation.

## Time-Based Mission Outcomes

A mission is not simply available or unavailable. The time changes the scene.

Example: Meeting Emily

### Day

- Café is busy.
- Meeting feels safer.
- Conversation may be overheard.
- Emily is less frightened but less open.

### Evening

- Café is closing.
- Conversation becomes more private.
- A vehicle may wait outside.
- Exposure increases.

### Night

- Café is locked.
- Meeting moves behind the building.
- Emily's fear rises.
- The killer has more opportunity to observe.

## Offline Simulation

When the player returns after being away, the game calculates elapsed real time and creates a Memory Book entry.

Possible events include:

- Police searches
- Rumour spread
- News updates
- NPC routine changes
- Killer observation
- Missed appointments

The current browser prototype limits simulated offline time to 24 hours. A future backend should verify server time and process authoritative world events.
