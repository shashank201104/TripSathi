const fs = require("fs");
const path = require("path");
const destinations = require("../src/data/destinations.json");
const articles = require("../src/data/articles.json");

const siteUrl = "https://trip-sathi-gray.vercel.app";
const defaultSocialImage =
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=85";
const buildDir = path.resolve(__dirname, "../build");
const baseDocumentPath = path.join(buildDir, "index.html");

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

const safeJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

const replaceMeta = (html, attribute, key, content) => {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta\\s+${attribute}="${escapedKey}"[^>]*>`, "i");
  const tag = content
    ? `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(content)}" />`
    : "";
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `  ${tag}\n</head>`);
};

const makeHead = (template, page) => {
  const socialImage = page.image || defaultSocialImage;
  let html = template.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(page.title)}</title>`);
  html = replaceMeta(html, "name", "description", page.description);
  html = replaceMeta(html, "name", "robots", page.robots || "index,follow");
  html = replaceMeta(html, "property", "og:title", page.title);
  html = replaceMeta(html, "property", "og:description", page.description);
  html = replaceMeta(html, "property", "og:type", page.type || "website");
  html = replaceMeta(html, "property", "og:url", page.canonical);
  html = replaceMeta(html, "property", "og:image", socialImage);
  html = replaceMeta(html, "name", "twitter:card", "summary_large_image");
  html = replaceMeta(html, "name", "twitter:title", page.title);
  html = replaceMeta(html, "name", "twitter:description", page.description);
  html = replaceMeta(html, "name", "twitter:image", socialImage);

  html = html.replace(/<link\s+rel="canonical"[^>]*>\s*/i, "");
  if (page.canonical) {
    html = html.replace("</head>", `  <link rel="canonical" href="${escapeHtml(page.canonical)}" />\n</head>`);
  }
  if (page.preloadImage && page.image) {
    html = html.replace(
      "</head>",
      `  <link rel="preload" as="image" data-seo-image="true" href="${escapeHtml(page.image)}" />\n</head>`
    );
  }
  html = html.replace(/<script id="trip-sathi-page-schema"[\s\S]*?<\/script>\s*/i, "");
  if (page.schema) {
    html = html.replace(
      "</head>",
      `  <script id="trip-sathi-page-schema" type="application/ld+json">${safeJson(page.schema)}</script>\n</head>`
    );
  }

  const verification = process.env.REACT_APP_GOOGLE_SITE_VERIFICATION;
  html = html.replace(/<meta\s+name="google-site-verification"[^>]*>\s*/i, "");
  if (verification) {
    html = html.replace(
      "</head>",
      `  <meta name="google-site-verification" content="${escapeHtml(verification)}" />\n</head>`
    );
  }
  return html;
};

const navigation = `
  <header class="seo-header">
    <a href="/" class="seo-brand">TripSathi</a>
    <nav aria-label="Main navigation">
      <a href="/destinations/">Destinations</a>
      <a href="/blog/">Travel guides</a>
      <a href="/about/">About</a>
      <a href="/contact/">Contact</a>
      <a href="/login">Sign in</a>
    </nav>
  </header>`;

const footer = `
  <footer class="seo-footer">
    <a href="/destinations/">Destination guides</a>
    <a href="/blog/">Travel articles</a>
    <a href="/about/">About</a>
    <a href="/contact/">Contact</a>
    <a href="/privacy/">Privacy</a>
  </footer>`;

const pageFrame = (content) =>
  `${navigation}<main class="seo-main">${content}</main>${footer}`;

const link = (href, text, className = "") =>
  `<a${className ? ` class="${className}"` : ""} href="${escapeHtml(href)}">${escapeHtml(text)}</a>`;

const siteSchema = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TripSathi",
    url: siteUrl,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TripSathi",
    url: siteUrl,
    inLanguage: "en",
  },
];

const breadcrumb = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

const renderHome = () => {
  const cards = destinations
    .map(
      (destination) => `
        <article class="seo-card">
          <a href="/destinations/${destination.slug}/">
            <img src="${escapeHtml(destination.image)}" alt="${escapeHtml(destination.imageAlt)}" width="960" height="600" loading="lazy" />
            <div class="seo-card-copy">
              <p>${escapeHtml(destination.region)}</p>
              <h2>${escapeHtml(destination.name)}</h2>
              <span>${escapeHtml(destination.summary)}</span>
            </div>
          </a>
        </article>`
    )
    .join("");
  const featuredArticles = articles.slice(0, 3).map((article) =>
    `<li>${link(`/blog/${article.slug}/`, article.title)}<p>${escapeHtml(article.description)}</p></li>`
  ).join("");
  return pageFrame(`
    <section class="seo-hero">
      <p class="seo-eyebrow">Travel, planned around you</p>
      <h1>Your next trip, thoughtfully planned.</h1>
      <p>Explore practical destination guides, then shape an editable itinerary around your own dates, budget, pace, and interests.</p>
      ${link("/destinations/", "Explore destination guides", "seo-button")}
      ${link("/blog/", "Read travel articles", "seo-text-link")}
    </section>
    <section>
      <p class="seo-eyebrow">Places worth the journey</p>
      <h2>Explore destination guides</h2>
      <div class="seo-grid">${cards}</div>
      ${link("/destinations/", "Browse all destinations", "seo-text-link")}
    </section>
    <section>
      <p class="seo-eyebrow">Plan with context</p>
      <h2>Practical travel guides</h2>
      <ul>${featuredArticles}</ul>
      ${link("/blog/", "Read all travel articles", "seo-text-link")}
    </section>
    <section class="seo-callout">
      <h2>Build a trip around your travel style</h2>
      <p>TripSathi's AI planner creates a personalised itinerary draft after you sign in. Review current travel details before booking.</p>
      ${link("/plan/", "Start planning", "seo-button")}
    </section>`);
};

const renderDestinationIndex = () => `
  <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span aria-current="page">Destinations</span></nav>
  <header><p class="seo-eyebrow">Explore India</p><h1>Destination guides</h1>
    <p>Read useful destination information before making a plan. Our guides cover places to visit, seasonal considerations, getting around, and clearly labelled planning estimates.</p>
  </header>
  <div class="seo-grid">${destinations
    .map(
      (destination) => `
      <article class="seo-card"><a href="/destinations/${destination.slug}/">
        <img src="${escapeHtml(destination.image)}" alt="${escapeHtml(destination.imageAlt)}" width="960" height="600" loading="lazy" />
        <div class="seo-card-copy"><p>${escapeHtml(destination.region)}</p><h2>${escapeHtml(destination.name)}</h2><span>${escapeHtml(destination.summary)}</span></div>
      </a></article>`
    )
    .join("")}</div>`;

const renderDestination = (destination) => {
  const related = destination.relatedSlugs
    .map((slug) => destinations.find((item) => item.slug === slug))
    .filter(Boolean);
  const destinationArticles = articles.filter((article) => article.destinationSlug === destination.slug);
  const canonical = `${siteUrl}/destinations/${destination.slug}/`;
  const schema = [
    ...siteSchema,
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${destination.name} Travel Guide`,
      description: destination.summary,
      url: canonical,
      about: { "@type": "Place", name: destination.name, address: destination.region },
    },
    breadcrumb([
      { name: "Home", url: siteUrl },
      { name: "Destinations", url: `${siteUrl}/destinations/` },
      { name: destination.name, url: canonical },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: destination.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];

  return {
    path: `destinations/${destination.slug}`,
    page: {
      title: `${destination.name} Travel Guide: Places, Tips & Planning | TripSathi`,
      description: `Plan a trip to ${destination.name}, ${destination.region}. Explore attractions, seasons, transport, local experiences, practical tips, and clearly labelled budget estimates.`,
      canonical,
      image: destination.image,
      preloadImage: true,
      schema,
    },
    content: pageFrame(`
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/destinations/">Destinations</a> / <span aria-current="page">${escapeHtml(destination.name)}</span></nav>
      <header class="seo-destination-hero">
        <img src="${escapeHtml(destination.image)}" alt="${escapeHtml(destination.imageAlt)}" width="1400" height="800" fetchpriority="high" />
        <div><p class="seo-eyebrow">${escapeHtml(destination.region)}</p>
          <h1>${escapeHtml(destination.name)} travel guide</h1>
          <p>${escapeHtml(destination.intro)}</p>
          ${link(`/plan/?destination=${encodeURIComponent(destination.name)}`, `Generate my ${destination.name} itinerary`, "seo-button")}
        </div>
      </header>
      <section><h2>About ${escapeHtml(destination.name)}</h2>${destination.overview.map((text) => `<p>${escapeHtml(text)}</p>`).join("")}</section>
      <section><h2>Places to visit in ${escapeHtml(destination.name)}</h2><div class="seo-grid">${destination.attractions.map((place) => `<article class="seo-card seo-card-copy"><h3>${escapeHtml(place.name)}</h3><p>${escapeHtml(place.description)}</p></article>`).join("")}</div></section>
      <section class="seo-grid">
        <article class="seo-card seo-card-copy"><h2>Best time to visit</h2><p>${escapeHtml(destination.bestTime)}</p><h3>Suggested duration</h3><p>${escapeHtml(destination.duration)}</p></article>
        <article class="seo-card seo-card-copy"><h2>Estimated trip budget</h2><p>${escapeHtml(destination.budget.label)}</p><p><strong>Economy:</strong> ${escapeHtml(destination.budget.economy)}</p><p><strong>Comfort:</strong> ${escapeHtml(destination.budget.comfort)}</p><p>${escapeHtml(destination.budget.note)}</p></article>
        <article class="seo-card seo-card-copy"><h2>Where to stay</h2><p>${escapeHtml(destination.stay)}</p></article>
        <article class="seo-card seo-card-copy"><h2>Getting around</h2><p>${escapeHtml(destination.transport)}</p></article>
      </section>
      <section class="seo-grid">
        <div><h2>Local experiences</h2><ul>${destination.experiences.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("")}</ul></div>
        <div><h2>Practical travel tips</h2><ul>${destination.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("")}</ul></div>
      </section>
      <section><h2>${escapeHtml(destination.name)} travel FAQs</h2>${destination.faqs.map((faq) => `<details><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join("")}</section>
      <section><h2>${escapeHtml(destination.name)} travel articles</h2><ul>${destinationArticles.map((article) => `<li>${link(`/blog/${article.slug}/`, article.title)}</li>`).join("")}</ul></section>
      <section><h2>Related destination guides</h2><ul>${related.map((item) => `<li>${link(`/destinations/${item.slug}/`, `${item.name} travel guide`)}</li>`).join("")}</ul></section>
      <section class="seo-callout"><h2>Make the trip your own</h2><p>Get a personalised itinerary draft based on your travel dates, budget, pace, and interests. Verify current details before booking.</p>${link(`/plan/?destination=${encodeURIComponent(destination.name)}`, "Plan your trip", "seo-button")}</section>`)
  };
};

const renderBlogIndex = () => {
  const canonical = `${siteUrl}/blog/`;
  return {
    path: "blog",
    page: {
      title: "Travel Guides & Trip Planning Articles | TripSathi",
      description: "Read practical travel guides for Jaipur, Ladakh, and Kerala, including flexible itinerary ideas, seasonal planning, and destination tips.",
      canonical,
      image: destinations[0].image,
      schema: [
        ...siteSchema,
        {
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "TripSathi Travel Guides",
          url: canonical,
          description: "Practical travel guides and trip planning articles from TripSathi.",
        },
      ],
    },
    content: pageFrame(`
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span aria-current="page">Travel guides</span></nav>
      <header><p class="seo-eyebrow">TripSathi journal</p><h1>Travel guides for more thoughtful trips</h1>
        <p>Practical destination notes and flexible planning ideas. Travel conditions, access, and prices can change, so confirm current details before you go.</p>
      </header>
      <section><h2>Latest travel articles</h2><div class="seo-grid">${articles.map((article) => {
        const destination = destinations.find((item) => item.slug === article.destinationSlug);
        const wordCount = article.sections.flatMap((section) => section.paragraphs).join(" ").split(/\s+/).length;
        const minutes = Math.max(1, Math.ceil(wordCount / 220));
        return `<article class="seo-card"><a href="/blog/${article.slug}/"><img src="${escapeHtml(destination.image)}" alt="${escapeHtml(`${destination.name} landscape`)}" width="960" height="540" loading="lazy" /><div class="seo-card-copy"><p>${escapeHtml(article.category)} · ${minutes} min read</p><h2>${escapeHtml(article.title)}</h2><span>${escapeHtml(article.description)}</span></div></a></article>`;
      }).join("")}</div></section>
      <section><h2>Browse by destination</h2><ul>${destinations.map((destination) => `<li>${link(`/destinations/${destination.slug}/`, `${destination.name} travel guide`)}</li>`).join("")}</ul></section>`)
  };
};

const renderArticle = (article) => {
  const destination = destinations.find((item) => item.slug === article.destinationSlug);
  const canonical = `${siteUrl}/blog/${article.slug}/`;
  const related = articles.filter(
    (item) => item.slug !== article.slug && item.destinationSlug === article.destinationSlug
  );
  const wordCount = article.sections.flatMap((section) => section.paragraphs).join(" ").split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 220));
  const schema = [
    ...siteSchema,
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: article.description,
      image: [destination.image],
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      author: { "@type": "Organization", name: article.author },
      publisher: { "@type": "Organization", name: "TripSathi", url: siteUrl },
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      articleSection: article.category,
      inLanguage: "en",
    },
    breadcrumb([
      { name: "Home", url: siteUrl },
      { name: "Travel guides", url: `${siteUrl}/blog/` },
      { name: article.title, url: canonical },
    ]),
  ];
  return {
    path: `blog/${article.slug}`,
    page: {
      title: `${article.title} | TripSathi`,
      description: article.description,
      canonical,
      image: destination.image,
      preloadImage: true,
      type: "article",
      schema,
    },
    content: pageFrame(`
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog/">Travel guides</a> / <span aria-current="page">${escapeHtml(article.title)}</span></nav>
      <article class="seo-article">
        <header><p class="seo-eyebrow">${escapeHtml(article.category)}</p><h1>${escapeHtml(article.title)}</h1>
          <p>${escapeHtml(article.description)}</p>
          <p class="seo-byline">By ${escapeHtml(article.author)} · Published <time datetime="${article.publishedAt}">${article.publishedAt}</time>${article.updatedAt !== article.publishedAt ? ` · Updated <time datetime="${article.updatedAt}">${article.updatedAt}</time>` : ""} · ${minutes} min read</p>
        </header>
        <figure><img src="${escapeHtml(destination.image)}" alt="${escapeHtml(`${destination.name}: ${destination.imageAlt}`)}" width="1400" height="800" fetchpriority="high" /><figcaption>${escapeHtml(destination.name)}, ${escapeHtml(destination.region)}</figcaption></figure>
        ${article.sections.map((section) => `<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</section>`).join("")}
        <section class="seo-callout"><h2>Plan your ${escapeHtml(destination.name)} trip</h2><p>Build a personalised itinerary draft around your own dates, pace, budget, and interests. Check current travel details before booking.</p>${link(`/plan/?destination=${encodeURIComponent(destination.name)}`, "Generate my itinerary", "seo-button")}</section>
        <section><h2>Explore the ${escapeHtml(destination.name)} destination guide</h2><p>${link(`/destinations/${destination.slug}/`, `${destination.name}: attractions, travel tips, and planning`)}</p></section>
        <section><h2>Related articles</h2><ul>${related.map((item) => `<li>${link(`/blog/${item.slug}/`, item.title)}</li>`).join("")}</ul></section>
      </article>`)
  };
};

const staticPages = [
  {
    path: "about",
    page: {
      title: "About TripSathi | AI-Assisted Travel Planning",
      description: "Learn how TripSathi combines destination research, editable travel plans, and AI-assisted itinerary ideas to help travellers prepare.",
      canonical: `${siteUrl}/about/`,
      schema: [
        ...siteSchema,
        { "@context": "https://schema.org", "@type": "AboutPage", name: "About TripSathi", url: `${siteUrl}/about/` },
      ],
    },
    content: pageFrame(`<nav aria-label="Breadcrumb"><a href="/">Home</a> / <span aria-current="page">About TripSathi</span></nav>
      <header><p class="seo-eyebrow">About the project</p><h1>Travel planning, made personal</h1>
        <p>TripSathi is a travel-planning application that helps people organise destination research and build editable itinerary drafts around their preferences. Public guides provide curated starting points; the AI planner generates suggestions when a signed-in user requests an itinerary.</p>
      </header>
      <section><h2>How TripSathi works</h2><p>Travellers can read destination guides without an account. To use the personalised planner, they provide trip details such as a destination, dates, group size, budget, and interests. The application sends a planning request to its AI service and lets the signed-in traveller review and save a trip.</p><p>Map features use OpenStreetMap-based services for place discovery and location tasks. Availability and accuracy depend on the underlying providers and current local data. TripSathi is a planning tool, not a booking service or a substitute for official travel, safety, medical, or entry advice.</p><p>AI-generated details can be incomplete or out of date. Confirm opening hours, access rules, routes, prices, permits, and other time-sensitive information with current authoritative sources before making decisions.</p></section>
      <section><h2>Explore TripSathi</h2><ul><li>${link("/destinations/", "Destination guides")}</li><li>${link("/blog/", "Travel articles")}</li><li>${link("/contact/", "Contact")}</li></ul></section>`)
  },
  {
    path: "contact",
    page: {
      title: "Contact TripSathi | Get in Touch",
      description: "Contact the TripSathi team with questions, feedback, or a request about your account or travel-planning data.",
      canonical: `${siteUrl}/contact/`,
    },
    content: pageFrame(`<nav aria-label="Breadcrumb"><a href="/">Home</a> / <span aria-current="page">Contact</span></nav>
      <header><p class="seo-eyebrow">We would like to hear from you</p><h1>Contact TripSathi</h1>
        <p>Send a question, share feedback, or ask about account and itinerary data. Do not include passwords, payment details, or other sensitive information in a message.</p>
      </header><section><h2>Send a message</h2><p>The contact form is available when the site's email delivery service is configured.</p></section>`)
  },
  {
    path: "privacy",
    page: {
      title: "Privacy Policy | TripSathi",
      description: "Learn what information TripSathi processes for accounts, saved trips, AI itinerary generation, maps, contact requests, and optional analytics.",
      canonical: `${siteUrl}/privacy/`,
    },
    content: pageFrame(`<nav aria-label="Breadcrumb"><a href="/">Home</a> / <span aria-current="page">Privacy policy</span></nav>
      <article class="seo-article"><header><p class="seo-eyebrow">Privacy</p><h1>TripSathi Privacy Policy</h1><p>Effective date: November 15, 2026</p></header>
      <section><h2>Information and account data</h2><p>Account registration collects a name, email address, and password. Profile fields may include optional contact and preference information. TripSathi stores user-created trip details, itinerary content, destination preferences, and saved locations in its application database. Passwords are processed by the server and stored as password hashes.</p><p>The contact form sends a name, email address, and message to the server for email delivery. Do not submit passwords, payment details, or other sensitive information through it.</p></section>
      <section><h2>Authentication and browser storage</h2><p>The current web client stores an access JWT in browser localStorage and sends it to the API in an Authorization header. The server also issues an HttpOnly refresh-token cookie; Secure and SameSite settings depend on the server's production environment. Local storage is accessible to scripts running in the page.</p></section>
      <section><h2>AI itinerary generation</h2><p>When a signed-in user requests an itinerary, TripSathi sends submitted travel-planning details such as destination, dates, budget, group size, interests, and special requests to Google's Gemini API through the backend. Avoid entering sensitive information in trip requests. Google's processing is also subject to applicable Google service terms and settings.</p></section>
      <section><h2>Maps and location services</h2><p>Map functions can send search text, destination addresses, or coordinates to backend and third-party map/geocoding providers, including OpenStreetMap-related services, Nominatim, Overpass, and OSRM. If you grant browser location permission, the client can use your device coordinates to find nearby places. Provider availability and privacy practices are outside TripSathi's control.</p></section>
      <section><h2>Optional analytics</h2><p>If a Google Analytics measurement ID is configured, analytics loads only after you choose to allow it. The application sends page paths and limited product events, not account names, email addresses, trip descriptions, or itinerary details. Your choice is stored in localStorage.</p></section>
      <section><h2>Retention and deletion</h2><p>The application provides controls to manage trips and saved information, but its source does not define a universal retention period or a self-service account deletion process. Contact the TripSathi operator about access or deletion requests. Requests can be handled only when contact delivery is configured.</p></section>
      <section><h2>Changes and contact</h2><p>This policy should be reviewed against actual hosting, provider, retention, and legal arrangements. For privacy questions, use the ${link("/contact/", "Contact page")}.</p></section></article>`)
  },
];

