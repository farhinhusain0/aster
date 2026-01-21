# Seed Data

## Problem

When database schemas change (e.g., adding required fields to `IUser` or `IInvestigation`), hardcoded seed data can break at runtime without any compile-time warnings.

## Solution

Use **type-safe factory functions** to create seed data.

## How It Works

Instead of:
```typescript
const user = await userModel.create({
  email: "test@example.com",
  // Missing fields - no TypeScript error!
});
```

We use:
```typescript
const userData = createSeedUser({
  email: "test@example.com",
  // TypeScript errors if required fields are missing
});
const user = await userModel.create(userData);
```

## Benefits

- **Compile-time validation**: TypeScript catches missing fields before runtime
- **Forced updates**: Schema changes break the build, forcing seed data updates
- **Single source of truth**: Factories centralize seed data creation logic
- **Maintainability**: Update factory once, not every seed file

## Usage

```typescript
import { createSeedUser, createSeedOrganization, SEED_USER_PRESETS } from "./factories";

// Use factory functions
const orgData = createSeedOrganization({ ... });
const userData = createSeedUser({ ... });
```

When a schema adds required fields, the factory function will show TypeScript errors, preventing broken seed data from being committed.

## Seeding Quick-Start Data

Quick-start seed data is automatically loaded when the API server starts if the `SEED_QUICK_START_DATA` environment variable is set to `true`.

### Enabling Seed Data

Set the environment variable in your `.env` file:

```bash
SEED_QUICK_START_DATA=true
```

The seed data includes:
- Demo organization (Aster)
- Demo user (linus@aster.so / @justForFun1991)
- Sample investigation with checks

### Disabling Seed Data

To prevent seed data from being loaded at startup, set the variable to `false` or remove it:

```bash
SEED_QUICK_START_DATA=false
```

## Removing Seed Data

To remove all quick-start seed data from the database, use the unseed command.

### Local Development

```bash
# From the services/api directory
yarn unseed

# Or from the workspace root
nx run api:unseed
```

### Docker Container

If running inside a Docker container:

```bash
# Using docker-compose exec (while container is running)
docker-compose exec api yarn unseed

# Or with docker exec directly
docker exec -it api yarn unseed

# For quick-start setup
docker exec -it aster-quick-api yarn unseed
```

### What Gets Removed

The unseed command removes all quick-start seed data in the correct order:
- Integrations associated with the seed organization
- Investigations and investigation checks
- Users, auth tokens, and profiles
- Plan states
- Organizations

The operation is idempotent and safe to run multiple times.
