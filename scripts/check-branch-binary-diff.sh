#!/usr/bin/env bash
set -euo pipefail

# Detect binary files changed on this branch compared to a base ref.
# Helpful when PR tooling hangs/fails with "Binary files are not supported".

base_ref="${1:-}"

if [ -z "$base_ref" ]; then
  for candidate in origin/main origin/master main master; do
    if git rev-parse --verify --quiet "$candidate" >/dev/null; then
      base_ref="$candidate"
      break
    fi
  done
fi

if [ -z "$base_ref" ]; then
  echo "ERROR: Could not determine a base ref."
  echo "Usage: $0 <base-ref>"
  exit 2
fi

if ! git rev-parse --verify --quiet "$base_ref" >/dev/null; then
  echo "ERROR: Base ref '$base_ref' does not exist."
  exit 2
fi

merge_base=$(git merge-base "$base_ref" HEAD)
changed_files=$(git diff --name-only --diff-filter=ACMR "$merge_base"..HEAD)

[ -z "$changed_files" ] && exit 0

binary_files=()
while IFS= read -r file; do
  [ -z "$file" ] && continue
  if git diff --numstat "$merge_base"..HEAD -- "$file" | awk '{print $1" "$2}' | grep -q '^- -$'; then
    binary_files+=("$file")
  fi
done <<< "$changed_files"

if [ ${#binary_files[@]} -gt 0 ]; then
  echo "ERROR: Binary file(s) detected in branch diff against $base_ref:"
  printf ' - %s\n' "${binary_files[@]}"
  echo
  echo "These can cause PR creation to hang/fail in tools that do not support binary patches."
  echo "Remove them from the branch, or move assets to LFS/external hosting and commit links instead."
  exit 1
fi