const writePage = (template, route, page, content) => {
  const html = makeHead(template, page).replace(
    '<div id="root"></div>',
    `<div id="root">${content}</div>`
  );
  const outputPath = route
    ? path.join(buildDir, route, "index.html")
    : baseDocumentPath;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html);
};

const xmlEscape = (value) =>
  String(value).replace(/[<>&'"]/g, (character) => {
    const entities = { "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" };
    return entities[character];
  });

const validateContent = () => {
  const destinationSlugs = new Set(destinations.map((item) => item.slug));
  const articleSlugs = new Set(articles.map((item) => item.slug));
  if (destinationSlugs.size !== destinations.length || articleSlugs.size !== articles.length) {
    throw new Error("Destination and article slugs must be unique.");
  }
  for (const article of articles) {
    if (!destinationSlugs.has(article.destinationSlug)) {
      throw new Error(`Unknown destination for article: ${article.slug}`);
    }
    const wordCount = article.sections
      .flatMap((section) => section.paragraphs)
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length;
    if (wordCount < 200) {
      throw new Error(`Article is too short to publish: ${article.slug}`);
    }
    if (article.updatedAt < article.publishedAt) {
      throw new Error(`Article update date precedes publication: ${article.slug}`);
    }
  }
  for (const destination of destinations) {
    const count = articles.filter(
      (article) => article.destinationSlug === destination.slug
    ).length;
    if (count < 2) {
      throw new Error(`At least two articles are required for ${destination.slug}.`);
    }
  }
};

