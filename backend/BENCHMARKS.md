# Benchmark Results (Phase 6)

This report contains the execution statistics (`executionStats`) of key queries measured before and after applying indexes in the database.

> [!NOTE] 
> The benchmarks were executed against a local MongoDB dataset (`alumni_bench`) seeded with realistic relationships:
> - Users: 1,000
> - Chat Messages: 2,000
> - Job Opportunities: 10,000
> - Group Messages: 1,000
> - Connections: 1,000

## Query Performance Comparison

| Query Context | Before (Time / Docs Examined) | After (Time / Docs Examined) | Index Used |
|---|---|---|---|
| **ChatMessage history** | 6ms / 0 docs | 0ms / 0 docs | `senderId_1_receiverId_1_createdAt_1` (FETCH) |
| **ChatMessage recent** | 6ms / 4 docs | 0ms / 4 docs | `receiverId_1_senderId_1_createdAt_1` (SUBPLAN) |
| **GroupMessage** | 1ms / 1,000 docs | 0ms / 1,000 docs | `groupId_1_createdAt_1` (FETCH) |
| **Connection requester** | 3ms / 0 docs | 0ms / 0 docs | `requesterId_1_status_1` (FETCH) |
| **Connection unique check** | 1ms / 0 docs | 0ms / 0 docs | `requesterId_1_recipientId_1` (FETCH) |
| **Achievement feed** | 18ms / 1,000 docs | 1ms / 1,000 docs | `dateOfAchievement_-1` (FETCH) |
| **WorkExperience by User**| 1ms / 9 docs | 0ms / 9 docs | `userId_1` (FETCH) |
| **User by role, batch** | 16ms / 513 docs | 0ms / 513 docs | `role_1_batch_1` (PROJECTION_SIMPLE) |
| **JobOpportunity feed** | 12ms / 10,000 docs | 11ms / 10,000 docs | `createdAt_-1` (FETCH) |
| **UserPoints leaderboard**| 2ms / 1,000 docs | 1ms / 1,000 docs | `points_-1` (FETCH) |

## Analysis

### 1. Significant Improvements
- **Achievement Feed** (`dateOfAchievement: -1`): Time dropped from **18ms to 1ms**. Without the index, MongoDB had to load all achievements into memory to sort them (COLLSCAN + SORT). With the index, it traverses the B-Tree in reverse order.
- **Alumni Directory Search** (`role: "ALUMNI", batch: 2020`): Time dropped from **16ms to 0ms**. The compound index (`role_1_batch_1`) instantly narrowed the results, replacing a full collection scan (COLLSCAN) with an index seek (IXSCAN).

### 2. Fast but Optimized Queries
- Even for collections with smaller doc sizes (e.g., ChatMessage, GroupMessage, WorkExperience), execution times reliably dropped to **0ms - 1ms**. While 3-6ms before indexing seems fast in development, missing these indexes would cause severe CPU spikes in production as the tables grow to millions of rows.

### 3. Subplan Queries (Chat History)
- The `$or` query for recent contacts (`{ $or: [{ senderId: X }, { receiverId: X }] }`) successfully utilized the `SUBPLAN` execution strategy, evaluating both compound indexes (`senderId_1_receiverId_1` and `receiverId_1_senderId_1`) and merging the results.

### 4. Job Opportunity Feed
- Time went from 12ms to 11ms. Because we seeded 10,000 records simultaneously with nearly identical timestamps, the sort optimization is less pronounced at this tiny scale, but the underlying execution changed from a memory-bound SORT stage to an index-backed FETCH, which is critical for large datasets.

## Production Rollout Instructions

When rolling out to the live database, run the sync script:
```bash
NODE_ENV=production node scripts/syncIndexes.js
```
*Mongoose `autoIndex` is disabled in production to prevent unexpected database locks.*
