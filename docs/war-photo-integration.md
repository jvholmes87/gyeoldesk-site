# WAR photo gallery integration

This change renders an optional `snapshots.fields.photo_evidence` array on each
project WAR detail page. It does not ingest Drive photos, approve release, or
change database permissions. No operational images or private evidence belong in
this repository. All examples in tests are fictional.

Each record uses `photo_id`, `project_key`, `war_date`, `capture_date`,
`caption_en`, `caption_ko`, `verification: "verified"`,
`release_status: "approved_public"`, `release_reviewed_on`, `release_reference`,
`image_path`, and `evidence_url`. Capture dates are KST calendar dates within the
seven days ending on `war_date`. Project and period must match the displayed card.

The trusted importer must verify actual release authority and derivative contents
before writing fields. Client flags do not establish approval or access control.
Do not send restricted originals, URLs, names or review documents to the browser.
Only separately reviewed public derivatives may use the static gallery.
`image_path` accepts only `/assets/war-photos/<opaque-id>.(jpg|jpeg|png|webp)`.
`evidence_url` accepts only `https://drive.google.com/file/d/<id>/view` and must
point to the reviewed derivative/package, not its restricted original. Preserve
Drive permissions; needing recipient sign-in is acceptable.

An authenticated internal gallery needs a separate authorized backend and private
storage. It cannot safely be implemented by hiding fields already fetched by the
browser. This candidate makes no claim about existing backend authorization.

Run `node --test tests/war-photos.test.mjs`. Test responsive and bilingual rendering
with fictional local fixtures. Follow DEPLOY.md: preview, phone review and approval,
then live promotion of the same commit to company mirrors. Review database importer
changes separately. Before declaring deployed, verify the live card and record
deployment revision, sync time and actual image/link behavior. Empty UI means no
release-approved images available; it does not mean no photos were captured.

## Importer (added 3 Nov 2026)

- The hourly collector (repo `gyeoldesk`, `apps-script/Code.gs`, `sendPhotos_`) reads every Google Sheet titled
  `*Photo_Manifest*` (photo spec v1.0 schema) and sends per project/week **counts** (total, in-window, date pending,
  historical, verified, excluded) plus only rows that are `verification=verified`, `disclosure_status=approved_public`,
  reviewed (reviewer, review_time, approval_evidence) and have a reviewed derivative. Restricted captions, links and
  file IDs never leave Google.
- `records-intake` (`kind: "photo_sets"`) re-checks the browser contract server-side and stores the result in
  `war_photo_sets` (migration 0017, members read, service-role write).
- The card merges `war_photo_sets.approved` with `snapshots.fields.photo_evidence` and shows a status line: how many
  photos exist for the week and why they are not shown. No set means "collection status unconfirmed".
- An approved record's `image_path` is `/assets/war-photos/<first 16 hex of derivative_sha256>.jpg`. The derivative
  file itself is published by a reviewed commit to this repository (public), never automatically. Until it is
  committed the card shows "Photo unavailable" with the evidence link.
- The fictional AI-generated samples and the `#/photo-gallery-demo` route were removed before production.
