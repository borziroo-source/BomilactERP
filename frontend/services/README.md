# BomilactERP API Services

This directory contains the API service layer for the BomilactERP frontend application, now powered by **Axios** for enhanced HTTP request handling.

## Architecture

### axiosClient.ts
The centralized Axios configuration with:
- **Base URL**: Configured via `VITE_API_URL` environment variable (defaults to `http://localhost:8080/api`)
- **Timeout**: 30 seconds default timeout for all requests
- **Request Interceptor**: Automatically adds authentication tokens from localStorage
- **Response Interceptor**: Handles errors consistently across the application
- **Error Handling**: Provides user-friendly error messages for different HTTP status codes

### Service Files

Each service file follows a consistent pattern:

1. **Type Definitions**: Frontend types and API DTO types
2. **Mapping Functions**: Transform between frontend and API data structures
3. **CRUD Operations**: Standard create, read, update, delete operations
4. **Specialized Queries**: Domain-specific API calls

Available services:
- `contracts.ts` - Contract management
- `partners.ts` - Partner (customer) management
- `suppliers.ts` - Supplier (farmer/milk producer) management
- `products.ts` - Product catalog management

## Usage Examples

### Basic Import and Usage

```typescript
import { getAllContracts, createContract } from '@/services/contracts';
import { searchPartners } from '@/services/partners';

// Get all contracts
const contracts = await getAllContracts();

// Search partners
const partners = await searchPartners('Merkúr');

// Create new contract
const newContract = await createContract({
  supplierId: 'sup-123',
  supplierName: 'Kovács István',
  contractNumber: 'CTR-2024/001',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  milkQuotaLiters: 1500,
  basePricePerLiter: 2.10,
  status: 'ACTIVE'
});
```

### Using in React Components

```typescript
import React, { useEffect, useState } from 'react';
import { getAllContracts } from '@/services/contracts';
import { Contract } from '@/types';

const ContractList: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const data = await getAllContracts();
        setContracts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contracts');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {contracts.map(contract => (
        <div key={contract.id}>{contract.contractNumber}</div>
      ))}
    </div>
  );
};
```

### Error Handling

Axios automatically handles errors through the response interceptor. All errors are converted to Error objects with user-friendly messages:

```typescript
import { updatePartner } from '@/services/partners';

try {
  await updatePartner('p-001', { 
    creditLimit: 60000 
  });
  console.log('Partner updated successfully');
} catch (error) {
  // Error message is already formatted by the interceptor
  console.error('Failed to update partner:', error.message);
  // Show error to user
  alert(error.message);
}
```

### Authentication

The Axios client automatically includes authentication tokens in requests if they exist in localStorage:

```typescript
// Set auth token after login
localStorage.setItem('authToken', 'your-jwt-token');

// All subsequent API calls will include: Authorization: Bearer your-jwt-token
const partners = await getAllPartners();

// Clear token on logout
localStorage.removeItem('authToken');
```

## Environment Configuration

Set the API base URL in your `.env.local` file:

```env
# Backend API URL
VITE_API_URL=http://localhost:8080/api

# Or for production
VITE_API_URL=https://api.bomilact.ro/api
```

## Advantages Over Fetch API

✅ **Automatic Timeout Handling** - No more hanging requests  
✅ **Global Error Interceptor** - Consistent error handling  
✅ **Less Boilerplate** - No need for `ensureOk()` and `parseJson()` helpers  
✅ **Request Transformation** - Automatic JSON serialization  
✅ **Response Transformation** - Automatic JSON parsing  
✅ **Better TypeScript Support** - Generic type parameters for responses  
✅ **Easier Testing** - Can be mocked with axios-mock-adapter  

## API DTO Pattern

The services use a mapping pattern to convert between API DTOs (snake_case) and frontend types (camelCase):

```typescript
// API returns snake_case
interface ContractApiDto {
  supplier_id: string;
  milk_quota_liters: number;
  base_price_per_liter: number;
}

// Frontend uses camelCase
interface Contract {
  supplierId: string;
  milkQuotaLiters: number;
  basePricePerLiter: number;
}

// Mapping functions handle the transformation
const mapFromApi = (dto: ContractApiDto): Contract => ({
  supplierId: dto.supplier_id,
  milkQuotaLiters: dto.milk_quota_liters,
  basePricePerLiter: dto.base_price_per_liter,
});
```

This pattern keeps the frontend code clean while maintaining compatibility with the backend API conventions.

## Adding New Services

To add a new service:

1. Create a new file in `/services/` (e.g., `orders.ts`)
2. Import `axiosClient`
3. Define API DTO types
4. Create mapping functions (`mapFromApi`, `mapToApi`)
5. Implement service functions using axiosClient
6. Export functions from `index.ts`

Example template:

```typescript
import axiosClient from './axiosClient';
import { YourType } from '../types';

interface YourTypeApiDto {
  // API fields in snake_case
}

const mapFromApi = (dto: YourTypeApiDto): YourType => ({
  // Transform to camelCase
});

const mapToApi = (obj: Partial<YourType>): Partial<YourTypeApiDto> => ({
  // Transform to snake_case
});

export const getAll = async (): Promise<YourType[]> => {
  const response = await axiosClient.get<YourTypeApiDto[]>('/your-endpoint');
  return response.data.map(mapFromApi);
};

// Add more functions...
```

## Testing

When writing tests, you can mock the axios client:

```typescript
import axios from 'axios';
import { getAllContracts } from './contracts';

jest.mock('./axiosClient');

test('getAllContracts fetches contracts', async () => {
  const mockData = [{ id: '1', contract_number: 'CTR-001', /* ... */ }];
  (axios.get as jest.Mock).mockResolvedValue({ data: mockData });
  
  const contracts = await getAllContracts();
  
  expect(contracts).toHaveLength(1);
  expect(contracts[0].contractNumber).toBe('CTR-001');
});
```

## Future Enhancements

Potential improvements to consider:

- Add request retry logic for failed requests
- Implement request cancellation for component unmounting
- Add request/response logging in development mode
- Implement caching strategy (e.g., with React Query or SWR)
- Add optimistic updates for better UX
- Implement request deduplication
- Add upload progress tracking for file uploads
