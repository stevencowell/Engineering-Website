# PR Workaround for "Binary files are not supported"

If pull request creation fails with a message like **"Binary files are not supported"**, use this workflow:

1. Check staged files for binaries before committing:
   ```bash
   ./scripts/check-no-binary-staged.sh
   ```
2. If binary files are listed, remove them from the commit:
   ```bash
   git reset HEAD <file>
   # or
   git rm --cached <file>
   ```
3. Replace the binary with one of these options:
   - A link to an existing web page/resource.
   - A text/HTML summary in this repository.
   - Git LFS (if enabled on the remote).

## Optional: local pre-commit hook

To enforce this automatically on your machine:

```bash
ln -sf ../../scripts/check-no-binary-staged.sh .git/hooks/pre-commit
```

This blocks commits that include staged binary files.
