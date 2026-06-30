import { useTranslation } from "react-i18next";

const APP_URL = "https://feedyruby.ir";
const STUDIO_URL = "https://techruby.ir";

export function FeedyRubyBranding() {
  const { t } = useTranslation();
  const productName = t("common.studio_product_name");
  const studioName = t("common.studio_name");
  const lead = t("common.studio_credit_lead");
  const tail = t("common.studio_credit_tail");

  // Two distinct links: the product name points at FeedyRuby, the studio name at
  // TechRuby. Previously the whole credit was a single anchor to TechRuby, so the
  // FeedyRuby keyword carried no link back to the product.
  return (
    <span className="flex justify-center">
      <p className="text-signature text-xs">
        <a
          href={APP_URL}
          target="_blank"
          tabIndex={-1}
          rel="noopener noreferrer"
          className="text-branding-text hover:text-signature font-semibold">
          {productName}
        </a>
        <span aria-hidden className="text-slate-300">
          {" "}
          ·{" "}
        </span>
        <a
          href={STUDIO_URL}
          target="_blank"
          tabIndex={-1}
          rel="noopener noreferrer"
          className="text-branding-text hover:text-signature">
          {lead}
          {lead ? " " : ""}
          <b>{studioName}</b>
          {tail ? ` ${tail}` : ""}
        </a>
      </p>
    </span>
  );
}
