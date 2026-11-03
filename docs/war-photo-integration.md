# WAR photo gallery integration (candidate)

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
