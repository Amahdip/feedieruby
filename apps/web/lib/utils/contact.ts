import { TContactAttributes } from "@salamruby/types/contact-attribute";
import { TResponseContact } from "@salamruby/types/responses";

export const getContactIdentifier = (
  contact: TResponseContact | null,
  contactAttributes: TContactAttributes | null
): string => {
  return contactAttributes?.email || contact?.userId || "";
};
