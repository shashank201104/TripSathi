import destinations from "./destinations.json";
import articles from "./articles.json";

export const SITE_URL = "https://trip-sathi-gray.vercel.app";
export const DEFAULT_SOCIAL_IMAGE =
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=85";
export const DESTINATION_PATH = (slug) => `/destinations/${slug}/`;
export const ARTICLE_PATH = (slug) => `/blog/${slug}/`;

export const findDestination = (slug) =>
  destinations.find((destination) => destination.slug === slug);

export const findArticle = (slug) =>
  articles.find((article) => article.slug === slug);

export const getArticlesForDestination = (slug) =>
  articles.filter((article) => article.destinationSlug === slug);

export const getRelatedDestinations = (destination) =>
  destination.relatedSlugs
    .map(findDestination)
    .filter(Boolean);

export const getRelatedArticles = (article, limit = 3) =>
  articles
    .filter(
      (candidate) =>
        candidate.slug !== article.slug &&
        candidate.destinationSlug === article.destinationSlug
    )
    .slice(0, limit);
