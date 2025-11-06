# API Reference: Tools

Complete reference for all Tools (actions) supported by the MCP Atlassian Server, including Atlassian API endpoints and technical implementation details.

## For Developers

This document provides detailed information about:

- How Tools are implemented
- Adding new or extending existing Tools
- Handling special cases (storage format, version conflicts, error handling)
- Debugging and maintenance

## JIRA

### 1. Issue
| Tool | Description | Key Parameters | Atlassian API Endpoint | Output |
|------|-------------|----------------|------------------------|--------|
| createIssue | Create new issue | projectKey, summary, ... | `/rest/api/3/issue` | Issue key and ID |
| updateIssue | Update issue | issueKey, summary, ... | `/rest/api/3/issue/{issueIdOrKey}` | Update status |
| transitionIssue | Change issue status | issueKey, transitionId | `/rest/api/3/issue/{issueIdOrKey}/transitions` | Transition status |
| assignIssue | Assign issue to user | issueKey, accountId | `/rest/api/3/issue/{issueIdOrKey}/assignee` | Assignment status |
| addIssuesToBacklog | Move issues to backlog | boardId, issueKeys | `/rest/agile/1.0/backlog/issue` or `/rest/agile/1.0/backlog/{boardId}/issue` | Operation status |
| addIssueToSprint | Add issues to sprint | sprintId, issueKeys | `/rest/agile/1.0/sprint/{sprintId}/issue` | Operation status |
| rankBacklogIssues | Reorder backlog issues | boardId, issueKeys, rankBeforeIssue, rankAfterIssue | `/rest/agile/1.0/backlog/rank` | Ranking status |

### 2. Sprint
| Tool | Description | Key Parameters | Atlassian API Endpoint | Output |
|------|-------|---------------|-----------------------|----------------|
| createSprint | Create sprint new | boardId, name, ... | `/rest/agile/1.0/sprint` | Sprint ID new |
| startSprint | Bắt đầu sprint | sprintId, ... | `/rest/agile/1.0/sprint/{sprintId}/start` | Status of bắt đầu |
| closeSprint | Đóng sprint | sprintId, ... | `/rest/agile/1.0/sprint/{sprintId}/close` | Status of đóng |
| addIssueToSprint | Add issue to sprint | sprintId, issueKeys | `/rest/agile/1.0/sprint/{sprintId}/issue` | Status of add |

### 3. Filter
| Tool | Description | Key Parameters | Atlassian API Endpoint | Output |
|------|-------|---------------|-----------------------|----------------|
| createFilter | Create filter new | name, jql, ... | `/rest/api/3/filter` | Filter ID new |
| updateFilter | Update filter | filterId, ... | `/rest/api/3/filter/{filterId}` | Status of update |
| deleteFilter | Delete filter | filterId | `/rest/api/3/filter/{filterId}` | Status of xoá |

### 4. Dashboard & Gadget
| Tool | Description | Key Parameters | Atlassian API Endpoint | Output |
|------|-------|---------------|-----------------------|----------------|
| createDashboard | Create dashboard new | name, ... | `/rest/api/3/dashboard` | Dashboard ID new |
| updateDashboard | Update dashboard | dashboardId, ... | `/rest/api/3/dashboard/{dashboardId}` | Status of update |
| addGadgetToDashboard | Add gadget to dashboard | dashboardId, uri, ... | `/rest/api/3/dashboard/{dashboardId}/gadget` | Gadget ID new |
| removeGadgetFromDashboard | Delete gadget from dashboard | dashboardId, gadgetId | `/rest/api/3/dashboard/{dashboardId}/gadget/{gadgetId}` | Status of delete |

---

## CONFLUENCE

### 1. Page
| Tool | Description | Key Parameters | Atlassian API Endpoint | Output |
|------|-------|---------------|-----------------------|----------------|
| createPage | Create page new | spaceId, title, content, parentId | `/wiki/api/v2/pages` | Page ID new |
| updatePage | Update nội dung page | pageId, title, content, version | `/wiki/api/v2/pages/{pageId}` (PUT) | Status of update |
| updatePageTitle | Đổi tiêu đề page | pageId, title, version | `/wiki/api/v2/pages/{pageId}/title` (PUT) | Status of update |
| deletePage | Delete page | pageId, draft, purge | `/wiki/api/v2/pages/{pageId}` (DELETE) | Status of delete |

### 2. Comment
| Tool | Description | Key Parameters | Atlassian API Endpoint | Output |
|------|-------|---------------|-----------------------|----------------|
| addComment | Add comment to page | pageId, content | `/wiki/api/v2/footer-comments` | New comment |
| updateFooterComment | Update footer comment | commentId, version, value, ... | `/wiki/api/v2/footer-comments/{commentId}` (PUT) | Update status |
| deleteFooterComment | Delete footer comment | commentId | `/wiki/api/v2/footer-comments/{commentId}` (DELETE) | Delete status |

---
