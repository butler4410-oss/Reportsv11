import React from "react";
import { Link } from "react-router-dom";

interface DeepLinkProps {
  to: string;
  label: string;
}

const DeepLink: React.FC<DeepLinkProps> = ({ to, label }) => (
  <div className="pt-1">
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-600 hover:text-sky-700 whitespace-nowrap"
      onClick={(e) => e.stopPropagation()}
    >
      {label} <span>→</span>
    </Link>
  </div>
);

export default DeepLink;
