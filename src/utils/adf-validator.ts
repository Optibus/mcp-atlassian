/**
 * Strict ADF validator with detailed error messages for LLMs
 */

import {
  ADFDocument,
  ADFBlockNode,
  ADFInlineNode,
  ADFMark,
  isADFDocument,
} from "./adf-types.js";

export class ADFValidationError extends Error {
  constructor(message: string, public path: string, public details?: string) {
    super(
      `ADF validation failed at ${path}: ${message}${
        details ? `. ${details}` : ""
      }`
    );
    this.name = "ADFValidationError";
  }
}

const VALID_BLOCK_TYPES = [
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "codeBlock",
  "listItem",
];
const VALID_INLINE_TYPES = ["text", "hardBreak"];
const VALID_MARK_TYPES = ["strong", "em", "code", "link"];

/**
 * Validate complete ADF document structure
 */
export function validateADF(doc: any): ADFDocument {
  // Check if input is an object
  if (typeof doc !== "object" || doc === null) {
    throw new ADFValidationError(
      `Root must be an object`,
      "root",
      `Received ${typeof doc}. Expected a JSON object like {type: 'doc', version: 1, content: []}`
    );
  }

  // Validate root structure
  if (!isADFDocument(doc)) {
    const issues: string[] = [];
    if (doc.type !== "doc") {
      issues.push(`type must be 'doc', got '${doc.type}'`);
    }
    if (doc.version !== 1) {
      issues.push(`version must be 1, got ${doc.version}`);
    }
    if (!Array.isArray(doc.content)) {
      issues.push(`content must be an array, got ${typeof doc.content}`);
    }

    throw new ADFValidationError(
      `Invalid root structure`,
      "root",
      `Required structure: {type: 'doc', version: 1, content: []}. Issues: ${issues.join(
        "; "
      )}`
    );
  }

  // Validate content array
  if (!Array.isArray(doc.content)) {
    throw new ADFValidationError(
      `content must be an array`,
      "root.content",
      `Got ${typeof doc.content}`
    );
  }

  // Validate each block node
  doc.content.forEach((node, index) => {
    validateBlockNode(node, `content[${index}]`);
  });

  return doc as ADFDocument;
}

/**
 * Validate block-level node
 */
function validateBlockNode(node: any, path: string): void {
  if (typeof node !== "object" || node === null) {
    throw new ADFValidationError(
      `Block node must be an object`,
      path,
      `Received ${typeof node}`
    );
  }

  const { type } = node;

  if (!type || typeof type !== "string") {
    throw new ADFValidationError(
      `Missing or invalid 'type' property`,
      path,
      `Each node must have a 'type' string property. Valid block types: ${VALID_BLOCK_TYPES.join(
        ", "
      )}`
    );
  }

  if (!VALID_BLOCK_TYPES.includes(type)) {
    throw new ADFValidationError(
      `Invalid block node type '${type}'`,
      path,
      `Valid block types are: ${VALID_BLOCK_TYPES.join(", ")}`
    );
  }

  // Validate specific node types
  switch (type) {
    case "paragraph":
      validateParagraph(node, path);
      break;
    case "heading":
      validateHeading(node, path);
      break;
    case "bulletList":
      validateBulletList(node, path);
      break;
    case "orderedList":
      validateOrderedList(node, path);
      break;
    case "codeBlock":
      validateCodeBlock(node, path);
      break;
    case "listItem":
      validateListItem(node, path);
      break;
  }
}

/**
 * Validate paragraph node
 */
function validateParagraph(node: any, path: string): void {
  if (node.content !== undefined) {
    if (!Array.isArray(node.content)) {
      throw new ADFValidationError(
        `Paragraph 'content' must be an array of inline nodes`,
        path,
        `Got ${typeof node.content}`
      );
    }
    node.content.forEach((inline: any, index: number) => {
      validateInlineNode(inline, `${path}.content[${index}]`);
    });
  }
}

/**
 * Validate heading node
 */
