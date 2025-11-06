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

Run these first to verify connectivity without modifying data. These tests use the **tools-only interface** and are completely safe to run in any environment.

### 1. Server Connection & Discovery

**Test:** List all available tools

```
List all MCP tools available from the Atlassian server
```

**Expected Result:**

- Should return 31 tools (all tools-based, no resources)
- Tools should include: getPage, listPages, getIssue, listIssues, createIssue, etc.

---

### 2. Jira Read Operations - Projects

#### 2.1 List All Projects

**Test:** Get all accessible Jira projects

```
Use the listProjects tool to show all Jira projects I have access to
```

**Expected Result:**

- List of projects with keys, names, and project leads
- At least one project should be visible
- Each project should have a key (e.g., "OPS", "DEV")

#### 2.2 Get Project by Key

**Test:** Get details for a specific project

```
Use the getProject tool to get details for project [PROJECT_KEY]
```

**Expected Result:**

- Project name, description, type (software/business)
- Project lead information
- Project URL and key

#### 2.3 List Projects with Type Filter

**Test:** Filter projects by type

```
Use listProjects tool with type parameter set to "software"
```

**Expected Result:**

- Only software projects returned
- No business projects in results

---

### 3. Jira Read Operations - Issues

#### 3.1 List Issues in Project

**Test:** Search for issues in a project

```
Use listIssues to find the first 5 issues in project [PROJECT_KEY]
```

**Expected Result:**

- Array of issues with keys, summaries, statuses
- Issue assignees and creation dates
- URLs to view issues

#### 3.2 Get Issue by Key

**Test:** Get full details of a specific issue

```
Use getIssue tool to get details for issue [ISSUE_KEY]
```

**Expected Result:**

- Full issue details including description
- Status, assignee, reporter
- Comments and transitions available
- Issue type and priority

#### 3.3 List Issues with JQL

**Test:** Use JQL to search issues

```
Use listIssues with jql parameter:
"project = [PROJECT_KEY] AND status = Open ORDER BY created DESC"
```

**Expected Result:**

- Only open issues from the specified project
- Sorted by creation date (newest first)

#### 3.4 List Issues with Status Filter

**Test:** Filter issues by status

```
Use listIssues with project [PROJECT_KEY] and status "In Progress"
```

**Expected Result:**

- Only issues with "In Progress" status
- All from specified project

#### 3.5 List Issues with Assignee Filter

**Test:** Find issues assigned to specific user

```
Use listIssues with assignee parameter set to user email
```

**Expected Result:**

- Only issues assigned to that user
- Across all accessible projects

#### 3.6 List Issues with Pagination

**Test:** Test pagination parameters

```
Use listIssues with:
- project: [PROJECT_KEY]
- limit: 10
- startAt: 0
```

**Expected Result:**

- Maximum 10 issues returned
- First page of results

#### 3.7 Get Issue Transitions

**Test:** View available workflow transitions

```
Use getIssue for [ISSUE_KEY] and examine the transitions field
```

**Expected Result:**

- List of available transitions (e.g., "In Progress", "Done")
- Transition IDs for each available transition
- Current status shown

---

### 4. Confluence Read Operations - Spaces

#### 4.1 List All Spaces

**Test:** Get all Confluence spaces

```
Use listSpaces tool to show all Confluence spaces
```

**Expected Result:**

- List of spaces with IDs, keys, names
- Space types (global/personal)
- At least one space visible

#### 4.2 Get Space by ID

**Test:** Get details for a specific space

```
Use getSpace tool with spaceId [SPACE_ID]
```

**Expected Result:**

- Space name, key, type
- Description and homepage info
- Space ID matches request

#### 4.3 List Spaces with Type Filter

**Test:** Filter spaces by type

```
Use listSpaces with type parameter set to "global"
```

**Expected Result:**

- Only global spaces returned
- No personal spaces in results

#### 4.4 List Spaces with Status Filter

**Test:** Filter spaces by status

```
Use listSpaces with status parameter set to "current"
```

**Expected Result:**

- Only current (non-archived) spaces
- No archived spaces in results

#### 4.5 List Spaces with Pagination

**Test:** Test pagination

```
Use listSpaces with limit set to 5
```

**Expected Result:**

- Maximum 5 spaces returned
- Cursor provided if more spaces exist

---

