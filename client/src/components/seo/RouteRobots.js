import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import destinations from "../../data/destinations.json";
import articles from "../../data/articles.json";

const publicPath = (pathname) => {
  const path = pathname.replace(/\/+$/, "") || "/";
  const destinationSlugs = destinations.map((destination) => destination.slug);
  const articleSlugs = articles.map((article) => article.slug);
  return (
    path === "/" ||
    path === "/about" ||
    path === "/contact" ||
    path === "/privacy" ||
    path === "/destinations" ||
    (path.startsWith("/destinations/") &&
      destinationSlugs.includes(path.slice("/destinations/".length))) ||
    path === "/blog" ||
    (path.startsWith("/blog/") &&
      articleSlugs.includes(path.slice("/blog/".length)))
  );
};

const RouteRobots = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    let robots = document.head.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = publicPath(pathname) ? "index,follow" : "noindex,nofollow";
  }, [pathname]);

  return null;
};

export default RouteRobots;
