# Research call shapes

Context7 and Firecrawl MCP call bodies for Step 1 of `SKILL.md`.

## Context7: library documentation

```json
context7:resolve-library-id
{
 "libraryName": "<DETECTED_LIBRARY>",
 "query": "caching deduplication error handling best practices"
}
```

```json
context7:query-docs
{
 "libraryId": "<RESOLVED_ID>",
 "query": "staleTime cacheTime retry error handling optimistic updates"
}
```

Run for each major dependency (e.g., `@tanstack/react-query`, `axios`, `zod`).

## Firecrawl: current API patterns

```json
firecrawl:firecrawl_search
{
 "query": "<FRAMEWORK> API integration best practices [current year]",
 "limit": 5,
 "sources": [{ "type": "web" }]
}
```
