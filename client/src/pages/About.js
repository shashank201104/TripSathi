import React from "react";
import { Link } from "react-router-dom";
import "./about.css";

const principles = [
  {
    number: "01",
    title: "Start with what matters",
    description:
      "Set your destination, dates, group size, budget, and interests to give your trip a useful starting point.",
  },
  {
    number: "02",
    title: "Make planning easier",
    description:
      "Use AI-generated itinerary suggestions to explore possibilities, then choose the plans that work for you.",
  },
  {
    number: "03",
    title: "Keep it together",
    description:
      "Save trips and places so your plans are easy to find again from your TripSathi dashboard.",
  },
];

const steps = [
  {
    number: "01",
    title: "Tell us the basics",
    description: "Choose where and when, then add your travel preferences.",
  },
  {
    number: "02",
    title: "Explore an itinerary",
    description: "Review a suggested itinerary shaped around your choices.",
  },
  {
    number: "03",
    title: "Save your trip",
    description: "Keep your plans in one place and return to them when needed.",
  },
];

const About = () => (
  <div className="about-page">
    <section className="about-hero">
      <div className="about-shell">
        <p className="about-eyebrow">About TripSathi</p>
        <h1>Thoughtful travel, planned around you.</h1>
        <p className="about-hero__copy">
          TripSathi helps turn a destination and a few preferences into a trip
          you can shape, organize, and revisit—without losing sight of what
          makes the journey yours.
        </p>
        <div className="about-actions">
          <Link className="about-button about-button--primary" to="/trip-planner">
            Plan a trip <span aria-hidden="true">↗</span>
          </Link>
          <Link
            className="about-button about-button--secondary"
            to="/#destinations"
          >
            Explore destinations
          </Link>
        </div>
      </div>
    </section>

    <section className="about-principles about-shell">
      <div className="about-section-heading">
        <p className="about-eyebrow">Why TripSathi</p>
        <h2>A little more intention. A lot more you.</h2>
        <p>
          Good planning should make room for the experience—not get in its way.
          TripSathi brings the essentials together so you can focus on the trip
          you want to take.
        </p>
      </div>
      <div className="about-principle-grid">
        {principles.map((principle) => (
          <article className="about-principle" key={principle.number}>
            <span>{principle.number}</span>
            <h3>{principle.title}</h3>
            <p>{principle.description}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="about-process">
      <div className="about-shell">
        <div className="about-section-heading">
          <p className="about-eyebrow">A clearer way to plan</p>
          <h2>From first thought to saved itinerary.</h2>
        </div>
        <div className="about-step-grid">
          {steps.map((step) => (
            <article className="about-step" key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="about-cta">
      <div className="about-shell about-cta__inner">
        <div>
          <p className="about-eyebrow">Your next story starts somewhere</p>
          <h2>Ready when you are.</h2>
        </div>
        <Link className="about-button about-button--light" to="/trip-planner">
          Start planning <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  </div>
);

export default About;
