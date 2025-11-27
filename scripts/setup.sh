#!/bin/bash
set -e

echo "🚀 Setting up iOS CI/CD Template..."

# Install Homebrew dependencies
echo "📦 Installing SwiftLint..."
brew bundle

# Install Ruby dependencies
echo "💎 Installing Fastlane..."
bundle install

# Setup git hooks
echo "🪝 Installing pre-commit hook..."
cp scripts/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Open App/App.xcworkspace in Xcode"
echo "  2. Configure your Team ID in Xcode signing settings"
echo "  3. Run: cd App && bundle exec fastlane match init"
echo "  4. Configure GitHub secrets (see README.md)"
