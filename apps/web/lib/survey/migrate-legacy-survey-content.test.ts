import { describe, expect, test } from "vitest";
import type { TSurvey } from "@salamruby/types/surveys/types";
import { migrateLegacySurveyContent } from "./migrate-legacy-survey-content";

const baseSurvey = {
  blocks: [
    {
      id: "block-1",
      elements: [
        {
          id: "element-1",
          type: "openText",
          headline: { default: "Coming soon..." },
          required: false,
        },
      ],
    },
  ],
} as unknown as TSurvey;

const migrationOptions = {
  comingSoonHeadline: "سؤال خود را بنویسید",
  getBlockName: (blockIndex: number) => `بخش ${blockIndex + 1}`,
};

describe("migrateLegacySurveyContent", () => {
  test("replaces legacy Coming soon headlines", () => {
    const result = migrateLegacySurveyContent(baseSurvey, migrationOptions);

    expect(result.blocks[0].elements[0].headline?.default).toBe("سؤال خود را بنویسید");
  });

  test("replaces Coming soon inside HTML headlines", () => {
    const survey = {
      ...baseSurvey,
      blocks: [
        {
          ...baseSurvey.blocks[0],
          elements: [
            {
              ...baseSurvey.blocks[0].elements[0],
              headline: {
                default: '<p class="fb-editor-paragraph">...Coming soon</p>',
              },
            },
          ],
        },
      ],
    } as unknown as TSurvey;

    const result = migrateLegacySurveyContent(survey, migrationOptions);

    expect(result.blocks[0].elements[0].headline?.default).toBe("سؤال خود را بنویسید");
  });

  test("leaves unrelated headlines unchanged", () => {
    const survey = {
      ...baseSurvey,
      blocks: [
        {
          ...baseSurvey.blocks[0],
          elements: [
            {
              ...baseSurvey.blocks[0].elements[0],
              headline: { default: "چقدر راضی هستید؟" },
            },
          ],
        },
      ],
    } as unknown as TSurvey;

    const result = migrateLegacySurveyContent(survey, migrationOptions);

    expect(result.blocks[0].elements[0].headline?.default).toBe("چقدر راضی هستید؟");
  });

  test("replaces legacy English block names", () => {
    const survey = {
      ...baseSurvey,
      blocks: [
        { ...baseSurvey.blocks[0], name: "Main Block" },
        { id: "block-2", name: "Block 2", elements: [] },
      ],
    } as unknown as TSurvey;

    const result = migrateLegacySurveyContent(survey, migrationOptions);

    expect(result.blocks[0].name).toBe("بخش 1");
    expect(result.blocks[1].name).toBe("بخش 2");
  });
});
