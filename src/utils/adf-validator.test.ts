/**
 * Tests for ADF validator
 * Co-located with adf-validator.ts
 */

import { validateADF, ADFValidationError } from "./adf-validator.js";

describe("ADF Validator", () => {
  describe("Valid ADF Documents", () => {
    it("validates simple paragraph", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Hello world" }],
          },
        ],
      };
      expect(() => validateADF(adf)).not.toThrow();
      const result = validateADF(adf);
      expect(result.type).toBe("doc");
      expect(result.version).toBe(1);
    });

    it("validates heading with level 1-6", () => {
      for (let level = 1; level <= 6; level++) {
        const adf = {
          type: "doc",
          version: 1,
          content: [
            {
              type: "heading",
              attrs: { level: level as 1 | 2 | 3 | 4 | 5 | 6 },
              content: [{ type: "text", text: `Heading ${level}` }],
            },
          ],
        };
        expect(() => validateADF(adf)).not.toThrow();
      }
    });

    it("validates bullet list", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Item 1" }],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Item 2" }],
                  },
                ],
              },
            ],
          },
        ],
      };
      expect(() => validateADF(adf)).not.toThrow();
    });

    it("validates ordered list", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "orderedList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "First" }],
                  },
                ],
              },
            ],
          },
        ],
      };
      expect(() => validateADF(adf)).not.toThrow();
    });

    it("validates code block with language", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "codeBlock",
            attrs: { language: "bash" },
            content: [{ type: "text", text: "echo 'hello'" }],
          },
        ],
      };
      expect(() => validateADF(adf)).not.toThrow();
    });

    it("validates code block without language", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "codeBlock",
            content: [{ type: "text", text: "plain code" }],
          },
        ],
      };
      expect(() => validateADF(adf)).not.toThrow();
    });

    it("validates text with marks (strong, em, code, link)", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Bold", marks: [{ type: "strong" }] },
              { type: "text", text: " Italic", marks: [{ type: "em" }] },
              { type: "text", text: " Code", marks: [{ type: "code" }] },
              {
                type: "text",
                text: " Link",
                marks: [
                  { type: "link", attrs: { href: "https://example.com" } },
                ],
              },
            ],
          },
        ],
      };
      expect(() => validateADF(adf)).not.toThrow();
    });

    it("validates empty paragraph", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
          },
        ],
      };
      expect(() => validateADF(adf)).not.toThrow();
    });

    it("validates empty document", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [],
      };
      expect(() => validateADF(adf)).not.toThrow();
    });
  });

  describe("Invalid Root Structure", () => {
    it("rejects non-object input", () => {
      expect(() => validateADF("not an object")).toThrow(ADFValidationError);
      expect(() => validateADF(null)).toThrow(ADFValidationError);
      expect(() => validateADF(123)).toThrow(ADFValidationError);
    });

    it("rejects wrong root type", () => {
      const adf = {
        type: "document",
        version: 1,
        content: [],
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
      try {
        validateADF(adf);
      } catch (error) {
        expect(error).toBeInstanceOf(ADFValidationError);
        expect((error as ADFValidationError).message).toContain(
          "type must be 'doc'"
        );
      }
    });

    it("rejects wrong version", () => {
      const adf = {
        type: "doc",
        version: 2,
        content: [],
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
      try {
        validateADF(adf);
      } catch (error) {
        expect((error as ADFValidationError).message).toContain(
          "version must be 1"
        );
      }
    });

    it("rejects non-array content", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: "not an array",
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
    });
  });

  describe("Invalid Block Nodes", () => {
    it("rejects invalid block type", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "invalidType",
            content: [],
          },
        ],
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
      try {
        validateADF(adf);
      } catch (error) {
        expect((error as ADFValidationError).message).toContain(
          "Invalid block node type 'invalidType'"
        );
        expect((error as ADFValidationError).path).toBe("content[0]");
      }
    });

    it("rejects heading without attrs", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "heading",
            content: [{ type: "text", text: "No attrs" }],
          },
        ],
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
      try {
        validateADF(adf);
      } catch (error) {
        expect((error as ADFValidationError).message).toContain(
          "Heading must have 'attrs' object"
        );
      }
    });

    it("rejects heading with invalid level", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "heading",
            attrs: { level: 7 },
            content: [{ type: "text", text: "Invalid" }],
          },
        ],
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
      try {
        validateADF(adf);
      } catch (error) {
        expect((error as ADFValidationError).message).toContain(
          "Heading level must be a number between 1 and 6"
        );
        expect((error as ADFValidationError).path).toContain("attrs.level");
      }
    });

    it("rejects heading with level 0", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "heading",
            attrs: { level: 0 },
            content: [{ type: "text", text: "Invalid" }],
          },
        ],
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
    });

    it("rejects empty bullet list", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "bulletList",
            content: [],
          },
        ],
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
      try {
        validateADF(adf);
      } catch (error) {
        expect((error as ADFValidationError).message).toContain(
          "Bullet list must have at least one listItem"
        );
      }
    });

    it("rejects bullet list with non-listItem content", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "bulletList",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Wrong type" }],
              },
            ],
          },
        ],
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
      try {
        validateADF(adf);
      } catch (error) {
        expect((error as ADFValidationError).message).toContain(
          "Bullet list can only contain listItem nodes"
        );
      }
    });

    it("rejects empty ordered list", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "orderedList",
            content: [],
          },
        ],
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
    });

    it("rejects empty list item", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [],
              },
            ],
          },
        ],
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
      try {
        validateADF(adf);
      } catch (error) {
        expect((error as ADFValidationError).message).toContain(
          "List item must have at least one block node"
        );
      }
    });

    it("rejects code block with non-text content", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "codeBlock",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Wrong" }],
              },
            ],
          },
        ],
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
      try {
        validateADF(adf);
      } catch (error) {
        expect((error as ADFValidationError).message).toContain(
          "Code block can only contain text nodes"
        );
      }
    });

    it("rejects code block with marks in text", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "codeBlock",
            content: [
              {
                type: "text",
                text: "code",
                marks: [{ type: "strong" }],
              },
            ],
          },
        ],
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
      try {
        validateADF(adf);
      } catch (error) {
        expect((error as ADFValidationError).message).toContain(
          "Text node in this context cannot have marks"
        );
      }
    });
  });

  describe("Invalid Inline Nodes", () => {
    it("rejects invalid inline type", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "invalidInline",
                text: "Wrong",
              },
            ],
          },
        ],
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
      try {
        validateADF(adf);
      } catch (error) {
        expect((error as ADFValidationError).message).toContain(
          "Invalid inline node type 'invalidInline'"
        );
        expect((error as ADFValidationError).path).toContain(
          "content[0].content[0]"
        );
      }
    });

    it("rejects text node without text property", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
              },
            ],
          },
        ],
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
      try {
        validateADF(adf);
      } catch (error) {
        expect((error as ADFValidationError).message).toContain(
          "Text node must have a 'text' property"
        );
      }
    });

    it("rejects text node with non-string text", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: 123,
              },
            ],
          },
        ],
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
    });
  });

  describe("Invalid Marks", () => {
    it("rejects invalid mark type", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Underlined",
                marks: [{ type: "underline" }],
              },
            ],
          },
        ],
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
      try {
        validateADF(adf);
      } catch (error) {
        expect((error as ADFValidationError).message).toContain(
          "Invalid mark type 'underline'"
        );
        expect((error as ADFValidationError).message).toContain(
          "Valid mark types are"
        );
      }
    });

    it("rejects link mark without attrs", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Link",
                marks: [{ type: "link" }],
              },
            ],
          },
        ],
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
      try {
        validateADF(adf);
      } catch (error) {
        expect((error as ADFValidationError).message).toContain(
          "Link mark must have 'attrs' object"
        );
      }
    });

    it("rejects link mark without href", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Link",
                marks: [{ type: "link", attrs: {} }],
              },
            ],
          },
        ],
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
      try {
        validateADF(adf);
      } catch (error) {
        expect((error as ADFValidationError).message).toContain(
          "Link mark must have 'attrs.href' string"
        );
      }
    });

    it("rejects non-array marks", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Text",
                marks: "not an array",
              },
            ],
          },
        ],
      };
      expect(() => validateADF(adf)).toThrow(ADFValidationError);
    });
  });

  describe("Error Path Reporting", () => {
    it("provides correct path for nested errors", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Item",
                        marks: [{ type: "invalidMark" }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };
      try {
        validateADF(adf);
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ADFValidationError);
        const adfError = error as ADFValidationError;
        expect(adfError.path).toContain("content[0]"); // bulletList
        expect(adfError.path).toContain("marks"); // marks array
      }
    });
  });
});
