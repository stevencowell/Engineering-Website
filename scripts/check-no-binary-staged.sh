#!/usr/bin/env bash
set -euo pipefail

# Fails if staged changes include binary files.
# This helps avoid PR tooling errors like "Binary files are not supported".

staged_files=$(git diff --cached --name-only --diff-filter=ACMR)

[ -z "$staged_files" ] && exit 0

binary_files=()
while IFS= read -r file; do
  [ -z "$file" ] && continue
  if git diff --cached --numstat -- "$file" | awk '{print $1" "$2}' | grep -q '^- -$'; then
    binary_files+=("$file")
  fi
done <<< "$staged_files"

if [ ${#binary_files[@]} -gt 0 ]; then
  echo "ERROR: Staged binary file(s) detected:"
  printf ' - %s\n' "${binary_files[@]}"
  echo
  echo "Workaround:"
  echo "  1) Remove binary files from this commit (git reset HEAD <file> or git rm --cached <file>)."
  echo "  2) Host large/binary assets externally or via Git LFS, then link them in HTML/Markdown."
  exit 1
fi
