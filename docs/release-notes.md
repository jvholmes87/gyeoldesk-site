# Gyeoldesk release notes

Versions follow the Forkline scheme: `vX.Y`. The full list (v1.0 MVP on 1 NOV through v1.8 on 4 NOV) is on the Releases tab of Jason's Command Center.
The 20 NOV preview-lock release (e3e40f7) was not given a number.
Every entry records the feedback from real users that shaped it (standing rule, 3 NOV 2026).

## v1.10: Page metadata covers Submittal status (24 NOV 2026)

**Feedback behind it:** Jason, 24 NOV 17:14: "Make sure all of the pages meta data is updated correctly."

**What changed**
- gyeoldesk.com: description, Open Graph description, structured data (JSON-LD) and the no-JavaScript summary now list Submittal status and Contacts with the WAR. The homepage tagline says the same in Korean and English.
- gnc.gyeoldesk.com: the company description (search, link previews, manifest) now names submittal status.
- Browser tab titles: each page now resets the title. Before, after opening a project's submittals, other pages kept that project's title. Submittal pages read "Submittal status · GNC — Projects Desk" and "P-02 · Submittal status · GNC — Projects Desk".
- Submittal status lede no longer names one company's tracker tabs ("Updated hourly from the project tracker").

## v1.9: Submittal status (24 NOV 2026)

**User feedback behind it**
- 17 NOV: Jason showed GNC's PMs and engineers a one-project submittal coverage review (26-1051). They liked it a lot: in Jason's words, it was "way easier and faster for them to see what they need to do, what is missing, where things are currently at."
- 23 NOV: Jason had an all-project version built (the Master Submittal Status PDF, 7 projects, 269 lines) and shared it with the team on Kakao as internal use only. He then asked for it as a Gyeoldesk feature.

**What changed**
- New **Submittal status** tile on the company desk, next to WAR and Contacts, and in the ☰ menu.
- All-projects page: counts per category for each project, one numbered team-action list, and an **Action needed only** filter that also lists every line that needs action.
- Project page (`#/submittals/<project key>`): key points, status chips, every line grouped by spec section, ▶ follow-up marker, days waiting since the sent date (red after 30 days), AF 3000 link when one is on Drive, and an **Open** filter. Approved, later and N/A lines show as compact rows.
- Each WAR project card links to its submittal status.
- Korean and English, phone layout, behind sign-in. The demo company (Halyard Works) has fictional lines only.

**Data**
- Source: PCES tracker tabs `04B_SUBMITTAL_LINES` and `04C_SUBMITTAL_NOTES` (approved by Jason 24 NOV), synced hourly like Contacts (backend PR jvholmes87/gyeoldesk#19, migration 0020).
- Internal status view only. It is not the official submittal register sent to the Government; those registers and tab 04_SUBMITTALS are unchanged.

**Decisions (Jason, 24 NOV, chat)**
- Own Submittals tile (not inside Projects, which stays "Coming soon").
- Tracker tabs + migration approved.
- Phase 1 = summary + project pages. PDF export in the same layout as the 23 NOV PDF is phase 2.