function validateHeading(node: any, path: string): void {
  if (!node.attrs || typeof node.attrs !== "object") {
    throw new ADFValidationError(
      `Heading must have 'attrs' object`,
      path,
      `Example: {type: 'heading', attrs: {level: 2}, content: [...]}`
    );
  }

  const { level } = node.attrs;
  if (typeof level !== "number" || level < 1 || level > 6) {
    throw new ADFValidationError(
      `Heading level must be a number between 1 and 6`,
      `${path}.attrs.level`,
      `Got: ${level}. Use level 1 for h1, 2 for h2, etc.`
    );
  }

  if (node.content !== undefined) {
    if (!Array.isArray(node.content)) {
      throw new ADFValidationError(
        `Heading 'content' must be an array of inline nodes`,
        path,
        `Got ${typeof node.content}`
      );
    }
    node.content.forEach((inline: any, index: number) => {
      validateInlineNode(inline, `${path}.content[${index}]`);
    });
  }
}

/**
 * Validate bullet list node
 */
function validateBulletList(node: any, path: string): void {
  if (!Array.isArray(node.content)) {
    throw new ADFValidationError(
      `Bullet list 'content' must be an array of listItem nodes`,
      path,
      `Got ${typeof node.content}. Example: {type: 'bulletList', content: [{type: 'listItem', content: [...]}]}`
    );
  }

  if (node.content.length === 0) {
    throw new ADFValidationError(
      `Bullet list must have at least one listItem`,
      path,
      `Empty lists are not allowed`
    );
  }

  node.content.forEach((item: any, index: number) => {
    if (item.type !== "listItem") {
      throw new ADFValidationError(
        `Bullet list can only contain listItem nodes`,
        `${path}.content[${index}]`,
        `Got type '${item.type}'. Expected 'listItem'`
      );
    }
    validateListItem(item, `${path}.content[${index}]`);
  });
}

/**
 * Validate ordered list node
 */
function validateOrderedList(node: any, path: string): void {
  if (!Array.isArray(node.content)) {
    throw new ADFValidationError(
      `Ordered list 'content' must be an array of listItem nodes`,
      path,
      `Got ${typeof node.content}. Example: {type: 'orderedList', content: [{type: 'listItem', content: [...]}]}`
    );
  }

  if (node.content.length === 0) {
    throw new ADFValidationError(
      `Ordered list must have at least one listItem`,
      path,
      `Empty lists are not allowed`
    );
  }

  node.content.forEach((item: any, index: number) => {
    if (item.type !== "listItem") {
      throw new ADFValidationError(
        `Ordered list can only contain listItem nodes`,
        `${path}.content[${index}]`,
        `Got type '${item.type}'. Expected 'listItem'`
      );
    }
    validateListItem(item, `${path}.content[${index}]`);
  });
}

/**
 * Validate list item node
 */
function validateListItem(node: any, path: string): void {
  if (!Array.isArray(node.content)) {
    throw new ADFValidationError(
      `List item 'content' must be an array of block nodes`,
      path,
      `Got ${typeof node.content}. List items typically contain paragraph nodes`
    );
  }

  if (node.content.length === 0) {
    throw new ADFValidationError(
      `List item must have at least one block node`,
      path,
      `Empty list items are not allowed`
    );
  }

  node.content.forEach((block: any, index: number) => {
    validateBlockNode(block, `${path}.content[${index}]`);
  });
}

/**
 * Validate code block node
 */
