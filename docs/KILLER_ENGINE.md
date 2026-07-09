# Killer Engine
## Exposure Alpha 0.3

The Killer Engine controls the hidden antagonist without letting the AI cheat.

## Design Goal

The killer should feel intelligent, adaptive and human. They follow rules, routines and psychology.

## Killer Profile

Generated at the start of a new game.

Fields:

- identityCharacterId
- motive
- victimProfile
- signature
- modusOperandi
- riskTolerance
- intelligence
- socialMask
- alibiStrategy
- confidence
- stress
- currentTargetId
- knowledgeState

## Victim Selection

Victims are scored against the killer profile.

Example scoring factors:

- matches age/gender preference
- works late
- lives alone
- low social protection
- connected to previous victim
- knows something dangerous
- easy access
- low police attention
- symbolic value

## Risk Assessment

The killer can choose not to act.

Risk rises from:

- police presence
- player Exposure
- witnesses nearby
- media attention
- victim not isolated
- weather/visibility
- recent failed attempt

## Killer Knowledge

The killer only knows what they could realistically learn.

Information sources:

- direct observation
- news reports
- rumours
- NPC conversations
- social media
- player public accusations
- evidence mishandling

The killer cannot magically know private diary notes or hidden evidence.

## Killer Actions

Possible actions:

- stalk target
- delay attack
- change target
- plant false clue
- remove evidence
- intimidate witness
- message player
- frame innocent person
- create alibi
- stop killing temporarily
- attack player if threatened

## Director Guardrails

The Director AI must approve major killer actions.

The killer cannot:

- reveal themselves randomly
- kill core characters without story approval
- create impossible evidence
- act on information they do not know
- break their own psychological profile without cause
