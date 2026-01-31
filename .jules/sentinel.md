# Sentinel Journal

## 2024-02-27 - Critical Information Disclosure in Debug Endpoint
**Vulnerability:** A debug endpoint (`app/api/debug/firebase/route.ts`) was accessible publicly and returned sensitive environment variables in its JSON response, including the Firebase Project ID and the first 50 characters of the `FIREBASE_PRIVATE_KEY`. It also exposed full stack traces on error.
**Learning:** Development tools often get left in production codebases if not properly excluded or flagged. The file was likely used to verify Firebase connectivity during initial setup but was never removed.
**Prevention:**
1. Never create "debug" endpoints that return environment variables or secrets, even for testing.
2. If temporary debug endpoints are needed, add a `TODO: REMOVE` comment and use git hooks or CI checks to prevent them from being merged to main.
3. Use `process.env` checks or feature flags to disable debug logic in production builds.
