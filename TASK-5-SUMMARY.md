# Task 5: Google Gemini AI Integration - Summary

## Overview
Implemented the AI plan generation engine that constructs personalized prompts from user profiles, sends requests to Google Gemini API, validates responses, and stores generated workout and meal plans in the database.

## Files Created

### TypeScript Types
- **`types/plans.ts`** - Complete type definitions for workout plans, meal plans, exercises, foods, macros, and API responses

### AI Client & Utilities
- **`lib/ai/gemini-client.ts`** - Gemini API client wrapper with retry logic (3 attempts, exponential backoff)
- **`lib/ai/prompt-builder.ts`** - Constructs personalized prompts from user profile data with calculated calories/macros
- **`lib/ai/response-parser.ts`** - JSON response validation and parsing with detailed validation functions
- **`lib/ai/rate-limiter.ts`** - Rate limiting (10 requests per user per day) with database tracking
- **`lib/ai/templates/fallback-plans.ts`** - Template plans for AI failures, adjusted for user profile

### API Endpoint
- **`app/api/ai/generate-plan/route.ts`** - POST endpoint for plan generation with full error handling

## Key Features Implemented

### Gemini API Integration
- Uses `@google/generative-ai` SDK
- Model: `gemini-pro` with optimized generation config
- Temperature: 0.7, TopP: 0.8, TopK: 40
- Max output tokens: 8192

### Retry Logic
- 3 maximum retry attempts
- Exponential backoff (1s, 2s, 4s)
- Handles transient failures gracefully
- Non-retryable errors (invalid API key, safety blocks) fail immediately

### Prompt Construction
- Calculates target calories using Mifflin-St Jeor equation
- Activity multiplier based on training schedule
- Calorie adjustment: -500 for cut, +300 for bulk, maintenance for recomp
- Macro calculation: protein prioritized (1.8-2.2g/kg based on goal)
- Includes all user preferences: equipment, budget, disliked foods

### Response Validation
- Validates complete JSON structure
- Checks all required fields exist with correct types
- Extracts JSON from potentially wrapped responses
- Throws `ValidationError` for malformed responses

### Rate Limiting
- 10 requests per user per day
- Tracks usage by counting workout plans generated today
- Returns remaining requests and reset time
- Graceful handling of database errors (allows request)

### Fallback Plans
- 3-day full body workout template
- 2000 calorie meal plan template
- Automatically adjusts based on user profile:
  - Workout days based on schedule
  - Calories based on goal (±15%)
  - Macros recalculated for user weight
  - Meal portions scaled proportionally

### Database Storage
- Deactivates old active plans before saving new ones
- Stores plans in `workout_plans` and `meal_plans` tables
- Sets `active: true` for new plans
- Records `generated_at` timestamp

## API Endpoint Details

### POST /api/ai/generate-plan

**Authentication:** Required (Supabase session)

**Response Codes:**
- `200` - Success (plan generated or fallback used)
- `401` - Authentication required
- `404` - User profile not found
- `400` - Incomplete profile
- `429` - Rate limit exceeded
- `500` - Server error

**Success Response:**
```json
{
  "success": true,
  "data": {
    "workout_plan": { "weeks": 4, "days": [...] },
    "meal_plan": { "daily_calories": 2000, "macros": {...}, "meals": [...] }
  },
  "message": null,
  "isFallback": false
}
```

**Fallback Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "AI is temporarily unavailable. Using a template plan.",
  "isFallback": true
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Rate limit exceeded...",
  "code": "RATE_LIMIT"
}
```

## Prompt Template

The prompt builder generates comprehensive prompts including:
- User stats (height, weight, age, gender)
- Experience level (derived from schedule)
- Goal with detailed description
- Equipment list with proper labels
- Budget tier with description
- Disliked foods to avoid
- Pre-calculated target calories and macros
- Detailed JSON schema requirements

## Testing Instructions

### Prerequisites
1. Set `GEMINI_API_KEY` in `.env.local`
2. Have a user with completed profile in database

### Test Scenarios

1. **Successful AI Generation**
   ```bash
   curl -X POST http://localhost:3000/api/ai/generate-plan \
     -H "Cookie: your-session-cookie"
   ```
   Expected: Valid workout and meal plans returned

2. **Rate Limit Exceeded**
   - Generate 10 plans in one day
   - 11th request should return 429 error

3. **AI Failure Fallback**
   - Remove or invalidate `GEMINI_API_KEY`
   - Request should return template plan with `isFallback: true`

4. **Incomplete Profile**
   - User with empty `profile_data`
   - Should return 400 with "Incomplete profile" error

## Dependencies Added
- `@google/generative-ai` - Google's Generative AI SDK

## Success Criteria Met
- ✅ Gemini API integration works with valid API key
- ✅ Prompts include all user profile data
- ✅ AI returns valid JSON matching expected structure
- ✅ Response validation catches malformed JSON
- ✅ Rate limiting prevents excessive API usage (10/day)
- ✅ Retry logic handles transient failures (3 attempts)
- ✅ Fallback plans work when AI unavailable
- ✅ Generated plans save to database correctly
- ✅ Old plans deactivated when new plans generated
- ✅ Build passes without TypeScript errors

## Notes
- Exercise swap functionality not implemented (separate task)
- Recipe generation not implemented (separate task)
- Plan editing/customization not implemented (future enhancement)
- The fallback plan is personalized based on user profile when available
