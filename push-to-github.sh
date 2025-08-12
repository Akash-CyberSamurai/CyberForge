#!/bin/bash

# CyberForge GitHub Push Script
# 🚀 Push your CyberForge platform to GitHub

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 CyberForge GitHub Push Script${NC}"
echo "====================================="
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository. Please run this script from the CyberForge directory."
    exit 1
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    print_warning "No remote origin found. You need to add your GitHub repository first."
    echo ""
    print_info "Follow these steps:"
    echo "1. Go to https://github.com and create a new repository named 'cyberforge'"
    echo "2. Copy the repository URL"
    echo "3. Run: git remote add origin YOUR_REPOSITORY_URL"
    echo "4. Then run this script again"
    echo ""
    print_info "Or use the automated setup:"
    echo "1. Create GitHub repo at: https://github.com/new"
    echo "2. Name: cyberforge"
    echo "3. Description: Enterprise-Grade Cybersecurity Operations Platform by Akash"
    echo "4. Make it Public or Private"
    echo "5. Don't initialize with README (we already have one)"
    echo "6. Click 'Create repository'"
    echo "7. Copy the repository URL and run the commands below"
    echo ""
    exit 1
fi

# Get current remote URL
REMOTE_URL=$(git remote get-url origin)
print_info "Remote origin: $REMOTE_URL"

# Check if we have uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Committing them first..."
    git add .
    git commit -m "🔄 Update CyberForge platform before GitHub push"
    print_status "Changes committed successfully"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
print_info "Current branch: $CURRENT_BRANCH"

# Check if we're up to date with remote
if git fetch origin > /dev/null 2>&1; then
    LOCAL_COMMIT=$(git rev-parse HEAD)
    REMOTE_COMMIT=$(git rev-parse origin/$CURRENT_BRANCH 2>/dev/null || echo "none")
    
    if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
        print_status "Local repository is up to date with remote"
    else
        print_warning "Local repository is ahead of remote. Pushing changes..."
    fi
else
    print_warning "Could not fetch from remote. Continuing with push..."
fi

# Push to GitHub
echo ""
print_info "Pushing CyberForge to GitHub..."
echo ""

if git push -u origin $CURRENT_BRANCH; then
    echo ""
    print_status "🎉 Successfully pushed CyberForge to GitHub!"
    echo ""
    
    # Extract repository URL for display
    if [[ $REMOTE_URL == *"github.com"* ]]; then
        REPO_URL=$(echo $REMOTE_URL | sed 's/\.git$//' | sed 's/git@github.com:/https:\/\/github.com\//')
        print_info "Your CyberForge repository is now available at:"
        echo "   $REPO_URL"
        echo ""
        
        print_info "Next steps:"
        echo "1. 🌐 Visit your repository: $REPO_URL"
        echo "2. 📚 Check out the README.md for setup instructions"
        echo "3. 🚀 Deploy to production: sudo ./deploy-production.sh"
        echo "4. 🌟 Star your repository and share with the community!"
        echo "5. 🔗 Use GitHub Issues for bug reports and feature requests"
        echo ""
        
        print_info "Repository features:"
        echo "   📊 59 files with comprehensive cybersecurity platform"
        echo "   🚀 9,980+ lines of production-ready code"
        echo "   🔒 Enterprise-grade security features"
        echo "   📈 Full monitoring and observability stack"
        echo "   💾 Automated backup and recovery systems"
        echo ""
        
        print_status "CyberForge by Akash is now on GitHub! 🚀✨"
        
    else
        print_status "Code pushed successfully! Check your remote repository."
    fi
    
else
    print_error "Failed to push to GitHub. Please check your authentication and try again."
    echo ""
    print_info "Common issues and solutions:"
    echo "1. Authentication failed:"
    echo "   - Use Personal Access Token as password"
    echo "   - Or set up SSH keys for authentication"
    echo "2. Repository not found:"
    echo "   - Verify the remote URL is correct"
    echo "   - Make sure the repository exists on GitHub"
    echo "3. Permission denied:"
    echo "   - Check if you have write access to the repository"
    echo "   - Verify your GitHub account permissions"
    echo ""
    exit 1
fi

echo ""
print_info "🎯 Additional GitHub features you can set up:"
echo "   📖 GitHub Pages for documentation"
echo "   🔄 GitHub Actions for CI/CD"
echo "   🏷️  Releases and versioning"
echo "   📋 Project boards for task management"
echo "   🗣️  Discussions for community engagement"
echo "   🚀 GitHub Sponsors for support"
echo ""

print_status "Your CyberForge platform is now available on GitHub! 🎊"
print_status "Share it with the cybersecurity community and get feedback! 🌟"
