/**
 * TypeScript type definitions for Atlassian Document Format (ADF)
 * Based on: https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/
 */

// Root document structure
export interface ADFDocument {
  type: "doc";
  version: 1;
  content: ADFBlockNode[];
}

// Block-level nodes
export type ADFBlockNode =
  | ParagraphNode
  | HeadingNode
  | BulletListNode
  | OrderedListNode
  | CodeBlockNode
  | ListItemNode;

// Inline nodes
export type ADFInlineNode = TextNode | HardBreakNode;

// Mark types for inline formatting
export type ADFMark = StrongMark | EmMark | CodeMark | LinkMark;

// Paragraph
export interface ParagraphNode {
  type: "paragraph";
  content?: ADFInlineNode[];
}

// Heading (h1-h6)
export interface HeadingNode {
  type: "heading";
  attrs: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
  content?: ADFInlineNode[];
}

// Bullet list
export interface BulletListNode {
  type: "bulletList";
  content: ListItemNode[];
}

// Ordered list
export interface OrderedListNode {
  type: "orderedList";
  content: ListItemNode[];
}

// List item
export interface ListItemNode {
  type: "listItem";
  content: ADFBlockNode[];
}

// Code block
export interface CodeBlockNode {
  type: "codeBlock";
  attrs?: {
    language?: string;
  };
  content?: TextNode[];
}

// Text node (inline)
export interface TextNode {
  type: "text";
  text: string;
  marks?: ADFMark[];
}

// Hard break (line break)
export interface HardBreakNode {
  type: "hardBreak";
}

// Bold mark
export interface StrongMark {
  type: "strong";
}

// Italic mark
export interface EmMark {
  type: "em";
}

// Inline code mark
export interface CodeMark {
  type: "code";
}

// Link mark
export interface LinkMark {
  type: "link";
  attrs: {
    href: string;
    title?: string;
  };
}

// Type guards
export function isADFDocument(obj: any): obj is ADFDocument {
  return (
    typeof obj === "object" &&
    obj !== null &&
    obj.type === "doc" &&
    obj.version === 1 &&
    Array.isArray(obj.content)
  );
}
