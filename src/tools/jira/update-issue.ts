import { z } from "zod";
import { AtlassianConfig } from "../../utils/atlassian-api-base.js";
import { updateIssue } from "../../utils/jira-tool-api-v3.js";
import { ApiError } from "../../utils/error-handler.js";
import { Logger } from "../../utils/logger.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Tools, Config } from "../../utils/mcp-helpers.js";
import { validateADF, ADFValidationError } from "../../utils/adf-validator.js";

// Initialize logger
const logger = Logger.getLogger("JiraTools:updateIssue");

// Input parameter schema
export const updateIssueSchema = z.object({
  issueIdOrKey: z
    .string()
    .describe("ID or key of the issue to update (e.g., PROJ-123)"),
  summary: z.string().optional().describe("New summary of the issue"),
  description: z.record(z.any()).optional()
    .describe(`New description in Atlassian Document Format (ADF).

REQUIRED FORMAT: ADF JSON object
- Root: {type: "doc", version: 1, content: [...]}
- Block nodes: paragraph, heading, bulletList, orderedList, codeBlock, listItem
- Inline nodes: text (with optional marks: strong, em, code, link)

Example:
{
  "type": "doc",
  "version": 1,
  "content": [
    {
      "type": "heading",
      "attrs": {"level": 2},
      "content": [{"type": "text", "text": "Updated Info"}]
    },
    {
      "type": "paragraph",
      "content": [{"type": "text", "text": "Details"}]
    }
  ]
}

Reference: https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/`),
  priority: z
    .string()
    .optional()
    .describe("New priority (e.g., High, Medium, Low)"),
  labels: z.array(z.string()).optional().describe("New labels for the issue"),
  customFields: z
    .record(z.any())
    .optional()
    .describe("Custom fields to update"),
});

type UpdateIssueParams = z.infer<typeof updateIssueSchema>;

async function updateIssueToolImpl(params: UpdateIssueParams, context: any) {
  const config: AtlassianConfig = Config.getConfigFromContextOrEnv(context);
  logger.info(`Updating issue: ${params.issueIdOrKey}`);

  const fields: Record<string, any> = {};
  if (params.summary) {
    fields.summary = params.summary;
  }
  if (params.description) {
    // Validate ADF description
    try {
      const validatedDescription = validateADF(params.description);
      fields.description = validatedDescription;
      logger.debug(`ADF description validated successfully`);
    } catch (error) {
      if (error instanceof ADFValidationError) {
        logger.error(`ADF validation failed: ${error.message}`);
        throw new ApiError(
          "VALIDATION_ERROR" as any,
          `Invalid ADF format for description: ${error.message}`,
          400,
          error
        );
      }
      throw error;
    }
  }
  if (params.priority) {
    fields.priority = { name: params.priority };
  }
  if (params.labels) {
    fields.labels = params.labels;
  }
  if (params.customFields) {
    Object.entries(params.customFields).forEach(([key, value]) => {
      fields[key] = value;
    });
  }
  if (Object.keys(fields).length === 0) {
    return {
      issueIdOrKey: params.issueIdOrKey,
      success: false,
      message: "No fields provided to update",
    };
  }
  const result = await updateIssue(config, params.issueIdOrKey, fields);
  return {
    issueIdOrKey: params.issueIdOrKey,
    success: result.success,
    message: result.message,
  };
}

export const registerUpdateIssueTool = (server: McpServer) => {
  server.tool(
    "updateIssue",
    "Update information of a Jira issue",
    updateIssueSchema.shape,
    async (params: UpdateIssueParams, context: Record<string, any>) => {
      try {
        const result = await updateIssueToolImpl(params, context);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : String(error),
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );
};
