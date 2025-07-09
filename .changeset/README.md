# Changesets

This directory contains configuration for [changesets](https://github.com/changesets/changesets), a tool for managing versioning and changelogs for this monorepo.

## Usage

### Adding a changeset

```bash
pnpm changeset
```

This will prompt you to select which packages have changed and what type of version change they need (major, minor, or patch). It will also ask for a summary of the changes.

### Releasing

```bash
pnpm version
pnpm release
```

This will update package versions based on the changesets, update the changelog, and publish the packages to npm.
