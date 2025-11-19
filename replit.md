# Caffè Admin System - Replit Project

## Overview
This is a web-based admin system for managing cafe website content through Supabase. The project is a static HTML/CSS/JavaScript website with dynamic content loading from Supabase database. It allows administrators to register, log in, and edit website content in real-time.

**Current State**: Fully configured and running on Replit environment.

## Recent Changes
- **2025-11-19**: Initial Replit environment setup
  - Installed Python 3.11 for serving static files
  - Configured workflow to serve site on port 5000 with 0.0.0.0 binding
  - Updated .gitignore for Python and Replit environment
  - Created project documentation
- **2025-11-19**: Comprehensive visual enhancement with images across all pages
  - **Homepage (index.html)**: 
    - Added coffee shop interior background to hero section
    - Added unique background images to all three category cards (coffee, pastries, cozy cafe)
  - **Menu Page (meny.html)**: 
    - Added coffee drink background to hero section
  - **About Page (om-oss.html)**: 
    - Added barista making coffee background to hero section
  - **Location Page (sted.html)**: 
    - Added coffee shop exterior background to hero section
  - **Contact Page (kontakt.html)**: 
    - Added friendly customer service background to hero section
  - All images include dark green gradient overlays (0.75 alpha) for text readability
  - Downloaded 11 high-quality stock images stored in attached_assets/stock_images/
  - Maintained consistent design and brand colors across all pages

## Project Architecture

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Backend**: Supabase (external service for authentication and database)
- **Server**: Python HTTP server (development)
- **Languages**: Norwegian (primary content language)

### File Structure
```
/
├── index.html              # Homepage
├── admin.html              # Admin login and dashboard
├── meny.html               # Menu page
├── om-oss.html             # About us page
├── sted.html               # Location page
├── kontakt.html            # Contact page
├── css/
│   ├── style.css           # Main website styles
│   ├── admin.css           # Admin panel styles
│   ├── menu-styles.css     # Menu-specific styles
│   └── animations.css      # Animation effects
├── js/
│   ├── admin.js            # Admin functionality
│   ├── content-loader-supabase.js  # Dynamic content loading
│   ├── mobile-menu.js      # Mobile menu handler
│   └── meny.js             # Menu page functionality
├── lib/
│   └── supabaseClient.js   # Supabase configuration and client
└── assets/
    ├── text/               # JSON content files (fallback)
    └── *.png               # Logo and images
```

### Key Features
1. **Secure Authentication**: Supabase Auth for admin users
2. **Live Content Editing**: JSON editor in admin dashboard
3. **Persistent Storage**: Content stored in Supabase database
4. **Real-time Updates**: Changes reflect immediately
5. **Responsive Design**: Mobile-friendly interface
6. **Fallback System**: Local JSON files if Supabase unavailable

### Supabase Integration
- **Project URL**: `https://kafe-aroma-supabase.cool.ropro.no`
- **Authentication**: Email/password via Supabase Auth
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Content Storage**: `json_files` table stores editable content

### Content Loading System
1. **Primary**: Attempts to load from Supabase database
2. **Fallback**: Loads from local JSON files in `/assets/text/`
3. **Caching**: In-memory cache for performance

## Development

### Running Locally on Replit
The workflow is configured to automatically start the web server:
- **Command**: `python3 -m http.server 5000 --bind 0.0.0.0`
- **Port**: 5000 (configured for Replit webview)
- **Access**: Click the webview tab in Replit

### Admin Access
- Navigate to `/admin.html` to access the admin panel
- Register a new admin user or log in with existing credentials
- Edit content for different pages from the dashboard

### Content Files
Editable content is stored in both:
- **Supabase**: Primary storage (when connected)
- **Local JSON**: Fallback files in `/assets/text/`:
  - `content.json` - Homepage content
  - `about.json` - About page content
  - `location.json` - Location page content
  - `contact-page.json` - Contact page content

## Deployment
This project is configured as a static website and can be deployed directly from Replit using the publish feature.

## User Preferences
*No specific user preferences recorded yet.*

## Notes
- The site uses Norwegian language for content
- Supabase credentials are hardcoded in `lib/supabaseClient.js`
- Mobile menu functionality included for responsive design
- All dynamic content loads via JavaScript modules
