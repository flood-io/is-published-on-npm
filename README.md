# flood-io/is-published-on-npm

[![Test Workflow Status](https://github.com/flood-io/is-published-on-npm/workflows/Test/badge.svg)](https://github.com/flood-io/is-published-on-npm/actions)

This GitHub Action checks if a repositories package version as defined in `package.json` is published on NPM and sets outputs accordingly.

Check the example to see how this could be helpful to automating your release workflow.

## Usage

### Pre-requisites

Your workflow job must first checkout your repository and setup node before using this action, for example:

```yml
- uses: actions/checkout@v2
- uses: actions/setup-node@v1
```

### Inputs

- `dir`: The directory containing the `package.json` to check is published. Default: `./`.

### Outputs

- `published`: `'true'` if the package with `name` and `version` as defined in `package.json` is published, `'false'` if it isn't. **Note**: This value is, as are all GitHub Action outputs, a **string**.
- `version`: The `version` as defined in `package.json`.

### Example workflow - Publish a new version if not published on NPM

On every `push` to branch `master`, publish the package to NPM if it isn't already published.

```yml
name: Publish Package

on:
  push:
    branches:
      - master

jobs:
  publish:
    name: Publish Package
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v1
      - uses: flood-io/is-published-on-npm@v1
        id: is-published
      - run: npm publish
        if: ${{ steps.is-published.outputs.published == 'false' }}
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Example workflow - Create a GitHub Release if not published on NPM

On every `push` to branch `master`, create a new GitHub release if it isn't already published to NPM.

```yml
name: Release Package

on:
  push:
    branches:
      - master

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v1
      - uses: flood-io/is-published-on-npm@v1
        id: is-published
      - name: Release
        if: ${{ steps.is-published.outputs.published == 'false' }}
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ steps.is-published.outputs.version }}
          release_name: Release ${{ steps.is-published.outputs.version }}
          draft: false
          prerelease: false
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