### 5. Confluence Read Operations - Pages

#### 5.1 List All Pages

**Test:** List pages without filters

```
Use listPages tool to show pages (no filters)
```

**Expected Result:**

- Array of pages from all accessible spaces
- Page titles, IDs, and space information

#### 5.2 List Pages in Space

**Test:** List pages filtered by space

```
Use listPages tool with spaceId [SPACE_ID]
```

**Expected Result:**

- Only pages from specified space
- Page status and URLs included

#### 5.3 List Pages by Title

**Test:** Search pages by title

```
Use listPages with title parameter "Getting Started"
```

**Expected Result:**

- Pages matching or containing that title
- Partial matches included

#### 5.4 List Pages by Status

**Test:** Filter pages by status

```
Use listPages with status "current"
```

**Expected Result:**

- Only current (non-archived, non-deleted) pages
- No draft or archived pages

#### 5.5 Get Page by ID

**Test:** Get full content of a page

```
Use getPage tool with pageId [PAGE_ID]
```

**Expected Result:**

- Page title, body content (in storage format)
- Version information
- Creation and update dates
- Author information

#### 5.6 Get Page with Different Body Formats

**Test:** Request page in different formats

```
Use getPage with:
- pageId: [PAGE_ID]
- bodyFormat: "storage"
```

**Expected Result:**

- Page content in Confluence storage format (XML-like HTML)
- All macros and structured content preserved

#### 5.7 List Pages with Pagination

**Test:** Test pagination for pages

```
Use listPages with:
- spaceId: [SPACE_ID]
- limit: 10
```

**Expected Result:**

- Maximum 10 pages returned
- Cursor for next page if more exist

---

### 6. Advanced Read-Only Scenarios

#### 6.1 Multi-Project Issue Search

**Test:** Search across multiple projects

```
Use listIssues with JQL:
"project in ([PROJECT1], [PROJECT2]) AND created >= -30d"
```

**Expected Result:**

- Issues from both projects
- Only from last 30 days
- Combined results

#### 6.2 Complex JQL Query

**Test:** Advanced JQL with multiple conditions

```
Use listIssues with JQL:
"project = [PROJECT_KEY] AND status != Done AND assignee is not EMPTY ORDER BY priority DESC, updated DESC"
```

**Expected Result:**

- Unfinished issues with assignees
- Sorted by priority, then update date

#### 6.3 Search Issues by Labels

**Test:** Find issues with specific labels

```
Use listIssues with JQL:
"project = [PROJECT_KEY] AND labels = urgent"
```

**Expected Result:**

- Only issues tagged with "urgent" label
- From specified project

#### 6.4 Search Recent Updates

**Test:** Find recently updated issues

```
Use listIssues with JQL:
"updated >= -7d ORDER BY updated DESC"
limit: 20
```

**Expected Result:**

- Issues updated in last 7 days
- Sorted newest first
- Maximum 20 results

#### 6.5 Confluence Page Hierarchy

**Test:** Navigate page hierarchy

```
1. Use listPages to find a parent page in space
2. Use getPage to view its details
3. Check for child pages in the structure
```

**Expected Result:**

- Parent page details visible
- Child page references if any exist
- Hierarchical structure clear

#### 6.6 Cross-Reference Pages and Spaces

**Test:** Find pages across multiple spaces

```
1. Use listSpaces to get multiple space IDs
2. Use listPages for each space
3. Compare results
```

**Expected Result:**

- Pages organized by space
- Each space's pages isolated
- No cross-contamination

---

### 7. Error Handling & Edge Cases (Read-Only)

#### 7.1 Invalid Project Key

**Test:** Request non-existent project

```
Use getProject with projectKey "INVALID-XXX"
```

**Expected Result:**

- Error message indicating project not found
- 404 or appropriate error code

#### 7.2 Invalid Issue Key

**Test:** Request non-existent issue

```
Use getIssue with issueKey "INVALID-999999"
```

**Expected Result:**

- Error message indicating issue not found
- Clear error response

#### 7.3 Invalid Space ID

**Test:** Request non-existent space

```
Use getSpace with spaceId "999999999"
```

**Expected Result:**

- Error message indicating space not found
- Appropriate error handling

#### 7.4 Invalid Page ID

**Test:** Request non-existent page

```
Use getPage with pageId "999999999"
```

