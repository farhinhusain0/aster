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
