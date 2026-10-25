# Degoog Community Extensions

A quick showcase of community store repositories for [degoog](https://github.com/fccview/degoog).

## Submitting a store

1. Build a degoog store repo following the [store docs](https://degoog-org.github.io/docs/store.html)
2. [Open a PR](https://github.com/degoog-org/community-extensions/compare) adding the repo URL (e.g. `"https://github.com/owner/repo"`) to [stores.json](./stores.json).

That's it, you've done your part, your store will be reviewed and if it adheres to good old common sense it'll likely be approved.
Stores with avatar/screenshots and well thought out descriptions will have a higher chance of being approved.

## Supported hosts

GitHub, Codeberg, and GitLab.com are supported out of the box.

Self-hosted **Gitea** and **Forgejo** instances work without any code changes, they're detected automatically by probing `/api/v1/version`.

The instance just needs to expose its API publicly with CORS (default Gitea/Forgejo config does).

To add support for a different git host (sourcehut, BitBucket, etc.), [open a PR](https://github.com/fccview/awesome-degoog-extensions/compare) adding a host to [`scripts/indexer/hosts`](./scripts/indexer/hosts). A host is a small object with these fields:

- `id`, short identifier (e.g. `"github"`)
- `label`, human-readable name
- `matches(hostname)`, returns true for hostnames this host handles
- `locate(hostname, path)`, returns `{ hostname, path, webUrl, gitUrl, displayUrl }`
- `tree(loc)`, returns `{ paths, ref }` for the repo tree
- `raw(loc, ref, file)`, returns a **CORS-enabled** URL for fetching a file
- `source(loc, ref, dir)` and `blob(loc, ref, file)`, return URLs to view a folder or file on the host
- `patterns(loc, ref)`, returns `{ raw, blob }` URL templates with a `{path}` placeholder

Add it to `KNOWN_HOSTS` in `scripts/indexer/hosts/index.js`.