const run = () => {
  validateContent();
  if (!fs.existsSync(baseDocumentPath)) {
    throw new Error(`Build HTML was not found at ${baseDocumentPath}`);
  }
  const template = fs.readFileSync(baseDocumentPath, "utf8");
  const homeDescription =
    "Explore TripSathi destination guides and create an AI-assisted travel itinerary shaped around your dates, budget, and interests.";
  writePage(template, "", {
    title: "TripSathi | Thoughtful Travel Planning",
    description: homeDescription,
    canonical: `${siteUrl}/`,
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=85",
    preloadImage: true,
    schema: siteSchema,
  }, renderHome());
  writePage(template, "destinations", {
    title: "India Destination Guides | TripSathi",
    description: "Explore practical TripSathi guides to Jaipur, Ladakh, and Kerala, with sights, seasonal planning, transport notes, and budget estimates.",
    canonical: `${siteUrl}/destinations/`,
    image: destinations[0].image,
    schema: [...siteSchema, { "@context": "https://schema.org", "@type": "CollectionPage", name: "TripSathi destination guides", url: `${siteUrl}/destinations/` }],
  }, renderDestinationIndex());

  for (const destination of destinations) {
    const rendered = renderDestination(destination);
    writePage(template, rendered.path, rendered.page, rendered.content);
  }

  const blogIndex = renderBlogIndex();
  writePage(template, blogIndex.path, blogIndex.page, blogIndex.content);
  for (const article of articles) {
    const rendered = renderArticle(article);
    writePage(template, rendered.path, rendered.page, rendered.content);
  }
  for (const page of staticPages) {
    writePage(template, page.path, page.page, page.content);
  }

  const notFound = makeHead(template, {
    title: "Page Not Found | TripSathi",
    description: "The TripSathi page you requested could not be found.",
    robots: "noindex,nofollow",
  }).replace(
    '<div id="root"></div>',
    `<div id="root">${pageFrame(`<section class="seo-callout"><p class="seo-eyebrow">404</p><h1>Page not found</h1><p>The page you requested does not exist or is no longer available.</p>${link("/", "Return to TripSathi", "seo-button")}</section>`)}</div>`
  );
  fs.writeFileSync(path.join(buildDir, "404.html"), notFound);

  const urls = [
    { path: "/", lastmod: "" },
    { path: "/destinations/", lastmod: "" },
    ...destinations.map((item) => ({ path: `/destinations/${item.slug}/`, lastmod: "" })),
    { path: "/blog/", lastmod: "" },
    ...articles.map((item) => ({ path: `/blog/${item.slug}/`, lastmod: item.updatedAt })),
    ...["about", "contact", "privacy"].map((item) => ({ path: `/${item}/`, lastmod: "" })),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (item) =>
        `  <url><loc>${xmlEscape(`${siteUrl}${item.path}`)}</loc>${item.lastmod ? `<lastmod>${xmlEscape(item.lastmod)}</lastmod>` : ""}</url>`
    )
    .join("\n")}\n</urlset>\n`;
  fs.writeFileSync(path.join(buildDir, "sitemap.xml"), sitemap);

  const sitemapLocations = sitemap.match(/<loc>[^<]+<\/loc>/g) || [];
  const expectedLocationCount = 1 + 1 + destinations.length + 1 + articles.length + 3;
  if (sitemapLocations.length !== expectedLocationCount) {
    throw new Error("Generated sitemap does not contain every expected public URL.");
  }
  if (new Set(sitemapLocations).size !== sitemapLocations.length) {
    throw new Error("Generated sitemap contains duplicate URLs.");
  }
  const robots = fs.readFileSync(path.join(buildDir, "robots.txt"), "utf8");
  if (!robots.includes(`${siteUrl}/sitemap.xml`)) {
    throw new Error("The generated robots.txt does not reference the sitemap.");
  }
};

run();
