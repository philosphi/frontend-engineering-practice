# Holy Grail Layout

## Problem Statement

Implement the classic "Holy Grail" page layout: a full-height shell with a
header and footer spanning the full width, a fixed-width nav column on the
left, a fixed-width aside column on the right, and a main content area in
the center that fills all remaining space.

Constraints:

- The layout fills the viewport height with no scrollbar on the shell
  itself (individual regions may scroll their own content).
- `nav` must appear before `main` in the HTML source (for accessibility /
  tab order), but must render visually on the left of `main`.
- `main` is the priority region: on a wide viewport it receives all extra
  space; on a narrow viewport it is the first region to shrink.
- Below a chosen breakpoint, the layout collapses to a single stacked
  column: header, nav, main, aside, footer.

Open `index.html` in a browser (or run `npm start`) to view the current
state. `src/styles.css` contains the unstyled boilerplate — the layout
rules are left as `TODO`s to implement.

---

## Concepts Exercised

_To be filled in during implementation._

## Approach

_To be filled in during implementation._

## Implementation Notes

_To be filled in during implementation._

## Lessons Learned

_To be filled in during implementation._
