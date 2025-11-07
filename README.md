# Caffè Admin System

A web-based admin system for managing cafe website content through Supabase.

## Features

- 🔐 **Secure Authentication**: Admin users can register and log in
- ✏️ **Live Content Editing**: Edit JSON files directly in the browser
- 💾 **Persistent Storage**: All changes are saved to Supabase and available to all users
- 🔄 **Real-time Updates**: Content changes are immediately reflected on the website
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### 1. Supabase Configuration

Your Supabase project is already configured in `/lib/supabaseClient.js`:
- Project URL: `https://zdbewjpdycmmfqdnmwrp.supabase.co`
- Anon Key: Already set

### 2. Database Setup

Run the SQL script to create the necessary database table:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Copy and paste the contents of `setup-database.sql`
5. Click "Run" to execute the SQL

This will create:
- `json_files` table to store your editable content
- Proper indexes for performance
- Row Level Security (RLS) policies:
  - Anyone can read content (public access)
  - Only authenticated users can edit content

### 3. Register Your First Admin User

1. Open `admin.html` in your browser
2. Click "Registrer Admin"
3. Fill in:
   - Email address
   - Password (minimum 6 characters)
   - Full name
4. Click "Registrer"
5. You'll receive a confirmation email from Supabase
6. Click the confirmation link in the email
7. Return to `admin.html` and log in

### 4. Using the Admin Panel

#### Logging In
1. Navigate to `admin.html`
2. Enter your email and password
3. Click "Logg Inn"

#### Editing Content
1. Select the page you want to edit from the navigation tabs:
   - Hovedside (Homepage)
   - Om Oss (About)
   - Sted (Location)
   - Kontakt (Contact)
2. Edit the JSON content in the text editor
3. Click "💾 Lagre Endringer" to save
4. Changes are immediately available to all website visitors

#### JSON Format
The content is stored in JSON format. Be careful to maintain valid JSON syntax:
- Use double quotes for strings
- Don't add trailing commas
- Maintain proper nesting and brackets

### 5. How It Works

#### Content Loading Priority
1. **Supabase First**: The website tries to load content from Supabase
2. **Local Fallback**: If Supabase is unavailable, it loads from local JSON files
3. **Cache**: Content is cached in memory for performance

#### File Structure
```
/assets/text/
  ├── content.json       (Homepage content)
  ├── about.json         (About page content)
  ├── location.json      (Location page content)
  └── contact-page.json  (Contact page content)
```

#### Admin System Files
```
/admin.html              (Admin login and dashboard)
/css/admin.css          (Admin panel styling)
/js/admin.js            (Admin functionality)
/js/content-loader-supabase.js  (Content loading with Supabase support)
```

### 6. Security Notes

- ✅ Admin authentication is handled by Supabase Auth
- ✅ Only authenticated users can edit content
- ✅ All users can view content (public website)
- ✅ Passwords are securely hashed by Supabase
- ✅ Row Level Security (RLS) is enabled

### 7. Troubleshooting

#### Can't log in?
- Make sure you've confirmed your email
- Check that the database setup SQL has been run
- Verify your Supabase project is active

#### Changes not appearing?
- Clear your browser cache
- Check the browser console for errors
- Verify the JSON syntax is valid
- Make sure you clicked "Lagre Endringer"

#### Database errors?
- Verify the `setup-database.sql` script was run successfully
- Check RLS policies are enabled
- Ensure your Supabase project has the correct configuration

### 8. Adding More Admin Users

To add additional admin users:
1. Have them navigate to `admin.html`
2. Click "Registrer Admin"
3. Complete the registration form
4. Confirm their email
5. They can now log in and edit content

### 9. Deployment

When deploying your website:
1. Upload all files to your web server
2. Ensure the Supabase configuration in `/lib/supabaseClient.js` is correct
3. The admin panel will be accessible at `https://yourdomain.com/admin.html`
4. Consider adding `.htaccess` rules to protect the admin URL if needed

### 10. Support

For issues or questions:
- Check the browser console for error messages
- Verify Supabase dashboard for database status
- Review the JSON syntax in the editor
- Ensure all files are properly uploaded

## File Descriptions

- **admin.html**: Admin login and dashboard interface
- **admin.css**: Styling for the admin panel
- **admin.js**: Admin functionality (login, editing, saving)
- **content-loader-supabase.js**: Loads content from Supabase or local files
- **setup-database.sql**: SQL script to set up the database
- **supabaseClient.js**: Supabase configuration and client initialization

## License

This admin system is part of the Caffè website project.