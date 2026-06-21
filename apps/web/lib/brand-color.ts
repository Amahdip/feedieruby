export const DEFAULT_BRAND_COLOR = "#1e40af";

/** Product display name (Persian) */
export const APP_NAME = "فیدی‌روبی";

/** Latin slug / metadata */
export const APP_NAME_LATIN = "FeedieRuby";

/** Portfolio / engineering studio (English) */
export const STUDIO_NAME = "RubyTech";

/** Portfolio / engineering studio (Persian) */
export const STUDIO_NAME_FA = "روبی‌تک";

/** Future portfolio site — empty until rubytech site exists */
export const STUDIO_URL = "";

/** i18n keys for studio attribution (see common.studio_* in locales) */
export const STUDIO_CREDIT_I18N_KEY = "common.studio_credit";
export const STUDIO_NAME_I18N_KEY = "common.studio_name";

/** i18n key for version label in organization settings */
export const APP_VERSION_I18N_KEY = "common.app_version";

/** Shown in settings; hide placeholder monorepo versions */
export const getDisplayAppVersion = (version: string): string | null =>
  version && version !== "0.0.0" ? version : null;

/** salamruby self-host: hide SalamRuby Cloud upsells and vendor trial/license links */
export const HIDE_ENTERPRISE_UPSELL = true;

/** Remove docs, GitHub, security mailing list, and other salamruby.com links from the UI */
export const HIDE_SALAMRUBY_EXTERNAL_LINKS = true;

/** EE features hidden from navigation (use surveys + WordPress embed instead) */
export const HIDE_CONTACTS_FEATURE = true;
export const HIDE_UNIFY_FEEDBACK = true;
export const HIDE_DASHBOARDS_FEATURE = true;

/** FeedieRuby self-host: dashboards hidden — skip bundled Cube.js (~1.7GB) in Docker Compose */
export const DISABLE_CUBE_ANALYTICS = true;

/** Link surveys only — hide website/app SDK survey type and app-connection setup */
export const HIDE_APP_SURVEY_TYPE = true;

/** Requires enterprise license with quotas — hide when not licensed on self-host */
export const HIDE_QUOTAS_FEATURE = true;

/** Hide enterprise license settings page and related sidebar entry */
export const HIDE_ENTERPRISE_SETTINGS = true;

/** Hide "new version available" banner linking to SalamRuby GitHub releases */
export const HIDE_VERSION_UPDATE_PROMPT = true;

/** Render a license-gated section only when enabled, or when upsells are still shown */
export function shouldRenderEnterpriseSection(isLicensed: boolean): boolean {
  return isLicensed || !HIDE_ENTERPRISE_UPSELL;
}
