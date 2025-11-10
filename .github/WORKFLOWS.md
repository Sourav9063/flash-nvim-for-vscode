# GitHub Workflows

This repository uses GitHub Actions to automate building, releasing, and publishing the extension.

## Workflows

### 1. `release.yml` - Automated GitHub Releases

**Triggers:** Push to `main` branch when `package.json`, `src/**`, or workflow file changes

**What it does:**
1. Extracts version from `package.json`
2. Checks if version tag already exists (skips if it does)
3. Builds the extension using `npm run vscode:prepublish`
4. Packages the `.vsix` file using `vsce package`
5. Creates a GitHub release with tag `v{version}`
6. Uploads the `.vsix` file as a release asset

**No setup required** - uses automatic `GITHUB_TOKEN`

### 2. `publish.yml` - Publish to VS Code Marketplace (Optional)

**Triggers:** When a GitHub release is published

**What it does:**
1. Publishes to VS Code Marketplace
2. Publishes to Open VSX Registry (optional, continues on error)

**Setup required:**

#### Step 1: Get a Personal Access Token (PAT) for VS Code Marketplace

1. Go to https://dev.azure.com/
2. Click "User settings" → "Personal access tokens"
3. Create new token with:
   - **Name:** `vsce-publish`
   - **Organization:** All accessible organizations
   - **Scopes:** Custom defined → **Marketplace** → **Manage**
4. Copy the token

#### Step 2: Add token to GitHub Secrets

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. **Name:** `VSCE_PAT`
4. **Value:** Paste the token from Step 1
5. Click "Add secret"

#### Step 3: (Optional) Open VSX Registry Token

1. Go to https://open-vsx.org/
2. Create account and get access token
3. Add as GitHub secret: `OVSX_PAT`

## Usage

### Automated Release Flow

1. **Make changes** and commit to a feature branch
2. **Update version** in `package.json`:
   ```bash
   npm version patch  # For bug fixes
   npm version minor  # For new features
   npm version major  # For breaking changes
   ```
3. **Update CHANGELOG.md** with changes
4. **Merge to main** - GitHub Actions will:
   - Build and create GitHub release automatically
   - If `publish.yml` is configured, publish to marketplace

### Manual Publishing

If you prefer manual publishing:

```bash
# Package locally
vsce package

# Publish to VS Code Marketplace
vsce publish

# Publish to Open VSX
npx ovsx publish
```

## Version Management

The version in `package.json` is the **source of truth**. The workflow:
- Reads version from `package.json`
- Creates git tag `v{version}`
- Skips if tag already exists (prevents duplicate releases)

**Important:** Always bump version in `package.json` before merging to main if you want a new release.

## Troubleshooting

### Release not created
- Check if tag already exists: `git tag -l`
- Ensure `package.json` version was updated
- Check Actions tab for workflow run logs

### Publish fails
- Verify `VSCE_PAT` secret is set correctly
- Check token hasn't expired
- Ensure publisher name matches in `package.json`

### Build fails
- Ensure `npm ci` works locally
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
