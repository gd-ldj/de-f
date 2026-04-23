#!/bin/bash

# DeTake Auto Commit Script
# This script automates the complete workflow:
# 1. Git status check
# 2. TypeScript type checking
# 3. Unit test execution
# 4. Project build validation
# 5. E2E test execution
# 6. Auto cleanup test artifacts
# 7. Auto git commit (following Conventional Commits)

set -e  # Exit on error

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Start workflow
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  DeTake Automated Workflow${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Step 1: Git status check
print_step "Step 1/6: Checking git status..."
if ! git diff --quiet || ! git diff --cached --quiet; then
    print_success "Changes detected"
    git status --short
else
    print_error "No changes to commit"
    exit 1
fi

# Step 2: TypeScript type checking
print_step "Step 2/6: Running TypeScript type check..."
if npx tsc --noEmit; then
    print_success "TypeScript type check passed (0 errors)"
else
    print_error "TypeScript type check failed"
    exit 1
fi

# Step 3: Unit test execution
print_step "Step 3/7: Running unit tests..."
if pnpm test:unit; then
    print_success "Unit tests passed"
else
    print_error "Unit tests failed"
    exit 1
fi

# Step 4: Build validation
print_step "Step 4/7: Running build validation..."
if pnpm build; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Step 5: E2E test execution
print_step "Step 5/7: Running E2E tests..."
if pnpm test:e2e; then
    print_success "All E2E tests passed"
else
    print_error "E2E tests failed"
    exit 1
fi

# Step 6: Cleanup test artifacts
print_step "Step 6/7: Cleaning up test artifacts..."
# Remove playwright test results and temporary files
rm -rf playwright-report
rm -rf test-results
rm -rf .next
print_success "Test artifacts cleaned up"

# Step 7: Auto git commit
print_step "Step 7/7: Creating git commit..."

# Analyze changes to determine commit type
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || git diff --name-only)

# Initialize commit type and scope
COMMIT_TYPE=""
COMMIT_SCOPE=""
COMMIT_MESSAGE=""

# Determine commit type based on file changes
if echo "$CHANGED_FILES" | grep -q "^app/"; then
    if echo "$CHANGED_FILES" | grep -q "page.tsx"; then
        COMMIT_TYPE="feat"
        COMMIT_SCOPE="page"
    else
        COMMIT_TYPE="feat"
        COMMIT_SCOPE="ui"
    fi
elif echo "$CHANGED_FILES" | grep -q "^components/"; then
    COMMIT_TYPE="feat"
    COMMIT_SCOPE="component"
elif echo "$CHANGED_FILES" | grep -q "^lib/api/"; then
    COMMIT_TYPE="feat"
    COMMIT_SCOPE="api"
elif echo "$CHANGED_FILES" | grep -q "^lib/"; then
    COMMIT_TYPE="feat"
    COMMIT_SCOPE="lib"
elif echo "$CHANGED_FILES" | grep -q "test"; then
    COMMIT_TYPE="test"
    COMMIT_SCOPE=""
elif echo "$CHANGED_FILES" | grep -q "\.md$"; then
    COMMIT_TYPE="docs"
    COMMIT_SCOPE=""
elif echo "$CHANGED_FILES" | grep -q "package.json\|pnpm-lock.yaml"; then
    COMMIT_TYPE="chore"
    COMMIT_SCOPE="deps"
else
    COMMIT_TYPE="chore"
    COMMIT_SCOPE=""
fi

# Build scope string
SCOPE_STRING=""
if [ -n "$COMMIT_SCOPE" ]; then
    SCOPE_STRING="($COMMIT_SCOPE)"
fi

# Get a brief summary of changes
SUMMARY=$(git diff --cached --stat 2>/dev/null || git diff --stat | head -n 3 | tail -n 1)

# Interactive commit message
echo ""
echo -e "${YELLOW}Detected commit type: ${COMMIT_TYPE}${SCOPE_STRING}${NC}"
echo "Changed files:"
echo "$CHANGED_FILES" | sed 's/^/  - /'
echo ""
read -p "Enter commit message (without type/scope prefix): " USER_MESSAGE

if [ -z "$USER_MESSAGE" ]; then
    print_error "Commit message cannot be empty"
    exit 1
fi

# Construct full commit message
FULL_MESSAGE="${COMMIT_TYPE}${SCOPE_STRING}: ${USER_MESSAGE}

- ✅ TypeScript type check passed
- ✅ Unit tests passed
- ✅ Build validation completed
- ✅ E2E tests passed

🤖 Generated with automated workflow"

# Stage tracked file modifications
git add -u

# Stage untracked (new) files, excluding sensitive patterns
SENSITIVE_PATTERN='\.env$|\.env\.|credentials|\.key$|\.pem$|\.secret'
UNTRACKED=$(git ls-files --others --exclude-standard)
if [ -n "$UNTRACKED" ]; then
    SAFE_UNTRACKED=$(echo "$UNTRACKED" | grep -vE "$SENSITIVE_PATTERN" || true)
    SKIPPED_UNTRACKED=$(echo "$UNTRACKED" | grep -E "$SENSITIVE_PATTERN" || true)
    if [ -n "$SAFE_UNTRACKED" ]; then
        echo "$SAFE_UNTRACKED" | xargs git add --
    fi
    if [ -n "$SKIPPED_UNTRACKED" ]; then
        print_warning "Skipped sensitive untracked files:"
        echo "$SKIPPED_UNTRACKED" | sed 's/^/  ⚠ /'
    fi
fi

# Safety check: warn about sensitive files that may already be staged
STAGED_SENSITIVE=$(git diff --cached --name-only | grep -E "$SENSITIVE_PATTERN" || true)
if [ -n "$STAGED_SENSITIVE" ]; then
    print_warning "Sensitive files detected in staging area:"
    echo "$STAGED_SENSITIVE" | sed 's/^/  ⚠ /'
    read -p "Continue with commit? (y/N): " CONFIRM
    if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
        echo "$STAGED_SENSITIVE" | xargs git reset HEAD --
        print_warning "Sensitive files unstaged"
    fi
fi

# Create commit
git commit -m "$FULL_MESSAGE"

print_success "Commit created successfully"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Workflow completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Commit details:"
git log -1 --oneline
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  - Review commit: git show"
echo "  - Push to remote: git push"
