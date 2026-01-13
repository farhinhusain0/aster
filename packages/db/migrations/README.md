# Database Migrations

This directory contains database migration scripts for the Aster project. Migrations are used to modify the database schema or data in a controlled, versioned manner.

## Overview

Migrations in this project are JavaScript files that use MongoDB's native driver to perform database operations. Each migration supports both forward (`up`) and rollback (`down`) operations, allowing you to apply and revert changes safely.

## Migration Structure

Each migration file follows this structure:

```javascript
const { runMigration } = require("./base");

async function up(db) {
  // Forward migration logic
  // db is the MongoDB native database instance
}

async function down(db) {
  // Rollback migration logic
}

runMigration(up, down)
  .then(() => {
    console.log("Migration completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed!", error);
    process.exit(1);
  });
```

## Prerequisites

Before running migrations, ensure you have:

1. **Environment variables configured**: The migrations require `MONGO_URI` to be set in your environment
2. **Node.js installed**: Migrations run with Node.js
3. **Dependencies installed**: Run `yarn install` or `npm install` in the project root

## Running Migrations

### Running a Migration Forward (Up)

To apply a migration, run it with the `up` command (or no command, as `up` is the default):

```bash
npx dotenv-cli -o -e .env -e services/api/.env node packages/db/migrations/<migration-file-name>.js [up]
```

**Example:**

```bash
npx dotenv-cli -o -e .env -e services/api/.env node packages/db/migrations/add-htmlUrl-in-asterAdded-object-inside-jsmDetails.js up
```

Or simply (since `up` is the default):

```bash
npx dotenv-cli -o -e .env -e services/api/.env node packages/db/migrations/add-htmlUrl-in-asterAdded-object-inside-jsmDetails.js
```

### Rolling Back a Migration (Down)

To rollback a migration, run it with the `down` command:

```bash
npx dotenv-cli -o -e .env -e services/api/.env node packages/db/migrations/<migration-file-name>.js down
```

**Example:**

```bash
npx dotenv-cli -o -e .env -e services/api/.env node packages/db/migrations/add-htmlUrl-in-asterAdded-object-inside-jsmDetails.js down
```

### Running Migrations Inside Docker

If you are running Aster via Docker (for example with `docker compose up -d`), you can execute migrations from inside the `api` service container so they use the same environment and network as the app.

**Examples:**

- **Run `up` (default) inside the `api` container:**

  ```bash
  docker exec -it <api_container_id> sh
  cd /app
  node packages/db/migrations/add-htmlUrl-in-asterAdded-object-inside-jsmDetails.js up
  ```

- **Explicitly run `down` inside the `api` container:**

  ```bash
  docker exec -it <api_container_id> sh
  cd /app
  node packages/db/migrations/add-htmlUrl-in-asterAdded-object-inside-jsmDetails.js down
  ```


## Command Breakdown

The migration command structure:

- `npx dotenv-cli`: Loads environment variables from `.env` files
  - `-o`: Override existing environment variables
  - `-e .env`: Load variables from the root `.env` file
  - `-e services/api/.env`: Load variables from the API service `.env` file
- `node packages/db/migrations/<migration-file>.js`: The migration script to execute
- `[up|down]`: Optional command argument (defaults to `up`)

## Environment Variables

Migrations require the following environment variable:

- `MONGO_URI`: MongoDB connection string (e.g., `mongodb://localhost:27017/aster-db`)

This variable should be defined in either:

- `.env` in the project root
- `services/api/.env`

The `dotenv-cli` tool loads variables from both files, with later files taking precedence.

## Creating New Migrations

1. **Create a new migration file** in `packages/db/migrations/` with a descriptive name:

   ```bash
   touch packages/db/migrations/your-migration-name.js
   ```

2. **Use the migration template**:

   ```javascript
   const { runMigration } = require("./base");

   async function up(db) {
     console.log("Starting migration: your-migration-name");

     // Your forward migration logic here
     // Use db.collection("collectionName") to access collections

     console.log("Migration completed successfully");
   }

   async function down(db) {
     console.log("Starting rollback: your-migration-name");

     // Your rollback logic here
     // This should undo what the up() function does

     console.log("Rollback completed successfully");
   }

   runMigration(up, down)
     .then(() => {
       console.log("Migration completed!");
       process.exit(0);
     })
     .catch((error) => {
       console.error("Migration failed!", error);
       process.exit(1);
     });
   ```

3. **Test your migration**:
   - Test the `up` operation on a development database
   - Test the `down` operation to ensure it properly reverts changes
   - Verify data integrity after both operations

## Best Practices

1. **Always implement both `up` and `down` functions**: This ensures you can rollback if needed
2. **Use descriptive migration file names**: Include what the migration does (e.g., `add-htmlUrl-in-asterAdded-object-inside-jsmDetails.js`)
3. **Add logging**: Use `console.log` to track progress and help with debugging
4. **Handle errors gracefully**: Check for missing data, null values, and edge cases
5. **Test on development first**: Never run migrations on production without testing
6. **Backup before running**: Consider backing up your database before running migrations in production
7. **Run migrations one at a time**: Execute migrations individually to monitor their progress
8. **Document complex logic**: Add comments explaining non-obvious migration steps

## Troubleshooting

### Migration fails to connect to database

- **Check `MONGO_URI`**: Ensure it's correctly set in your `.env` files
- **Verify MongoDB is running**: Make sure your MongoDB instance is accessible
- **Check network connectivity**: Ensure you can reach the MongoDB server

### Migration fails mid-execution

- **Check the error message**: The migration will output detailed error information
- **Review the migration code**: Look for potential issues in the logic
- **Check database state**: Verify what changes were made before the failure
- **Use rollback if needed**: Run the migration with `down` to revert partial changes

### Environment variables not loading

- **Verify file paths**: Ensure `.env` files exist in the expected locations
- **Check file permissions**: Make sure the files are readable
- **Verify dotenv-cli**: Ensure `dotenv-cli` is installed (it's run via `npx`)
