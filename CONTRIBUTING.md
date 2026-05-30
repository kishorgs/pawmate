# Contributing to PawMate

## Branch naming

| Prefix | Use |
|--------|-----|
| `feature/<short-description>` | New features and enhancements |
| `release/<version>` | Release preparation (e.g. `release/1.0.0`) |
| `fix/<short-description>` | Bug fixes |
| `main` / `development` | Long-lived integration branches |

## Commits

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <description>

[optional body]

Refs #<issue-number>
```

**Types:** `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `build`, `perf`, `style`

**Examples:**

```
feat(pets): add vaccination reminder export (#12)
fix(api): reject invalid ownerId on create (#8)
docs: update Firebase setup in README (#3)
```

Reference a GitHub issue with `#123` or `Refs #123` in the subject or body.

## Pull requests

1. Branch from `development` (or `main` for hotfixes)
2. Ensure `npm run lint`, `npm run test:cov`, and `npm run build` pass locally
3. Update `CHANGELOG.md` for user-visible changes
4. Request review; squash merge preferred with a conventional commit message

## Releases

1. Bump `version` in the root `package.json`
2. Update `CHANGELOG.md`
3. Merge to `main` and tag: `git tag -a v1.0.0 -m "Release v1.0.0"`
4. Push tag; the `release.yml` workflow creates the GitHub release
