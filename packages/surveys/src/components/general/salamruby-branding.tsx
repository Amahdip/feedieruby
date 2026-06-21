import { useTranslation } from "react-i18next";

const SURVEY_BRAND_NAME = "فیدی‌روبی";

export function SalamRubyBranding() {
  const { t } = useTranslation();
  const brandName = SURVEY_BRAND_NAME;
  const poweredByHref =
    typeof window !== "undefined" && window.location?.origin
      ? `${window.location.origin}?utm_source=survey_branding`
      : `/?utm_source=survey_branding`;
  return (
    <span className="flex justify-center">
      <a href={poweredByHref} target="_blank" tabIndex={-1} rel="noopener">
        <p className="text-signature text-xs">
          {t("common.powered_by")}{" "}
          <b>
            <span className="text-branding-text hover:text-signature">{brandName}</span>
          </b>
        </p>
      </a>
    </span>
  );
}
