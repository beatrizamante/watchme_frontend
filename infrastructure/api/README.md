# API Services Guide

This guide explains how to build and use API call services in your React Native frontend.

## Structure

```
infrastructure/api/
├── _lib/
│   └── apiClient.ts         # Axios instance with interceptors
├── people/
│   └── callPeopleApi.ts     # People API calls
├── users/
│   └── callUsersApi.ts      # User API calls
└── videos/
    └── callVideosApi.ts     # Video API calls
```

## Basic Pattern

Each API service follows this pattern:

### 1. Import Dependencies
```typescript
import z from "zod";
import { apiClient } from "../_lib/apiClient";
import InterfaceType from "../../../app/interfaces/interfaceType";
```

### 2. Define API Methods
```typescript
export const callApiName = {
  create: async (data: CreateInput): Promise<ReturnType> => {
    const response = await apiClient.post("/endpoint", data);
    return response.data;
  },

  update: async (data: UpdateInput): Promise<ReturnType> => {
    const response = await apiClient.patch("/endpoint", data);
    return response.data;
  },

  delete: async (data: DeleteInput): Promise<void> => {
    const response = await apiClient.delete(`/endpoint?id=${data.id}`);
    return response.data;
  },

  find: async (data: FindInput): Promise<ReturnType> => {
    const response = await apiClient.get(`/endpoint?id=${data.id}`);
    return response.data;
  },

  list: async (): Promise<ReturnType[]> => {
    const response = await apiClient.get("/endpoints");
    return response.data;
  },
};
```

### 3. Define Validation Schemas
```typescript
const CreateInput = z.object({
  field1: z.string().min(1, "Field is required"),
  field2: z.string().email("Invalid email"),
});

const UpdateInput = z.object({
  id: z.string(),
  field1: z.string().optional(),
});

// Export types
export type CreateInput = z.infer<typeof CreateInput>;
export type UpdateInput = z.infer<typeof UpdateInput>;
```

## File Upload Pattern

For endpoints that require file uploads (like creating a person with a picture):

```typescript
create: async (data: CreatePersonInput): Promise<Person> => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('picture', data.picture);

  const response = await apiClient.post("/person", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}
```

## Using APIs in Components

### Option 1: Direct Usage
```typescript
import { callPeopleApi } from '../infrastructure/api/people/callPeopleApi';

const MyComponent = () => {
  const handleCreatePerson = async () => {
    try {
      const result = await callPeopleApi.create({
        name: "John Doe",
        picture: selectedFile
      });
      console.log('Person created:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };
};
```

### Option 2: Custom Hooks (Recommended)
```typescript
// app/hooks/usePeopleApi.tsx
import { useState } from 'react';
import { callPeopleApi } from '../../infrastructure/api/people/callPeopleApi';

export const usePeopleApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPerson = async (data) => {
    setLoading(true);
    try {
      const result = await callPeopleApi.create(data);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createPerson, loading, error };
};
```

Then in your component:
```typescript
const MyComponent = () => {
  const { createPerson, loading, error } = usePeopleApi();

  const handleCreate = async () => {
    const result = await createPerson({ name: "John", picture: file });
    if (result) {
      // Success
    }
  };
};
```

## Error Handling

The `apiClient.ts` includes interceptors for global error handling:

- **401 Unauthorized**: Token expired or invalid
- **403 Forbidden**: Insufficient permissions
- **500+ Server Errors**: Backend issues

You can customize these in the response interceptor.

## Authentication

To add authentication tokens:

1. Uncomment the auth code in `apiClient.ts`
2. Implement `getAuthToken()` function
3. Store/retrieve tokens from your auth store (Zustand, AsyncStorage, etc.)

```typescript
// In apiClient.ts request interceptor
const token = getAuthToken();
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

## Query Parameters vs Path Parameters

- **Query parameters**: `?id=123&name=john`
- **Path parameters**: `/users/123`

Choose based on your backend API design.

## Examples

See `components/examples/PeopleListExample.tsx` for a complete working example.

## Best Practices

1. **Always use TypeScript types** for inputs and outputs
2. **Validate inputs** with Zod schemas
3. **Handle errors gracefully** in your UI
4. **Use custom hooks** for reusable API logic
5. **Show loading states** to users
6. **Implement retry mechanisms** for failed requests
