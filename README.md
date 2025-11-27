# iOS CI/CD Template

A production-ready template for iOS apps with automated CI/CD using GitHub Actions and Fastlane.

## Features

- **SwiftUI** - Modern native iOS app structure
- **GitHub Actions CI/CD** - Automated build, test, and deployment pipelines
- **Fastlane** - Simplified build and release automation
- **Match** - Secure code signing certificate management
- **SwiftLint** - Enforced code quality standards
- **Pre-commit Hooks** - Local validation before commits

## Prerequisites

Before using this template, ensure you have:

- [ ] **macOS** with Xcode 15.4+ installed
- [ ] **Homebrew** installed ([brew.sh](https://brew.sh))
- [ ] **Apple Developer Account** ($99/year) with App Store Connect access
- [ ] **GitHub Account** with ability to create repositories

---

## Quick Start

### Step 1: Use This Template

Click **"Use this template"** on GitHub, or clone manually:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### Step 2: Run Setup Script

```bash
./scripts/setup.sh
```

This installs:
- SwiftLint (code linting)
- Fastlane (build automation)
- Pre-commit git hook (runs lint + tests before each commit)

### Step 3: Open in Xcode

```bash
open App/App.xcworkspace
```

> **Important**: Always open the `.xcworkspace` file, not `.xcodeproj`

---

## Project Structure

```
├── .github/workflows/
│   ├── ci.yml              # PR validation (lint → test → build)
│   ├── staging.yml         # Deploy to TestFlight on push to develop
│   └── production.yml      # Deploy to App Store on push to main
│
├── App/
│   ├── App.xcworkspace     # << OPEN THIS IN XCODE
│   ├── App.xcodeproj/      # Xcode project configuration
│   ├── App/                # Your app source code
│   │   ├── AppApp.swift    # App entry point
│   │   ├── ContentView.swift
│   │   └── Assets.xcassets/
│   ├── AppTests/           # Unit tests
│   ├── AppUITests/         # UI tests
│   └── fastlane/           # Fastlane configuration
│       ├── Fastfile        # Build/deploy lanes
│       ├── Appfile         # App metadata
│       └── Matchfile       # Code signing config
│
├── scripts/
│   ├── setup.sh            # One-time project setup
│   └── pre-commit          # Git hook for local validation
│
├── Gemfile                 # Ruby dependencies (Fastlane)
├── Brewfile                # Homebrew dependencies (SwiftLint)
├── .swiftlint.yml          # Linting rules
└── .gitignore
```

---

## CI/CD Pipeline Overview

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        Pull Request                             │
│                             │                                   │
│                             ▼                                   │
│                    ┌────────────────┐                          │
│                    │     Lint       │ ← SwiftLint checks       │
│                    └───────┬────────┘                          │
│                            │ Pass                               │
│                            ▼                                    │
│                    ┌────────────────┐                          │
│                    │     Test       │ ← Unit & UI tests        │
│                    └───────┬────────┘                          │
│                            │ Pass                               │
│                            ▼                                    │
│                    ┌────────────────┐                          │
│                    │     Build      │ ← Compile verification   │
│                    └───────┬────────┘                          │
│                            │ Pass                               │
│                            ▼                                    │
│                    ✅ Ready to Merge                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Push to develop → CI passes → Build → Upload to TestFlight    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Push to main branch → Build → Upload to App Store Connect     │
└─────────────────────────────────────────────────────────────────┘
```

### Branch Strategy

| Branch | Trigger | Deployment Target |
|--------|---------|-------------------|
| `feature/*` | PR opened | CI checks only (no deployment) |
| `develop` | Push/merge | TestFlight (beta testing) |
| `main` | Push/merge | App Store Connect |

---

## Complete Setup Guide

### Part 1: Apple Developer Setup

#### 1.1 Get Your Team ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Click **Membership** in the sidebar
3. Copy your **Team ID** (10-character string like `ABC123XYZ9`)

#### 1.2 Create App Store Connect API Key

This allows automated uploads without 2FA prompts.

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **Users and Access** (top menu)
3. Click **Integrations** tab
4. Click **App Store Connect API** in sidebar
5. Click **Generate API Key** (or the + button)
6. Enter a name: `GitHub-Actions-CI`
7. Select Access: **Admin**
8. Click **Generate**
9. **IMPORTANT**: Download the `.p8` file immediately (you can only download it once!)
10. Note the **Key ID** (displayed in the list)
11. Note the **Issuer ID** (displayed at the top of the page)

Save these three values securely:
- Key ID (e.g., `ABC123DEFG`)
- Issuer ID (e.g., `12345678-1234-1234-1234-123456789012`)
- The `.p8` file content

---

### Part 2: Code Signing Setup (Match)

Match stores your certificates in a private Git repository, making it easy to share across CI and team members.

#### 2.1 Create Certificates Repository

1. Go to GitHub and create a **new private repository**
   - Name it something like `ios-certificates` or `ios-certs`
   - Make sure it's **Private**
   - Don't initialize with README

2. Copy the SSH URL: `git@github.com:YOUR_ORG/ios-certificates.git`

#### 2.2 Generate SSH Key for CI Access

```bash
# Generate a new SSH key pair
ssh-keygen -t ed25519 -C "match-ci" -f ~/.ssh/match_deploy_key -N ""

# Display the public key
cat ~/.ssh/match_deploy_key.pub
```

#### 2.3 Add Deploy Key to Certificates Repo

1. Go to your certificates repository on GitHub
2. Settings → Deploy keys → Add deploy key
3. Title: `GitHub Actions`
4. Key: Paste the public key from above
5. Check **Allow write access**
6. Click Add key

#### 2.4 Initialize Match

```bash
cd App
bundle exec fastlane match init
```

When prompted:
- Select **git** as storage mode
- Enter your certificates repo URL: `git@github.com:YOUR_ORG/ios-certificates.git`

#### 2.5 Generate Certificates

```bash
# Generate App Store distribution certificate and profile
bundle exec fastlane match appstore

# When prompted, enter a passphrase (save this as MATCH_PASSWORD)
```

You'll be prompted to:
1. Enter your Apple ID
2. Enter your password (or use App-Specific Password if 2FA enabled)
3. Create a passphrase for encrypting the certificates

**Save the passphrase** - you'll need it as `MATCH_PASSWORD` secret.

---

### Part 3: GitHub Configuration

#### 3.1 Configure Repository Secrets

Go to your app repository: **Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `MATCH_GIT_URL` | `git@github.com:YOUR_ORG/ios-certificates.git` | Your certificates repo SSH URL |
| `MATCH_PASSWORD` | Your passphrase | The passphrase from Match init |
| `MATCH_GIT_PRIVATE_KEY` | SSH private key content | `cat ~/.ssh/match_deploy_key` |
| `TEAM_ID` | `ABC123XYZ9` | Apple Developer Portal → Membership |
| `APP_STORE_CONNECT_API_KEY_ID` | `ABC123DEFG` | From Step 1.2 |
| `APP_STORE_CONNECT_API_ISSUER_ID` | `12345678-...` | From Step 1.2 |
| `APP_STORE_CONNECT_API_KEY_CONTENT` | Base64 encoded | See below |

**To encode your API key:**

```bash
# Convert .p8 file to base64
base64 -i ~/Downloads/AuthKey_ABC123DEFG.p8 | tr -d '\n'
```

Copy the entire output as `APP_STORE_CONNECT_API_KEY_CONTENT`.

#### 3.2 Configure Repository Variables

Go to: **Settings → Secrets and variables → Actions → Variables → New repository variable**

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `BUNDLE_ID` | `com.yourcompany.yourapp` | Your app's bundle identifier |

#### 3.3 Create Environments

Go to: **Settings → Environments**

**Create "staging" environment:**
1. Click **New environment**
2. Name: `staging`
3. Click **Configure environment**
4. (Optional) Add deployment protection rules

**Create "production" environment:**
1. Click **New environment**
2. Name: `production`
3. Click **Configure environment**
4. (Recommended) Check **Required reviewers** and add yourself

#### 3.4 Configure Branch Protection

Go to: **Settings → Branches → Add branch protection rule**

**For `main` branch:**
- Branch name pattern: `main`
- [x] Require a pull request before merging
- [x] Require status checks to pass before merging
  - Search and add: `Lint`, `Test`, `Build`
- [x] Require branches to be up to date before merging

**For `develop` branch:**
- Repeat with branch name pattern: `develop`

---

### Part 4: Customize Your App

#### 4.1 Update Bundle Identifier

1. Open `App/App.xcworkspace` in Xcode
2. Select the **App** project in the navigator
3. Select the **App** target
4. Go to **Signing & Capabilities** tab
5. Update **Bundle Identifier** to match your `BUNDLE_ID` variable

#### 4.2 Update Signing Team

1. In the same **Signing & Capabilities** tab
2. Select your **Team** from the dropdown

#### 4.3 Add Your Code

Replace the sample code in `App/App/` with your own SwiftUI views.

#### 4.4 Add App Icon

1. Open `App/App/Assets.xcassets`
2. Select `AppIcon`
3. Drag your 1024x1024 app icon into the slot

---

## Local Development

### Running Locally

```bash
# Install dependencies (first time only)
./scripts/setup.sh

# Open in Xcode
open App/App.xcworkspace
```

### Running Tests

```bash
# Via Fastlane
cd App && bundle exec fastlane test

# Via Xcode
# Press Cmd+U or Product → Test
```

### Running Linter

```bash
# Check for issues
swiftlint lint App/App

# Auto-fix issues
swiftlint lint --fix App/App
```

### Building Locally

```bash
cd App

# Debug build (no signing)
bundle exec fastlane build_for_testing

# Release build (requires certificates)
bundle exec fastlane build_release
```

---

## Troubleshooting

### "No signing certificate found"

**Cause**: Match hasn't synced certificates to your machine.

**Fix**:
```bash
cd App
bundle exec fastlane match appstore --readonly
```

### "Code signing error: No profiles found"

**Cause**: Bundle ID mismatch between Xcode and Match.

**Fix**: Ensure your Xcode bundle identifier exactly matches the one used in Match.

### CI fails with "Could not find App Store Connect API key"

**Cause**: API key secret is incorrectly encoded.

**Fix**: Re-encode without line breaks:
```bash
base64 -i AuthKey.p8 | tr -d '\n'
```

### "xcodebuild: error: Could not find 'iPhone 16' simulator"

**Cause**: CI runner or your local machine doesn't have the expected simulator.

**Fix**: Set the `TEST_DEVICE` environment variable or update the device name in `App/fastlane/Fastfile` to match available simulators. You can also update `scripts/pre-commit` for local development.

### Pre-commit hook is slow

**Cause**: Running full test suite on every commit.

**Fix**: Edit `scripts/pre-commit` to only run linting:
```bash
# Comment out the test section for faster commits
```

---

## Fastlane Commands Reference

| Command | Description |
|---------|-------------|
| `fastlane test` | Run unit and UI tests |
| `fastlane lint` | Run SwiftLint |
| `fastlane build_for_testing` | Build without signing |
| `fastlane build_release` | Build signed IPA |
| `fastlane deploy_testflight` | Build and upload to TestFlight |
| `fastlane deploy_appstore` | Build and upload to App Store |
| `fastlane sync_certs` | Download certificates from Match |

---

## License

MIT
