import { Link } from "react-router-dom";

const Breadcrumbs = ({ items }) => (
  <nav aria-label="Breadcrumb" className="mb-6 text-sm text-text-secondary">
    <ol className="flex flex-wrap items-center gap-2">
      {items.map((item, index) => {
        const isCurrent = index === items.length - 1;
        return (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {isCurrent ? (
              <span aria-current="page" className="font-semibold text-text-primary">
                {item.label}
              </span>
            ) : (
              <Link to={item.to} className="hover:text-accent hover:underline">
                {item.label}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default Breadcrumbs;
