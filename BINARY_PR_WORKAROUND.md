# PR Workaround for "Binary files are not supported"

If pull request creation stalls (for example, a "Creating pull request..." spinner) or fails with **"Binary files are not supported"**, use this workflow.

## 1) Check staged files before committing

```bash
./scripts/check-no-binary-staged.sh
```

If binary files are listed, remove them from the commit:

```bash
git reset HEAD <file>
# or
git rm --cached <file>
```

## 2) Check the whole branch diff against your base branch

Even if your current index is clean, the branch may already include binary changes from earlier commits.

```bash
./scripts/check-branch-binary-diff.sh origin/main
# or: ./scripts/check-branch-binary-diff.sh main
```

If this reports binaries, remove/rework those commits (e.g., rebase/edit/squash) before creating the PR.

## 3) Replace binaries with PR-safe alternatives

- A link to an existing web page/resource.
- A text/HTML summary in this repository.
- Git LFS (if enabled on the remote).

## Optional: local pre-commit hook

To enforce staged-file checks automatically on your machine:

```bash
ln -sf ../../scripts/check-no-binary-staged.sh .git/hooks/pre-commit
```

This blocks commits that include newly staged binary files.
