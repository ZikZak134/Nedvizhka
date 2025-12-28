# Git Setup Instructions

## 1. Init Repository

Run the following command in the root of the workspace:

```powershell
git init
```

## 2. Verify Exclusion

Check that `.env` and `__pycache__` are ignored:

```powershell
git status
```

*(You should NOT see `.env` in the untracked files list)*

## 3. Initial Commit

```powershell
git add .
git commit -m "feat: project init (fastapi + nextjs + automation)"
```

## 4. Branching

Start development on `dev`:

```powershell
git checkout -b dev
```
