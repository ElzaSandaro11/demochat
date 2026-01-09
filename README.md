# Safe Chatbot (CLI)

A robust CLI Chatbot built with **TypeScript**, designed to demonstrate clean architecture, content filtering, and audit logging without the overhead of heavy frameworks.

## Features

-   **Content Filtering**: Dedicated `ContentFilter` class to detect and block unsafe content (e.g., "hack", "violence") before processing.
-   **Architecture**: Built on **Vanilla TypeScript** using manual Dependency Injection for simplicity and testability.
-   **CLI Interface**: Interactive command-line interface.
-   **Audit Logging**: Integrated **SQLite** to persist chat history and security incidents.

## Installation

```bash
npm install
```

## Running the App

```bash
# Development mode
npm run start
```

## Testing

```bash
npm test
```

## License
MIT
