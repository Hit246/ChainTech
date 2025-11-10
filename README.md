## Simple React Account Manager (No Build Step)

This is a minimal React (v18 via CDN) single‑page app that demonstrates:
- Login page
- Registration page
- Account page (view and edit)

Data is stored in `localStorage` in your browser. This is for demo purposes only.

### How to run
1. Open the folder:
   - `From Your Folder location`
2. Double‑click `index.html` to open it in your browser.
   - Alternatively, right‑click and choose “Open with” your preferred browser.

No server or Node.js is required.

### Notes
- React v18 and ReactDOM v18 are loaded via CDN, fulfilling the “React v16+” requirement.
- A tiny hash‑based router is used (no external dependencies).
- Passwords are stored in plain text in `localStorage` for simplicity. Do not use real credentials.
- Code includes brief comments and aims to remain simple and readable.

### Resetting the demo
If you want to clear all data:
1. Open your browser devtools console and run:
   ```js
   localStorage.removeItem("app.users");
   localStorage.removeItem("app.session");
   ```
2. Refresh the page.


