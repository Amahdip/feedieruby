import { describe, expect, test } from "vitest";
import type { TSurvey } from "@salamruby/types/surveys/types";
import { surveyUsesStorage } from "./survey-uses-storage";

const createSurvey = (overrides: Partial<TSurvey> = {}): TSurvey =>
  ({
    id: "survey-1",
    workspaceId: "workspace-1",
    name: "Test survey",
    type: "link",
    status: "draft",
    blocks: [],
    endings: [],
    languages: [{ default: true, enabled: true, language: { code: "default", label: "default" } }],
    styling: null,
    welcomeCard: { enabled: false },
    ...overrides,
  }) as TSurvey;

describe("surveyUsesStorage", () => {
  test("returns false for a text-only link survey", () => {
    expect(surveyUsesStorage(createSurvey())).toBe(false);
  });

  test("returns true when the survey contains a file upload question", () => {
    const survey = createSurvey({
      blocks: [
        {
          id: "block-1",
          elements: [
            {
              id: "element-1",
              type: "fileUpload",
              headline: { default: "Upload a file" },
            },
          ],
        },
      ],
    });

    expect(surveyUsesStorage(survey)).toBe(true);
  });

  test("returns true when the survey uses an uploaded background", () => {
    const survey = createSurvey({
      styling: {
        background: {
          bgType: "upload",
          bg: "/storage/workspace-1/public/background.png",
        },
      },
    });

    expect(surveyUsesStorage(survey)).toBe(true);
  });
});
