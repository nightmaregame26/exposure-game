# Phone System
## Exposure Alpha 0.3

The in-game phone is the player's main interface with Blackwood.

## Purpose

The phone makes the investigation feel personal and modern. It also gives the AI Director a way to deliver pressure, clues, threats and social consequences.

## Phone Apps

### Contacts

Shows unlocked phone numbers and relationship status.

### Messages

SMS-style conversations with NPCs. Trust determines whether people reply.

### News

Blackwood Gazette updates, missing person alerts, public warnings and rumours.

### Map

Unlocked locations, risk levels and last-known events.

### Notes

Player diary and theory board.

### Evidence

Photos, documents, witness statements and physical clues.

### Camera

Later feature for photographing clues.

### Calendar

Important tasks, meetings, deadlines and episode beats.

### Notifications

Warnings, missed calls, unknown messages and town alerts.

## Unknown Messages

The killer or other hidden actors can contact the player.

Examples:

- Stop asking about Noah.
- You missed something at the forest.
- Emily should not trust you.
- Come alone. Lake Road. 4:30.

## Phone Unlock Rules

NPC phone numbers unlock through trust, story events or investigation.

Low trust:

- no phone access

Medium trust:

- basic texting

High trust:

- late-night warnings
- urgent calls
- private evidence
- emotional conversations

## AI Integration

Phone messages can use the same `/api/talk` endpoint as face-to-face dialogue, with context set to `channel: sms`.

SMS responses should be shorter, more guarded and affected by current time.
