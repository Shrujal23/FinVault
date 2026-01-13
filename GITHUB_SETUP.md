# Step-by-Step Guide: Push FinVault to GitHub

## 📋 Prerequisites
- Git installed on your computer
- GitHub account created
- Project is ready (README created, sensitive data handled)

## 🚀 Step-by-Step Instructions

### Step 1: Create a New Repository on GitHub

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name:** `finvault` (or your preferred name)
   - **Description:** "Full-stack portfolio management system built with Spring Boot and React"
   - **Visibility:** Choose **Public** (for portfolio) or **Private**
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

### Step 2: Initialize Git in Your Project (if not already done)

Open terminal/command prompt in your project root directory (`FINAL_PROJECT`):

```bash
# Check if git is already initialized
git status

# If not initialized, run:
git init
```

### Step 3: Add All Files to Git

```bash
# Add all files to staging area
git add .

# Check what will be committed (optional)
git status
```

### Step 4: Make Your First Commit

```bash
git commit -m "Initial commit: FinVault portfolio management system"
```

### Step 5: Add GitHub Remote Repository

Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/finvault.git
```

**OR if you prefer SSH:**
```bash
git remote add origin git@github.com:YOUR_USERNAME/finvault.git
```

### Step 6: Verify Remote Connection

```bash
git remote -v
```

You should see:
```
origin  https://github.com/YOUR_USERNAME/finvault.git (fetch)
origin  https://github.com/YOUR_USERNAME/finvault.git (push)
```

### Step 7: Push to GitHub

```bash
# Push to main branch
git branch -M main
git push -u origin main
```

**If you get authentication error:**
- GitHub no longer accepts passwords for HTTPS
- Use **Personal Access Token** instead:
  1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. Generate new token with `repo` permissions
  3. Use token as password when prompted

**OR use SSH:**
- Set up SSH keys: [GitHub SSH Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

### Step 8: Verify Upload

1. Go to your GitHub repository page
2. Refresh the page
3. You should see all your files including README.md

## ✅ Post-Upload Checklist

- [ ] Verify README.md displays correctly
- [ ] Check that `application.properties` is NOT visible (should be in .gitignore)
- [ ] Verify `application.properties.example` is visible
- [ ] Add repository description on GitHub
- [ ] Add topics/tags: `spring-boot`, `react`, `java`, `fintech`, `portfolio-management`
- [ ] Consider adding a license file (MIT License)

## 🔒 Security Reminder

**IMPORTANT:** Before pushing, ensure:
- ✅ `application.properties` is in `.gitignore`
- ✅ `application.properties.example` exists with placeholder values
- ✅ No API keys or passwords are in committed files
- ✅ Database credentials are placeholders

## 📝 Updating Repository Later

After making changes:

```bash
# Check what changed
git status

# Add changed files
git add .

# Commit changes
git commit -m "Description of your changes"

# Push to GitHub
git push
```

## 🎯 Common Issues & Solutions

### Issue: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/finvault.git
```

### Issue: "failed to push some refs"
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Issue: Authentication failed
- Use Personal Access Token instead of password
- Or set up SSH keys

## 🌟 Next Steps

1. **Add a License:** Create `LICENSE` file (MIT recommended)
2. **Add Topics:** On GitHub repo page, click ⚙️ → Topics → Add tags
3. **Pin Repository:** Pin it to your GitHub profile
4. **Update README:** Add screenshots when ready
5. **Create Releases:** Tag important versions

---

**Need Help?** Check [GitHub Docs](https://docs.github.com/en/get-started)
