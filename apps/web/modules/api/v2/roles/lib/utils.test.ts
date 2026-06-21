import { describe, expect, test, vi } from "vitest";
import { OrganizationRole } from "@salamruby/database/prisma";
import * as constants from "@/lib/constants";
import { getRoles } from "./utils";

vi.mock("@/lib/constants", () => ({
  IS_SALAMRUBY_CLOUD: false,
}));

describe("getRoles", () => {
  test("should return all roles except billing when not in SalamRuby Cloud", () => {
    const result = getRoles();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.data).toEqual(Object.values(OrganizationRole).filter((role) => role !== "billing"));
    }
  });

  test("should return all roles including billing when in SalamRuby Cloud", () => {
    const originalValue = constants.IS_SALAMRUBY_CLOUD;
    Object.defineProperty(constants, "IS_SALAMRUBY_CLOUD", { value: true });
    const result = getRoles();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.data).toEqual(Object.values(OrganizationRole));
    }
    Object.defineProperty(constants, "IS_SALAMRUBY_CLOUD", { value: originalValue });
  });
});