**Expected Result:**

- Error message indicating page not found
- Clear error response

#### 7.5 Empty Result Sets

**Test:** Search with no matches

```
Use listIssues with JQL:
"project = [PROJECT_KEY] AND summary ~ 'XYZABC123NOTFOUND'"
```

**Expected Result:**

- Empty array returned
- No errors thrown
- Graceful handling

#### 7.6 Permission Denied Scenarios

**Test:** Access restricted resource (if applicable)

```
Try to access a project/space you don't have permission to view
```

**Expected Result:**

- 403 Forbidden error
- Clear permission denied message

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
MCP Server Version: 3.0.1
Interface: Tools-Only (No Resources)

Results:

1. Server Connection & Discovery: [✅/❌]
   - List all tools: [✅/❌]
   - Tool count (expected ~31): [ACTUAL COUNT]

2. Jira Read Operations - Projects: [✅/❌]
   - listProjects (all): [✅/❌]
   - getProject (by key): [✅/❌]
   - listProjects (with filters): [✅/❌]

3. Jira Read Operations - Issues: [✅/❌]
   - listIssues (basic): [✅/❌]
   - getIssue (by key): [✅/❌]
   - listIssues (with JQL): [✅/❌]
   - listIssues (with filters): [✅/❌]
   - listIssues (with pagination): [✅/❌]
   - Get issue transitions: [✅/❌]

4. Confluence Read Operations - Spaces: [✅/❌]
   - listSpaces (all): [✅/❌]
   - getSpace (by ID): [✅/❌]
   - listSpaces (with filters): [✅/❌]
   - listSpaces (with pagination): [✅/❌]

5. Confluence Read Operations - Pages: [✅/❌]
   - listPages (all): [✅/❌]
   - listPages (by space): [✅/❌]
   - listPages (by title): [✅/❌]
   - listPages (by status): [✅/❌]
   - getPage (by ID): [✅/❌]
   - getPage (different formats): [✅/❌]
   - listPages (with pagination): [✅/❌]

6. Advanced Read-Only Scenarios: [✅/❌]
   - Multi-project searches: [✅/❌]
   - Complex JQL queries: [✅/❌]
   - Label-based searches: [✅/❌]
   - Recent updates queries: [✅/❌]
   - Page hierarchy navigation: [✅/❌]

7. Error Handling & Edge Cases: [✅/❌]
   - Invalid project key: [✅/❌]
   - Invalid issue key: [✅/❌]
   - Invalid space ID: [✅/❌]
   - Invalid page ID: [✅/❌]
   - Empty result sets: [✅/❌]
   - Permission denied (if applicable): [✅/❌]

8. Jira Write Operations: [✅/❌]
   - createIssue: [✅/❌]
   - updateIssue: [✅/❌]
   - transitionIssue: [✅/❌]

9. Confluence Write Operations: [✅/❌]
   - createPage: [✅/❌]
   - updatePage: [✅/❌]
   - addComment: [✅/❌]

10. Advanced Write Operations: [✅/❌]
    - Filter management: [✅/❌]
    - Sprint operations: [✅/❌]
    - Dashboard management: [✅/❌]

Overall Status: [PASS/FAIL]
Read-Only Tests: [X/42 passed]
Write Tests: [X/Y passed]
Notes: [Any issues or observations]
Architecture: Tools-only interface verified ✓
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

For a rapid sanity check without modifying anything, run these commands:

1. **Tool Discovery**: `List all available Atlassian MCP tools`
   - Expected: ~31 tools returned
2. **Jira Projects**: `Use listProjects to show Jira projects`
   - Expected: List of accessible projects
3. **Jira Issues**: `Use listIssues to find 3 issues in any project`
   - Expected: Array of issues with keys and summaries
4. **Confluence Spaces**: `Use listSpaces to show Confluence spaces`
   - Expected: List of spaces with IDs and keys
5. **Confluence Pages**: `Use listPages with a space ID to show pages`

   - Expected: Array of pages in that space

6. **Get Details**: `Use getIssue to get details for any issue key`

   - Expected: Full issue details including status and assignee

7. **Get Page**: `Use getPage to get details for any page ID`
   - Expected: Page content and metadata

**These are READ-ONLY and safe to run in production.** If all succeed, the server is working correctly. ✅

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
