import Stripe from "stripe";
import { describe, expect, test } from "vitest";
import { getCloudPlanFromProduct } from "./stripe-plan";

const product = (input: Partial<Stripe.Product> & Pick<Stripe.Product, "id">): Stripe.Product =>
  input as Stripe.Product;

describe("stripe-plan", () => {
  test("maps known product metadata values to cloud plans", () => {
    expect(
      getCloudPlanFromProduct(product({ id: "prod_hobby", metadata: { salamruby_plan: "hobby" } }))
    ).toBe("hobby");
    expect(getCloudPlanFromProduct(product({ id: "prod_pro", metadata: { salamruby_plan: "pro" } }))).toBe(
      "pro"
    );
    expect(
      getCloudPlanFromProduct(product({ id: "prod_scale", metadata: { salamruby_plan: "scale" } }))
    ).toBe("scale");
    expect(
      getCloudPlanFromProduct(product({ id: "prod_custom", metadata: { salamruby_plan: "custom" } }))
    ).toBe("custom");
  });

  test("falls back to unknown for missing or unknown products", () => {
    expect(getCloudPlanFromProduct(null)).toBe("unknown");
    expect(getCloudPlanFromProduct(undefined)).toBe("unknown");
    expect(getCloudPlanFromProduct("prod_unknown")).toBe("unknown");
    expect(getCloudPlanFromProduct(product({ id: "prod_unknown", metadata: {} }))).toBe("unknown");
    expect(
      getCloudPlanFromProduct(product({ id: "prod_unknown", metadata: { salamruby_plan: "enterprise" } }))
    ).toBe("unknown");
  });
});
