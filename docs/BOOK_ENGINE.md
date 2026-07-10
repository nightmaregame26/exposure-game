# The Book Engine
## Exposure Milestone 1

The Book Engine is the primary narrative interface for Exposure. The player experiences the simulation as an interactive crime novel rather than teleporting between menus and dialogue screens.

## Implemented

- Opening playable prologue
- Integrated tutorial inside the story
- Book-style reader overlay
- Typewriter text
- Reveal text button
- Previous and next page controls
- Adjustable reading speed
- Interactive choices inside pages
- Observation choices that can create clues
- Travel chapters before every current task
- Reflection chapters after destination scenes
- Persistent Memory Book using local browser storage
- Searchable chapter library
- Bookmarks
- Rereading completed chapters

## Narrative Flow

```text
Choose destination
↓
Outbound travel chapter
↓
Observation or choice
↓
Arrival scene
↓
NPC conversation / investigation
↓
Return reflection chapter
↓
Chapter saved to Memory Book
```

## Memory Entry

```json
{
  "id": "emily_outbound_123",
  "day": 1,
  "chapter": "Chapter 2",
  "title": "The Walk to Café Hollow",
  "taskId": "emily",
  "phase": "outbound",
  "pages": [
    {
      "text": "A black ute rolls through the intersection.",
      "selectedChoice": "Take a quick photograph",
      "choiceResult": "The image is blurred, but the ute is visible."
    }
  ],
  "bookmarked": false
}
```

## Design Rules

- Important story facts must remain authored or validated.
- Travel scenes can create atmosphere without always creating evidence.
- Clues produced during travel must enter the evidence system.
- The killer cannot be identified through impossible narration.
- The book records the player's experience, not omniscient truth.
- Rereading should support deduction without highlighting the correct answer.

## Next Book Improvements

- Director-selected travel variations
- Weather and time-of-day prose variants
- AI-generated passages with strict validation
- Audio ambience and page sounds
- Photos and newspaper clippings inside chapters
- Player highlighting and handwritten annotations
- Chapter export for completed investigations
