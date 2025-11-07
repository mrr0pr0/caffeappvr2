# Deployment Guide - Caffè Admin System

## Quick Start (5 Steps)

### Step 1: Set Up Supabase Database
1. Go to https://supabase.com/dashboard
2. Select your project: `zdbewjpdycmmfqdnmwrp`
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the entire contents of `setup-database.sql`
6. Paste it into the SQL editor
7. Click "Run" (or press Ctrl+Enter)
8. You should see "Success. No rows returned"

### Step 2: Enable Email Confirmations (Optional but Recommended)
1. In Supabase Dashboard, go to "Authentication" → "Settings"
2. Scroll to "Email Auth"
3. Make sure "Enable email confirmations" is checked
4. Save changes

### Step 3: Register Your First Admin
1. Open your website
2. Navigate to `/admin.html`
3. Click "Registrer Admin"
4. Fill in:
   - Email: your-email@example.com
   - Password: (at least 6 characters)
   - Full Name: Your Name
5. Click "Registrer"
6. Check your email for confirmation link
7. Click the confirmation link
8. Return to `/admin.html` and log in

### Step 4: Test the Admin Panel
1. Log in to `/admin.html`
2. Select "Hovedside" tab
3. Edit some content in the JSON editor
4. Click "💾 Lagre Endringer"
5. Open your main website (`index.html`)
6. Verify the changes appear

### Step 5: Deploy to Production
Upload these files to your web server:
```
/admin.html
/css/admin.css
/js/admin.js
/js/content-loader-supabase.js
/lib/supabaseClient.js
/index.html (updated version)
```

## How to Use the Admin Panel

### Editing Homepage Content
1. Log in to `/admin.html`
2. Click "Hovedside" tab
3. Edit the JSON content:
   ```json
   {
     "hero": {
       "title": "Your new title",
       "subtitle": "Your new subtitle"
     }
   }
   ```
4. Click "💾 Lagre Endringer"

### Editing About Page
1. Click "Om Oss" tab
2. Edit content
3. Save changes

### Editing Location Page
1. Click "Sted" tab
2. Update address, hours, etc.
3. Save changes

### Editing Contact Page
1. Click "Kontakt" tab
2. Update contact information
3. Save changes

## Important JSON Fields

### Homepage (content.json)
- `hero.title`: Main headline
- `hero.subtitle`: Subtitle text
- `menu.categories.coffee.items`: Coffee menu items
- `menu.categories.bakery.items`: Bakery menu items
- `menu.categories.lunch.items`: Lunch menu items

### About Page (about.json)
- `hero.title`: Page title
- `story.paragraphs`: Story text
- `team.members`: Team member information

### Location Page (location.json)
- `address`: Physical address
- `hours.schedule`: Opening hours
- `features.items`: Location features

### Contact Page (contact-page.json)
- `contactInfo.items`: Contact methods
- `contactForm`: Form configuration

## Security Best Practices

1. **Strong Passwords**: Use passwords with at least 12 characters
2. **Limited Admin Users**: Only create admin accounts for trusted users
3. **Regular Backups**: Export your JSON content regularly
4. **Monitor Changes**: Check the `updated_by` field in Supabase to track who made changes

## Troubleshooting

### "JWT could not be decoded" Error
- This means the database isn't set up yet
- Run the `setup-database.sql` script in Supabase SQL Editor

### Changes Not Showing
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for errors (F12)
- Verify JSON syntax is valid
- Make sure you clicked "Lagre Endringer"

### Can't Log In
- Verify email is confirmed
- Check spam folder for confirmation email
- Try password reset
- Ensure database setup is complete

### "Failed to fetch" Error
- Check internet connection
- Verify Supabase project is active
- Check browser console for details

## Database Management

### View All Content
In Supabase Dashboard:
1. Go to "Table Editor"
2. Select `json_files` table
3. View all stored content

### Manual Content Update
1. Click on a row to edit
2. Modify the `content` JSONB field
3. Click "Save"

### Backup Content
```sql
SELECT * FROM json_files;
```
Copy the results and save to a file.

### Restore Content
```sql
INSERT INTO json_files (filename, content, updated_by)
VALUES ('content', '{"your": "json"}', 'admin@example.com')
ON CONFLICT (filename) 
DO UPDATE SET content = EXCLUDED.content;
```

## Adding More Features

### Add New JSON Files
1. Create new JSON file in `/assets/text/`
2. Add new tab in `admin.html`:
   ```html
   <button class="nav-btn" data-file="new-file">New Page</button>
   ```
3. Add to `fileNames` object in `admin.js`:
   ```javascript
   'new-file': 'New Page'
   ```

### Add Version History
Modify the database to track versions:
```sql
CREATE TABLE json_file_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename TEXT NOT NULL,
    content JSONB NOT NULL,
    version INTEGER NOT NULL,
    updated_by TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Production Checklist

- [ ] Database setup SQL executed
- [ ] First admin user created and confirmed
- [ ] Test edit on each page type
- [ ] Verify changes appear on public website
- [ ] All files uploaded to web server
- [ ] Admin URL is accessible
- [ ] Email confirmations are working
- [ ] Backup of original JSON files created

## Support

If you encounter issues:
1. Check browser console (F12)
2. Check Supabase logs
3. Verify all files are uploaded
4. Test with a different browser
5. Clear cache and cookies

## Next Steps

After successful deployment:
1. Train your team on using the admin panel
2. Set up regular content backups
3. Monitor the `json_files` table for changes
4. Consider adding more admin features as needed

---

**Note**: Keep your Supabase credentials secure and never commit them to public repositories.