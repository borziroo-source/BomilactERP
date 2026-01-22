/**
 * Service Layer Index
 * 
 * Central export point for all API services
 * Import services using: import { contractService, partnerService } from '@/services'
 */

// Export axios client for custom API calls
export { default as axiosClient } from './axiosClient';

// Export all service functions
export * as contractService from './contracts';
export * as partnerService from './partners';
export * as supplierService from './suppliers';
export * as productService from './products';

// Re-export individual services for direct imports
export * from './contracts';
export * from './partners';
export * from './suppliers';
export * from './products';

// Export gemini service (AI functionality)
export * from './geminiService';
