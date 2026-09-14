# Join

Join is a Kanban-style task management app. It lets you organize tasks on a board, assign them to contacts, add new tasks, and track progress via a summary overview.

**🔗 Live Demo:** [join.anne-manthey.de](https://join.anne-manthey.de/)

Originally built as a group project by Kristina Starovoit, Anne Manthey, and Anja-Isabella Schulz. Now maintained independently by Anne Manthey.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.7.

## Features

- **Board** – organize tasks across columns with drag & drop
- **Task creation** – add tasks with priority, category, and subtasks
- **Contacts** – Supabase-backed contact management, including creating and editing contacts
- **Assignment** – assign tasks to one or more contacts
- **Summary** – dashboard overview of task counts and progress

## Tech Stack

- [Angular](https://angular.dev/) 22, built with standalone components and [Signals](https://angular.dev/guide/signals) for state management
- [Supabase](https://supabase.com/) as backend (database, and contact data storage)
- [Vitest](https://vitest.dev/) for unit testing

## Prerequisites

- [Node.js](https://nodejs.org/) and npm (this project pins `npm@11.12.1` via the `packageManager` field in `package.json`)

Install dependencies with:

```bash
npm install
```

## Environment Setup

This project connects to a [Supabase](https://supabase.com/) backend. Credentials are kept out of version control:

1. Copy `src/environments/environment.template.ts` to `src/environments/environment.ts`.
2. Fill in your Supabase project URL and publishable (anon) key:

```ts
export const environment = {
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseKey: 'YOUR_SUPABASE_PUBLISHABLE_KEY',
};
```

3. `src/environments/environment.ts` is listed in `.gitignore` and must never be committed.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Testing

This project currently only includes the default tests scaffolded by Angular CLI — there is no dedicated test coverage for the app's features yet.

To run the existing unit tests with the [Vitest](https://vitest.dev/) test runner:

```bash
ng test
```

Angular CLI does not come with an end-to-end testing framework by default; none is set up in this project at the moment.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.