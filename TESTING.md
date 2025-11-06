# MCP Atlassian Server - Sanity Test Checklist

⚠️ **WARNING: These tests will CREATE, UPDATE, and DELETE data in your Atlassian instance. Only run against TEST/DEV environments or use a dedicated test project/space.**

This document contains test cases to verify the MCP server is working correctly. Ask Cursor to execute these tests and report results.

## Prerequisites

- MCP server configured in Cursor (`~/.cursor/mcp.json`)
- Valid Atlassian credentials configured
- **A DEDICATED TEST PROJECT in Jira** (not production!)
- **A DEDICATED TEST SPACE in Confluence** (not production!)
- Permission to create/modify/delete issues and pages in test areas

## Test Instructions for Cursor

Execute each test case below and report:

- ✅ Success: Tool executed and returned expected data
- ❌ Failure: Tool failed or returned error
- 📝 Notes: Any issues or observations

## Safe Read-Only Tests

Run these first to verify connectivity without modifying data:

### 1. Server Connection & Discovery

**Test:** List all available tools

```
List all MCP tools available from the Atlassian server
```

**Expected Result:**

- Should return 32 tools
- Tools should include: getPage, listPages, getIssue, listIssues, createIssue, etc.

---

### 2. Jira Read Operations

#### 2.1 List Projects

**Test:** Get all accessible Jira projects

```
Use the listProjects tool to show all Jira projects I have access to
```

**Expected Result:**

- List of projects with keys, names, and leads
- At least one project should be visible

#### 2.2 Get Project Details

**Test:** Get details for a specific project

```
Use the getProject tool to get details for project [PROJECT_KEY]
```

**Expected Result:**

- Project name, description, type, lead information
- Project URL

#### 2.3 List Issues

**Test:** Search for issues in a project

```
Use listIssues to find the first 5 issues in project [PROJECT_KEY]
```

**Expected Result:**

- Array of issues with keys, summaries, statuses
- Issue assignees and creation dates
- URLs to view issues

#### 2.4 Get Issue Details

**Test:** Get full details of a specific issue

```
Use getIssue tool to get details for issue [ISSUE_KEY]
```

**Expected Result:**

- Full issue details including description
- Status, assignee, reporter
- Comments and transitions available

---

### 3. Confluence Read Operations

#### 3.1 List Spaces

**Test:** Get all Confluence spaces

```
Use listSpaces tool to show all Confluence spaces
```

**Expected Result:**

- List of spaces with IDs, keys, names
- Space types (global/personal)

#### 3.2 Get Space Details

**Test:** Get details for a specific space

```
Use getSpace tool with spaceId [SPACE_ID]
```

**Expected Result:**

- Space name, key, type
- Description and homepage info

#### 3.3 List Pages

**Test:** List pages in a space

```
Use listPages tool with spaceId [SPACE_ID] to show pages
```

**Expected Result:**

- Array of pages with titles and IDs
- Page status and URLs

#### 3.4 Get Page Content

**Test:** Get full content of a page

```
Use getPage tool with pageId [PAGE_ID]
```

**Expected Result:**

- Page title, body content (in storage format)
- Version information
- Creation and update dates

---

## ⚠️ DANGEROUS: Write Operations

**STOP HERE if you're not sure!** The tests below will modify your Atlassian instance.

**Before proceeding:**

1. Confirm you're using a TEST project (e.g., "TEST", "SANDBOX")
2. Confirm you're using a TEST space (e.g., "Testing", "Sandbox")
3. Have permission to create/delete issues and pages
4. Be prepared to clean up test data afterwards

### 4. Jira Write Operations

**⚠️ Creates real Jira issues**

#### 4.1 Create Issue

**Test:** Create a new test issue

```
Use createIssue tool to create a new issue:
- projectKey: [PROJECT_KEY]
- summary: "Test issue created via MCP"
- issueType: "Task"
- description: "This is a test issue"
```

**Expected Result:**

- New issue created successfully
- Returns issue key (e.g., "PROJ-123")
- Issue visible in Jira

#### 4.2 Update Issue

**Test:** Update the created issue

```
Use updateIssue tool to update issue [ISSUE_KEY]:
- summary: "Updated test issue"
- description: "Updated description"
```

**Expected Result:**

- Issue updated successfully
- Changes visible in Jira

#### 4.3 Transition Issue

**Test:** Change issue status

```
First, use getIssue to see available transitions for [ISSUE_KEY]
Then use transitionIssue to move it to a different status
```

**Expected Result:**

- Issue status changed
- New status visible in Jira

---

### 5. Confluence Write Operations

**⚠️ Creates real Confluence pages**

#### 5.1 Create Page

**Test:** Create a new test page

```
Use createPage tool:
- spaceId: [SPACE_ID]
- title: "Test Page via MCP"
- content: "<p>This is test content</p>"
- parentId: [PARENT_PAGE_ID]
```

**Expected Result:**

- New page created
- Returns page ID
- Page visible in Confluence

#### 5.2 Update Page

**Test:** Update the created page

