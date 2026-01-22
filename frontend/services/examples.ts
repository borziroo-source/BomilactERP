/**
 * Example Usage Demonstrations
 * 
 * This file shows examples of how to use the new Axios-based services
 * in React components. These are reference examples, not production code.
 */

import { useEffect, useState } from 'react';
import { 
  getAllContracts, 
  createContract,
  getExpiringContracts 
} from './contracts';
import { 
  searchPartners,
  getPartnersWithOverdueDebt 
} from './partners';
import { 
  getAllSuppliers,
  updateSupplier 
} from './suppliers';
import { Contract } from '../types';

// ============================================================================
// EXAMPLE 1: Fetching data with error handling
// ============================================================================

export const useContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllContracts();
        setContracts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contracts');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  return { contracts, loading, error };
};

// ============================================================================
// EXAMPLE 2: Creating new data
// ============================================================================

export const createNewContract = async (contractData: {
  supplierId: string;
  supplierName: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  milkQuotaLiters: number;
  basePricePerLiter: number;
}) => {
  try {
    const newContract = await createContract({
      ...contractData,
      status: 'ACTIVE'
    });
    
    console.log('Contract created successfully:', newContract);
    return { success: true, contract: newContract };
  } catch (error) {
    console.error('Failed to create contract:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// ============================================================================
// EXAMPLE 3: Searching and filtering
// ============================================================================

export const searchForPartner = async (searchTerm: string) => {
  try {
    const results = await searchPartners(searchTerm);
    return results;
  } catch (error) {
    console.error('Partner search failed:', error);
    return [];
  }
};

// ============================================================================
// EXAMPLE 4: Checking alerts (expiring contracts, overdue debts)
// ============================================================================

export const checkBusinessAlerts = async () => {
  try {
    const [expiringContracts, overduePartners] = await Promise.all([
      getExpiringContracts(30), // Contracts expiring in 30 days
      getPartnersWithOverdueDebt()
    ]);

    return {
      expiringContractsCount: expiringContracts.length,
      overduePartnersCount: overduePartners.length,
      expiringContracts,
      overduePartners
    };
  } catch (error) {
    console.error('Failed to check alerts:', error);
    return null;
  }
};

// ============================================================================
// EXAMPLE 5: Updating data with optimistic UI
// ============================================================================

export const updateSupplierStatus = async (
  supplierId: string, 
  newStatus: 'ACTIVE' | 'INACTIVE'
) => {
  try {
    // Update on server
    const updatedSupplier = await updateSupplier(supplierId, { 
      status: newStatus 
    });
    
    return { success: true, supplier: updatedSupplier };
  } catch (error) {
    console.error('Failed to update supplier:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// ============================================================================
// EXAMPLE 6: Batch operations
// ============================================================================

export const loadDashboardData = async () => {
  try {
    // Load multiple datasets in parallel
    const [contracts, suppliers, alerts] = await Promise.all([
      getAllContracts(),
      getAllSuppliers(),
      checkBusinessAlerts()
    ]);

    return {
      success: true,
      data: {
        contracts,
        suppliers,
        alerts
      }
    };
  } catch (error) {
    console.error('Dashboard data loading failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// ============================================================================
// EXAMPLE 7: React Component with all patterns combined
// ============================================================================

/**
 * Example component showing full integration pattern
 */
export const ContractManagementExample = () => {
  const { contracts, loading, error } = useContracts();
  const [expiringContracts, setExpiringContracts] = useState<Contract[]>([]);

  useEffect(() => {
    // Load expiring contracts separately
    const loadExpiring = async () => {
      try {
        const expiring = await getExpiringContracts(30);
        setExpiringContracts(expiring);
      } catch (err) {
        console.error('Failed to load expiring contracts:', err);
      }
    };
    
    loadExpiring();
  }, []);

  const handleCreateContract = async () => {
    const result = await createNewContract({
      supplierId: 'sup-123',
      supplierName: 'Test Supplier',
      contractNumber: 'CTR-2024/NEW',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      milkQuotaLiters: 1000,
      basePricePerLiter: 2.10
    });

    if (result.success) {
      alert('Contract created successfully!');
      // Refresh the contracts list...
    } else {
      alert(`Failed to create contract: ${result.error}`);
    }
  };

  if (loading) return <div>Loading contracts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Contracts ({contracts.length})</h1>
      {expiringContracts.length > 0 && (
        <div style={{ color: 'red' }}>
          Warning: {expiringContracts.length} contracts expiring soon!
        </div>
      )}
      <button onClick={handleCreateContract}>Create New Contract</button>
      {/* Render contracts list... */}
    </div>
  );
};

// ============================================================================
// NOTES FOR DEVELOPERS:
// ============================================================================
// 
// 1. Always handle errors - the service layer throws errors for failed requests
// 2. Use try-catch blocks for async operations
// 3. Show loading states to users during API calls
// 4. Consider using React Query or SWR for more advanced data fetching patterns
// 5. The axios interceptor handles auth tokens automatically
// 6. All responses are strongly typed - TypeScript will help catch errors
// 7. Use Promise.all() for parallel requests when possible
// 8. Consider debouncing search operations
// ============================================================================
