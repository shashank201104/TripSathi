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

## License

This project was developed for educational and portfolio purposes.
