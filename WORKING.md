## Artify — How to use the app (for users)

Artify is a place to discover unique artwork, meet artists, and request custom pieces.
This guide explains what you can do and how to get around.

### What you can do
- Browse artwork without creating an account.
- Open an artwork to see details and visit the artist’s profile.
- Contact an artist by sending a commission request (requires login).
- After logging in, access your dashboard and manage requests.

### Getting started
1) Go to the homepage.
2) If you just want to explore, click Explore to browse artworks and categories.
3) If you want to commission an artist or save progress, log in or sign up.

### Browsing artwork
- Explore shows a grid of artworks with images, titles, prices, and tags.
- Use the quick category chips (e.g., Paintings, Digital Art, Photography, Sculptures) to filter.
- Click an artwork to view its full details.
 - Tip: The navbar highlights your current section and, if you’re an artist, shows an Add artwork button.
 - Hearts indicate favorites. Logged‑in users see their favorites highlighted across listings.

### Viewing artwork details
- On an artwork page you’ll see a large image, title, price, tags, and description.
- You can jump to the artist’s profile from here.
 - Use the heart button to favorite/unfavorite; your state renders accurately on revisit.

### Meeting artists
- On an artist’s profile you’ll see their name, bio, and a portfolio of their artworks.
- Ready to collaborate? Click “Request commission” to contact the artist.
 - Favorite/unfavorite artworks directly from the profile grid.

### Requesting a commission (login required)
- Click “Request commission” on an artist profile, or go to the Commissions hub → New Request.
- The form includes:
  - Artist (search by name; pre‑filled from profile when applicable)
  - Title (optional)
  - Brief (minimum 10 characters)
  - Budget (optional)
  - Reference URLs (optional; one link per line)
  - Due date (optional)
- After submitting, you’ll see a toast confirmation and be taken to the Commissions hub.
- Note: You cannot request a commission from your own artist profile.

### Commissions hub
- Visit `/commissions` to manage requests.
- Customer: “My Requests” shows your commissions; “New Request” starts a new one.
- Artist: “Incoming” shows new requests; “Archive” shows accepted/declined/completed.
- The page auto‑updates on focus (and for artists every ~15s). Use the Refresh button if needed.

### Favorites
- Find all your favorited items at `/dashboard/favorites`.
- The page refreshes on mount and when returning focus, so it reflects recent changes.

### Adding your artwork (artists)
- Go to Explore. If you’re logged in as an artist, you’ll see an “Add artwork” button next to the page title.
- Use the “My Artworks” toggle on Explore to filter to only your pieces.
- The add page (`/dashboard/artworks/new`) accepts:
  - Image URL (paste a remote URL, e.g., Unsplash)
  - Title (≥ 3 chars), Price (≥ 0)
  - Optional description and comma‑separated tags (up to 5)
- After saving, you’ll be redirected back to Explore with your filter active.
- Note: Binary uploads are deferred in MVP; use URL‑based images for now.

### Deleting an artwork (artists)
- Open your Artist Profile page (e.g., from an artwork or via the Artists list).
- When viewing your own profile, each portfolio card shows a Delete button.
- Confirm the dialog to remove the artwork; the list refreshes automatically.

### In‑app notifications
- The app shows small toast messages for key actions (request created, accepted, declined, completed).
- Tab badges in the Commissions hub show counts for Incoming and My Requests.

### Signing in and out
- Use the Login or Sign Up buttons in the navigation when you’re not signed in.
- After you sign in, an avatar menu appears with Dashboard, Profile, My favorites, Commissions, and Logout.

### Profile settings
- Go to `/dashboard/profile` to update your name, avatar image URL, and bio.
- Role switching is temporarily disabled; it will be available soon.

### Tips
- If a page asks you to log in, you’ll be redirected back to what you were doing once you finish.
- You can always return to Explore to keep browsing or visit artist profiles from artwork pages.
### Errors & loading
- If something goes wrong, you’ll see a friendly error page with a retry.
- Lists and forms show loading skeletons while data is fetched.
