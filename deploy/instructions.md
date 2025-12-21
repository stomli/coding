# Deploying to Wix

## Quick Steps

### Method 1: Direct HTML Embed (Simplest)

1. **Zip your game files:**
   - Include: `index.html`, `guide.html`, `src/` folder, `config/` folder, `assets/` folder
   - Keep the folder structure intact

2. **Upload to a free hosting service:**
   - **GitHub Pages** (recommended):
     - Create a GitHub repo
     - Push all files
     - Enable GitHub Pages in repo settings
     - You'll get a URL like: `https://yourusername.github.io/yourrepo`
   
   - **Netlify Drop**:
     - Go to https://app.netlify.com/drop
     - Drag and drop your folder
     - Get instant URL

3. **Embed in Wix:**
   - In Wix Editor: Add → Embed → HTML iframe
   - Paste your hosted game URL
   - Resize the iframe to fit your page

### Method 2: Wix File Manager Upload

1. **In Wix Dashboard:**
   - Go to your site dashboard
   - Click "Site Files" or "File Manager"

2. **Upload files:**
   - Upload `index.html` (may need to rename to avoid conflicts)
   - Upload entire `src/` folder maintaining structure
   - Upload `config/` and `assets/` folders

3. **Create HTML Component:**
   - In Wix Editor: Add → Embed → HTML Code
   - Add an iframe pointing to your uploaded files:
   ```html
   <iframe src="/files/index.html" style="width:100%; height:800px; border:none;"></iframe>
   ```

### Method 3: Use Wix Velo (Advanced)

If you want the game fully integrated:
1. Enable Wix Velo (formerly Corvid)
2. Add your JavaScript modules to Velo's backend/public folders
3. Use Velo to manage game state, scores, etc.

## Recommended Approach

**Use GitHub Pages + Wix iFrame:**

1. Create GitHub repo for your game
2. Push all files
3. Enable GitHub Pages
4. Embed in Wix using HTML iframe

This keeps your game code separate and easier to update!

## File Checklist

Make sure these are included:
- ✅ index.html (main game)
- ✅ guide.html (instructions)
- ✅ src/ folder (all JavaScript modules)
- ✅ src/styles/ folder (CSS files)
- ✅ config/ folder (game configuration)
- ✅ assets/ folder (if you have images/sounds)

## Notes

- Ensure all file paths are **relative** (no absolute paths like `C:\Users\...`)
- Test your game works when hosted before embedding in Wix
- The game is designed to be responsive and should work in an iframe
