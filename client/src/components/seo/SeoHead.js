import { useEffect } from "react";
import { DEFAULT_SOCIAL_IMAGE } from "../../data/site";

const setMeta = (attribute, key, content) => {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!content) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
};

const SeoHead = ({
  title,
  description,
  canonical,
  image,
  preloadImage = false,
  type = "website",
  structuredData,
}) => {
  const socialImage = image || DEFAULT_SOCIAL_IMAGE;

  useEffect(() => {
    document.title = title;
    setMeta("name", "description", description);
    setMeta("name", "robots", "index,follow");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:image", socialImage);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", socialImage);

    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;

    let imagePreload = document.head.querySelector(
      'link[rel="preload"][as="image"][data-seo-image="true"]'
    );
    if (preloadImage && image) {
      if (!imagePreload) {
        imagePreload = document.createElement("link");
        imagePreload.rel = "preload";
        imagePreload.as = "image";
        imagePreload.dataset.seoImage = "true";
        document.head.appendChild(imagePreload);
      }
      imagePreload.href = image;
    } else {
      imagePreload?.remove();
    }

    let schema = document.getElementById("trip-sathi-page-schema");
    if (structuredData) {
      if (!schema) {
        schema = document.createElement("script");
        schema.id = "trip-sathi-page-schema";
        schema.type = "application/ld+json";
        document.head.appendChild(schema);
      }
      schema.textContent = JSON.stringify(structuredData).replace(/</g, "\\u003c");
    } else {
      schema?.remove();
    }
  }, [
    canonical,
    description,
    image,
    preloadImage,
    socialImage,
    structuredData,
    title,
    type,
  ]);

  return null;
};

export default SeoHead;
