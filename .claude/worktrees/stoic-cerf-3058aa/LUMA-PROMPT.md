# Luma Companion Prompt -- Command Center Redesign

Copy-paste this into Luma's interface along with uploading the PDF handoff doc.

---

## PROMPT

Redesign a personal operational dashboard called "Bodhi Command Center" from a static status page into a multi-screen interactive control surface. The attached PDF contains the complete brief with all specifications.
Design philosophy: This is the membrane between two forms of intelligence -- the human on the organic side, the AI agents on the digital side. The Command Center is the living threshold where that collaboration surfaces. Glass as functional transparency (seeing through into the digital realm), not decoration. Mindfulness with teeth -- Tom Ford minimalism meets Dieter Rams precision. Quiet tension. Refined and sexy, not utilitarian. Not a spaceship. Not a wellness poster. Something that whispers control, not screams it.

Multi-screen architecture -- five screens, each its own composition sharing the same visual DNA:
1. AGENT ACTIVITY (main hub) -- urgent banner, agent status grid, agent schedule, summary row pulling top items from other screens
2. DELIVERABLES -- all active deliverables with interactive cards, expand/collapse, inline review modals
3. KEY DATES / CALENDAR -- timeline view, red=imminent, orange=soon, connected to deliverables and blockers
4. BLOCKERS -- everything stuck and why, grouped by blocking person/dependency
5. PEOPLE / APPROVALS -- who is waiting on Bodhi + who Bodhi is waiting on, with approval actions
Navigation between screens should feel like moving through one environment, not jumping between pages. A persistent nav element should show which screen you are on and surface tiny status summaries for each screen (red pip on Blockers if active, count on Approvals if waiting).

Every element uses stoplight color logic:
- GREEN #34D399 = approved, done, healthy
- YELLOW #FBBF24 = waiting, in review, pending
- RED #F87171 = blocked, rejected, needs attention
- GRAY #6B7280 = on hold, paused, inactive
- ORANGE #FB923C = urgent, deadline, screen-takeover warning

Interaction model: progressive disclosure via click. First click expands card detail + action buttons. Second click or "Go Deep" opens a full modal overlay for inline review with approve/reject/waiting/close actions. Modals use dark overlay (rgba(0,0,0,0.7)) and card-dark background (#141720).
Design for AuDHD: scannable, not overwhelming. Clear hierarchy. Next actions always visible. Dense is fine, cluttered is not. No emojis. No decorative color -- every color means something.

Backgrounds: #090B10 page, #0D0F14 secondary, #141720 cards. Fonts: Outfit for headers (uppercase, tracked), Sora for body. No white backgrounds, no gradients on surfaces (glass treatment excepted where it serves the transparency metaphor), no light mode. Type choices should feel razor-sharp -- precision, not softness.

Technology: single-page HTML/CSS/JS with client-side multi-screen navigation (no page reloads). No heavy frameworks. Static data for now. Deployed to Netlify. Must load fast.

IMPORTANT -- Architectural direction (Sections 13-15 in the PDF):

The PDF includes three architectural sections that define how the Command Center fits into the larger system. These are critical for building the UI correctly even in the static version:
**Section 13 (Approval Flow Architecture):** The Command Center is not where content gets created -- it reflects the state of work done elsewhere. The "Approve" button confirms that work completed in a separate project chat is ready to move forward. The modal/overlay should show a summary and offer actions like "Confirm Approved," "Send Back," "Mark Waiting On [person]," and "Flag Blocked."

**Section 14 (Pipeline Architecture):** Build the UI with a clean data layer even in the static version. Use a single JavaScript object at the top of the file that holds all deliverable/blocker/date data. All rendering logic reads from that object. This makes transitioning to a live data source (JSON file, API) a matter of swapping the data-fetching code, not rewriting the UI.

**Section 15 (Dispatch as Data Source):** Structure the data layer as if it were being read from an API. Use a single dashboardState object with nested arrays for deliverables, blockers, dates, agents, and waitingOnBodhi. All rendering functions read from this object. The long-term architecture is a closed loop: work happens in project chats, state flows through Dispatch, the Command Center renders that state and enables action, actions flow back to Dispatch.

These three sections define the architectural backbone. Even though the initial build is static HTML, the code structure must anticipate the live-data future described in the PDF.

See the attached PDF for complete specifications including current data, full color palette, typography rules, interaction patterns, production priority order, and the full architectural direction.