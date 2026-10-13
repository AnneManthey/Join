# Join

Join is a Kanban-style task management app for organizing work, assigning tasks to contacts, and tracking progress. Team members can manage tasks across a board and review progress in a summary view. Stakeholders can access a public Issue Collector form to describe a request. The app is built with Angular and uses Supabase for backend data and authentication.

**Live demo:** [join.anne-manthey.de](https://join.anne-manthey.de/)

Originally built as a group project by Kristina Starovoit, Anne Manthey, and Anja-Isabella Schulz. Now maintained and further developed independently by Anne Manthey.

## Features

- Kanban board with task status columns and drag-and-drop
- Task creation and editing, including priority, category, subtasks, and contact assignments
- Contact management and task assignment
- Summary dashboard for task progress
- Public stakeholder Issue Collector form for entering a name, email, subject, and request
- Authentication and registration for team members

## Tech stack

- Angular 22 with standalone components and Signals
- Supabase for backend data and authentication
- Vitest for unit tests

## Quickstart

### Prerequisites

- Node.js
- npm 11.12.1 (pinned in `package.json`)

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure Supabase by copying `src/environments/environment.template.ts` to `src/environments/environment.ts` and setting the project URL and publishable key:

   ```ts
   export const environment = {
     supabaseUrl: 'YOUR_SUPABASE_URL',
     supabaseKey: 'YOUR_SUPABASE_PUBLISHABLE_KEY',
   };
   ```

   The environment file is ignored by Git; do not commit credentials.

3. Start the development server:

   ```bash
   npm start
   ```

   The app is served at `http://localhost:4200/`.

## Usage

- `/` — welcome page with links to stakeholder requests and team login
- `/stakeholder` — stakeholder information page
- `/request` — Issue Collector form
- `/login` and `/register` — team member authentication
- `/board`, `/contacts`, and `/summary` — task management pages for authenticated team members

## Notes

- The Issue Collector form interface is present, but its n8n webhook is not connected yet. Submitting the form currently does not send or store a request.
- An optional local n8n service is defined in `n8n/docker-compose.yml`. Its environment template is `n8n/.env.template`; n8n workflows and credentials are not included in this repository.

## Tests

Run the unit tests with:

```bash
npm test
```

## Build

Create a production build with:

```bash
npm run build
```