```
Use updatePage tool to modify the test page:
- pageId: [NEW_PAGE_ID]
- title: "Updated Test Page"
- content: "<p>Updated content</p>"
- version: [CURRENT_VERSION]
```

**Expected Result:**

- Page updated successfully
- Changes visible in Confluence

#### 5.3 Add Comment

**Test:** Add a comment to a page

```
Use addComment tool:
- pageId: [PAGE_ID]
- content: "<p>Test comment via MCP</p>"
```

**Expected Result:**

- Comment added successfully
- Comment visible on the page

---

### 6. Advanced Jira Operations

**⚠️ Creates filters and modifies data**

#### 6.1 Create Filter

**Test:** Create a JQL filter

```
Use createFilter tool:
- name: "Test Filter via MCP"
- jql: "project = [PROJECT_KEY] AND status = Open"
```

**Expected Result:**

- Filter created
- Returns filter ID

#### 6.2 List Issues with JQL

**Test:** Complex JQL query

```
Use listIssues with custom JQL:
- jql: "project = [PROJECT_KEY] AND updated >= -7d ORDER BY updated DESC"
- limit: 10
```

**Expected Result:**

- Issues from last 7 days
- Sorted by update date

---

## ⚠️ MANDATORY Clean Up

**DO NOT SKIP THIS!** After testing, you MUST clean up test data:

1. **Delete test issue**: Navigate to Jira → find test issue → More → Delete
2. **Delete test page**: Navigate to Confluence → find test page → ⋯ → Delete
3. **Delete test filter**: Use `deleteFilter` tool with the filter ID, or delete via Jira UI
4. **Verify cleanup**: Check that test items are removed from Jira/Confluence

**Note:** Some operations cannot be easily undone. Use test environments!

---

## Test Report Template

```
Date: [DATE]
Tester: Cursor AI
MCP Server Version: 2.2.0

Results:
1. Server Connection: [✅/❌]
2. Jira Read Operations: [✅/❌]
   - listProjects: [✅/❌]
   - getProject: [✅/❌]
   - listIssues: [✅/❌]
   - getIssue: [✅/❌]
3. Confluence Read Operations: [✅/❌]
   - listSpaces: [✅/❌]
   - getSpace: [✅/❌]
   - listPages: [✅/❌]
   - getPage: [✅/❌]
4. Jira Write Operations: [✅/❌]
   - createIssue: [✅/❌]
   - updateIssue: [✅/❌]
   - transitionIssue: [✅/❌]
5. Confluence Write Operations: [✅/❌]
   - createPage: [✅/❌]
   - updatePage: [✅/❌]
   - addComment: [✅/❌]
6. Advanced Operations: [✅/❌]

Overall Status: [PASS/FAIL]
Notes: [Any issues or observations]
```

## Common Issues

### "Invalid configuration"

- Check that ATLASSIAN_SITE_NAME, ATLASSIAN_USER_EMAIL, and ATLASSIAN_API_TOKEN are set
- Verify API token is valid

### "404 Not Found"

- Check that the resource exists (project, issue, page, space)
- Verify you have permission to access it

### "Confluence content format error"

- Remember Confluence requires storage format (XML-like HTML)
- Use `<p>Content</p>` not plain text

### "Cannot transition issue"

- Check available transitions first with getIssue
- Ensure transition ID is valid for current status

---

## ✅ Quick Smoke Test (SAFE - Read-Only)

For a rapid sanity check without modifying anything, run these 4 commands:

1. `List all available Atlassian MCP tools`
2. `Use listProjects to show Jira projects`
3. `Use listSpaces to show Confluence spaces`
4. `Use listIssues to find 3 issues in any project`

**These are READ-ONLY and safe to run in production.** If all 4 succeed, the server is working. ✅

---

## Summary of Dangerous Operations

The following tools MODIFY or DELETE data:

**Jira:**

- `createIssue` - Creates issues ⚠️
- `updateIssue` - Modifies issues ⚠️
- `transitionIssue` - Changes issue status ⚠️
- `assignIssue` - Changes assignee ⚠️
- `createFilter` - Creates saved filters ⚠️
- `deleteFilter` - Deletes filters ⚠️⚠️
- `createSprint` - Creates sprints ⚠️
- `startSprint` - Starts sprints ⚠️
- `closeSprint` - Closes sprints ⚠️
- `addIssueToSprint` - Moves issues to sprint ⚠️
- `createDashboard` - Creates dashboards ⚠️
- `updateDashboard` - Modifies dashboards ⚠️

**Confluence:**

- `createPage` - Creates pages ⚠️
- `updatePage` - Modifies pages ⚠️
- `updatePageTitle` - Changes page titles ⚠️
- `deletePage` - **DELETES pages** ⚠️⚠️⚠️
- `addComment` - Adds comments ⚠️
- `updateFooterComment` - Modifies comments ⚠️
- `deleteFooterComment` - Deletes comments ⚠️⚠️

**Legend:**

- ⚠️ = Creates/modifies data
- ⚠️⚠️ = Deletes data (potentially dangerous)
- ⚠️⚠️⚠️ = Destructive operation (hard to undo)
