import { beforeEach, describe, expect, test, vi } from "vitest";
import SalamRubyHub from "@salamruby/hub";

vi.mock("server-only", () => ({}));

vi.mock("@salamruby/hub", () => {
  // Must use `function` (not arrow) so it's valid as a `new` target.
  const MockSalamRubyHub = vi.fn(function () {});
  return { default: MockSalamRubyHub };
});

vi.mock("@/lib/env", () => ({
  env: {
    HUB_API_KEY: "",
    HUB_API_URL: "https://hub.test",
  },
}));

const { env } = await import("@/lib/env");

const mutableEnv = env as unknown as Record<string, string>;

const globalForHub = globalThis as unknown as {
  salamrubyHubClient: SalamRubyHub | undefined;
};

describe("getHubClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalForHub.salamrubyHubClient = undefined;
  });

  test("returns null when HUB_API_KEY is not set", async () => {
    mutableEnv.HUB_API_KEY = "";

    const { getHubClient } = await import("./hub-client");
    const client = getHubClient();

    expect(client).toBeNull();
    expect(SalamRubyHub).not.toHaveBeenCalled();
  });

  test("creates and caches a new client when HUB_API_KEY is set", async () => {
    mutableEnv.HUB_API_KEY = "test-key";
    const mockInstance = { feedbackRecords: {} } as unknown as SalamRubyHub;
    vi.mocked(SalamRubyHub).mockImplementation(function () {
      return mockInstance as any;
    });

    const { getHubClient } = await import("./hub-client");
    const client = getHubClient();

    expect(SalamRubyHub).toHaveBeenCalledWith({ apiKey: "test-key", baseURL: "https://hub.test" });
    expect(client).toBe(mockInstance);
    expect(globalForHub.salamrubyHubClient).toBe(mockInstance);
  });

  test("returns cached client on subsequent calls", async () => {
    const cachedInstance = { feedbackRecords: {} } as unknown as SalamRubyHub;
    globalForHub.salamrubyHubClient = cachedInstance;

    const { getHubClient } = await import("./hub-client");
    const client = getHubClient();

    expect(client).toBe(cachedInstance);
    expect(SalamRubyHub).not.toHaveBeenCalled();
  });

  test("does not cache null result so a later call with the key set can create the client", async () => {
    mutableEnv.HUB_API_KEY = "";

    const { getHubClient } = await import("./hub-client");
    const first = getHubClient();
    expect(first).toBeNull();
    expect(globalForHub.salamrubyHubClient).toBeUndefined();

    mutableEnv.HUB_API_KEY = "now-set";
    const mockInstance = { feedbackRecords: {} } as unknown as SalamRubyHub;
    vi.mocked(SalamRubyHub).mockImplementation(function () {
      return mockInstance as any;
    });

    const second = getHubClient();
    expect(second).toBe(mockInstance);
    expect(globalForHub.salamrubyHubClient).toBe(mockInstance);
  });
});
