# 02 Backup plan

## Backup objective

Create a reversible DB snapshot before deleting non-LAB frameworks/projects/evidence.

## Snapshot created

- File: `/home/munaim/srv/apps/accrediops/exports/db_backups/lab_reset_20260413_2219_pre.sqlite3`
- SHA256: `2d9ce49c08c6d48ad0e227e08c4471aec489fc3b671eadd2720a03f70ced0129`

## Recovery path

1. Stop app containers.
2. Replace runtime SQLite DB with snapshot.
3. Start containers and run health checks on `http://127.0.0.1:18080`.
4. Re-run `scripts/devops/status_check.sh` and `scripts/devops/smoke_verify.sh`.
