# TripSathi

TripSathi is an AI-powered travel planning platform that helps users create personalized trip itineraries based on destination, budget, duration, and travel preferences.

The application combines AI-generated recommendations with real-world map and routing services to provide an interactive travel planning experience.

---

## Live Demo

URL: https://trip-sathi-gray.vercel.app


---

## Developed By

**Shashank Saini**

B.Sc. Computer Science (Hons) 
, Masters of Computer Applications(MCA) 

---

## Project Overview

TripSathi allows users to:

- Generate AI-based travel itineraries
- Discover nearby attractions and places
- View destinations on interactive maps
- Save and manage trips
- Customize plans according to budget and interests
- Access trip information through a secure user account

---

## Key Features

### AI Itinerary Generation

- Personalized trip planning using Google Gemini AI
- Day-wise travel schedules
- Activity recommendations
- Budget-aware suggestions

### Maps & Location Services

- OpenStreetMap integration
- Place search and geocoding
- Nearby attractions discovery
- Route generation using OSRM

### User Management

- JWT Authentication
- Secure Login & Registration
- Protected Routes
- User Profiles
- Saved Trips

### Modern UI

- Responsive design
- Interactive maps
- Smooth animations
- Mobile-friendly interface

---

## Tech Stack

### Frontend

- React.js
- Tailwind CSS
- React Router
- React Query
- Axios
- Framer Motion

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.io

### AI & External Services

- Google Gemini AI
- OpenStreetMap
- Nominatim API
- Overpass API
- OSRM Routing

---

## System Architecture

```text
React Frontend
      │
      ▼
Express REST API
      │
 ┌────┼────┐
 ▼    ▼    ▼
MongoDB Gemini OSM Services
```

---

## Challenges Solved

### Replacing Paid Map APIs

Instead of relying on paid services such as Google Maps, TripSathi uses:

- OpenStreetMap
- Nominatim
- Overpass API
- OSRM

This significantly reduced operational costs while maintaining functionality.

### AI Response Structuring

Implemented prompt engineering and response parsing to generate structured itineraries that can be displayed directly within the application.

### Secure Authentication

Built a JWT-based authentication system with protected routes and secure session management.

---

## Project Highlights

- Full-Stack MERN Application
- AI-Powered Trip Planning
- Interactive Maps
- Secure Authentication
- Real-Time Travel Data
- Production Deployment

---

## Future Enhancements

- Collaborative trip planning
- Expense tracking
- Hotel and transport recommendations
- Mobile application
- Offline itinerary access

---

## Public SEO Pages and Deployment

The public landing page, destination guides, travel articles, About, Contact, and
Privacy pages are generated as static HTML during the client production build.
The authenticated planning application remains a React client-side app. Public
content is maintained in `client/src/data/destinations.json` and
`client/src/data/articles.json`; the post-build script writes the page files,
`sitemap.xml`, and the custom 404 page into `client/build`.

For Vercel, keep the project root set to the repository root so
[`vercel.json`](./vercel.json) can run the root build script and publish
`client/build`. Deploying with `client` as the project root will not use this
root deployment configuration.

Configure these values in the relevant deployment environment:

| Variable | Where | Purpose |
| --- | --- | --- |
| `REACT_APP_API_URL` | Vercel build | Public API base URL, for example `https://tripsathi.onrender.com/api`. |
| `REACT_APP_GA_MEASUREMENT_ID` | Vercel build (optional) | Enables consent-gated Google Analytics 4. Analytics is not loaded until a visitor opts in. |
| `REACT_APP_GOOGLE_SITE_VERIFICATION` | Vercel build (optional) | The verification token supplied by Google Search Console. Adding it to the HTML does not itself verify an account or property. |
| `ALLOWED_ORIGINS` | Render server | Comma-separated frontend origins permitted by the API's CORS configuration. |
| `CONTACT_EMAIL_TO`, `CONTACT_EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Render server | Enables delivery for the public contact form. `SMTP_SECURE=true` may be set for providers requiring implicit TLS. |

Never put Gemini credentials, SMTP passwords, JWT secrets, or other private
server credentials in `REACT_APP_*` variables; CRA embeds those values in the
public frontend bundle. Without SMTP configuration, the contact endpoint
returns an explicit unavailable response rather than pretending a message was
sent.

After deployment, add and verify the production property in Google Search
Console, then submit `https://trip-sathi-gray.vercel.app/sitemap.xml`. Confirm
that the property, sitemap fetch, canonical URLs, redirect behavior, and
rendered public pages are correct in the deployed environment.

---

## License

This project was developed for educational and portfolio purposes.
