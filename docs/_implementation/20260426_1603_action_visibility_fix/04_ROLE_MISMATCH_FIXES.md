# Role Mismatch Fixes

## Print pack

- Fixed by applying the same effective export-role restriction already used on export-history style surfaces.
- Non-admin/non-lead users now see restricted UX instead of a page that falls through to backend denial.

## Project client profile

- Fixed by restricting the project-level client-profile page to `ADMIN` and `LEAD`.
- This avoids exposing save/preview controls that backend client-profile APIs would reject.

## Admin overrides

- Fixed by splitting read vs execute behavior:
  - `ADMIN`: may execute override
  - `LEAD`: may view page/history but does not see execution controls

## Return vs reopen

- Fixed by removing the misleading duplicate `Return` action from indicator detail.
- The remaining action is `Reopen`, matching the actual backend endpoint and semantics.
