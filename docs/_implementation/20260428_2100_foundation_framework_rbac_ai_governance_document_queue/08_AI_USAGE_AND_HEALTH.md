# 08_AI_USAGE_AND_HEALTH.md

## AI Audit Visibility
To maintain strict governance over AI advisory features, a new Audit and Health dashboard was added at `/admin/ai/usage`.

### AI Usage Logs
Every interaction with the AI service layer is now logged in the `AIUsageLog` table.
-   **Metadata Captured:** User, Feature, Provider, Model, Success/Failure, Error Message, Duration (ms), and Token Usage.
-   **Filtering:** Audit logs can be filtered by user, feature, or status.
-   **Security:** API keys and sensitive prompt contents are never stored in the logs.

### AI Service Health
A dedicated health panel provides real-time (cached) status of the AI provider connection:
-   **Configured State:** Shows if required environment variables are present.
-   **Demo Mode:** Indicates if the system is simulating AI responses.
-   **Connectivity Testing:** Provides a "Test AI Connection" button for Admin users to verify end-to-end API health with a safe prompt.
-   **Last Failure Insight:** Displays the error message from the most recent failed AI request for rapid debugging.
