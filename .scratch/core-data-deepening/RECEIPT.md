# RECEIPT — core-data — gen 1
base: 0aee35bc343619810fc170092413ee5790e32713
generation: 1
paths: [src/core/auth/, src/core/data/, src/core/db/, src/core/settings/, src/core/notifications/, src/core/types/]
proposed: 3
strong: 2
worth_exploring: 0
survival_rate: 0.67
noisy_proposer: false
churn_30d: {commits: 12, files: 31}     # collision-risk (>8 files)
filed:    issues/01-tool-data-port.md, issues/02-tool-entries-envelope.md
rejected:
  - seam: reschedule-reminder
    paths: [src/core/notifications/, src/app/_layout.tsx, src/app/settings/]
    oracle_at_base: "3 cancel+schedule pairs @ 0aee35bc (2-line pass-through)"
    reason: see PRD.md §Rejected at verification
merged_in: app-routes/03-delete-all-via-registry -> issues/01, tools/01-tool-entries-envelope -> issues/02