function validateCodeBlock(node: any, path: string): void {
  if (node.attrs !== undefined) {
    if (typeof node.attrs !== "object" || node.attrs === null) {
      throw new ADFValidationError(
        `Code block 'attrs' must be an object`,
        path,
        `Got ${typeof node.attrs}. Optional attrs: {language: 'javascript'}`
      );
    }
    if (
      node.attrs.language !== undefined &&
      typeof node.attrs.language !== "string"
    ) {
      throw new ADFValidationError(
        `Code block language must be a string`,
        `${path}.attrs.language`,
        `Got ${typeof node.attrs
          .language}. Example: 'javascript', 'python', 'bash'`
      );
    }
  }

  if (node.content !== undefined) {
    if (!Array.isArray(node.content)) {
      throw new ADFValidationError(
        `Code block 'content' must be an array`,
        path,
        `Got ${typeof node.content}`
      );
    }
    node.content.forEach((textNode: any, index: number) => {
      if (textNode.type !== "text") {
        throw new ADFValidationError(
          `Code block can only contain text nodes`,
          `${path}.content[${index}]`,
          `Got type '${textNode.type}'. Code blocks can only have plain text nodes`
        );
      }
      validateTextNode(textNode, `${path}.content[${index}]`, false); // No marks in code blocks
    });
  }
}

/**
 * Validate inline node
 */
function validateInlineNode(node: any, path: string): void {
  if (typeof node !== "object" || node === null) {
    throw new ADFValidationError(
      `Inline node must be an object`,
      path,
      `Received ${typeof node}`
    );
  }

  const { type } = node;

  if (!type || typeof type !== "string") {
    throw new ADFValidationError(
      `Missing or invalid 'type' property`,
      path,
      `Each inline node must have a 'type' string. Valid inline types: ${VALID_INLINE_TYPES.join(
        ", "
      )}`
    );
  }

  if (!VALID_INLINE_TYPES.includes(type)) {
    throw new ADFValidationError(
      `Invalid inline node type '${type}'`,
      path,
      `Valid inline types are: ${VALID_INLINE_TYPES.join(", ")}`
    );
  }

  switch (type) {
    case "text":
      validateTextNode(node, path, true);
      break;
    case "hardBreak":
      // No additional validation needed
      break;
  }
}

/**
 * Validate text node
 */
function validateTextNode(node: any, path: string, allowMarks: boolean): void {
  if (!("text" in node) || typeof node.text !== "string") {
    throw new ADFValidationError(
      `Text node must have a 'text' property with string value`,
      path,
      `Got: ${typeof node.text}. Example: {type: 'text', text: 'Hello world'}`
    );
  }

  if (node.marks !== undefined) {
    if (!allowMarks) {
      throw new ADFValidationError(
        `Text node in this context cannot have marks`,
        path,
        `Marks (bold, italic, etc.) are not allowed here`
      );
    }

    if (!Array.isArray(node.marks)) {
      throw new ADFValidationError(
        `Text node 'marks' must be an array`,
        path,
        `Got ${typeof node.marks}. Example: marks: [{type: 'strong'}, {type: 'em'}]`
      );
    }

    node.marks.forEach((mark: any, index: number) => {
      validateMark(mark, `${path}.marks[${index}]`);
    });
  }
}

/**
 * Validate mark (inline formatting)
 */
function validateMark(mark: any, path: string): void {
  if (typeof mark !== "object" || mark === null) {
    throw new ADFValidationError(
      `Mark must be an object`,
      path,
      `Received ${typeof mark}`
    );
  }

  const { type } = mark;

  if (!type || typeof type !== "string") {
    throw new ADFValidationError(
      `Mark must have a 'type' property`,
      path,
      `Valid mark types: ${VALID_MARK_TYPES.join(", ")}`
    );
  }

  if (!VALID_MARK_TYPES.includes(type)) {
    throw new ADFValidationError(
      `Invalid mark type '${type}'`,
      path,
      `Valid mark types are: 'strong' (bold), 'em' (italic), 'code' (inline code), 'link' (hyperlink)`
    );
  }

  // Validate link mark
  if (type === "link") {
    if (!mark.attrs || typeof mark.attrs !== "object") {
      throw new ADFValidationError(
        `Link mark must have 'attrs' object`,
        path,
        `Example: {type: 'link', attrs: {href: 'https://example.com'}}`
      );
    }
    if (typeof mark.attrs.href !== "string") {
      throw new ADFValidationError(
        `Link mark must have 'attrs.href' string`,
        path,
        `Got ${typeof mark.attrs
          .href}. Example: attrs: {href: 'https://example.com'}`
      );
    }
  }
}
