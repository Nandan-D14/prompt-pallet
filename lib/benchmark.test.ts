
import { performance } from 'perf_hooks';

// --- Test Setup ---

// 1. In-memory store to act as our mock Firestore database
const mockDbStore = new Map<string, any>();
let addDocCounter = 0;

// 2. Mock dependencies
jest.mock('firebase/firestore', () => ({
    getDocs: async (query: any) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 50));

        // If it's a collection query (no constraints or empty constraints)
        if (!query.constraints || query.constraints.length === 0) {
             const results: any[] = [];
             mockDbStore.forEach((doc, id) => {
                results.push({ id, data: () => doc });
            });
            return {
                empty: results.length === 0,
                size: results.length,
                docs: results
            };
        }

        const constraints = query.constraints;
        const results: any[] = [];

        mockDbStore.forEach((doc, id) => {
            let match = true;
            for (const constraint of constraints) {
                if (doc[constraint.field] !== constraint.value) {
                    match = false;
                    break;
                }
            }
            if (match) {
                results.push({ id, data: () => doc });
            }
        });

        return {
            empty: results.length === 0,
            docs: results
        };
    },
    addDoc: async (collectionRef: any, data: any) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 50));
        const id = `mock-id-${addDocCounter++}`;
        mockDbStore.set(id, { ...data });
        return { id };
    },
    query: (ref: any, ...constraints: any[]) => ({ ref, constraints }),
    where: (field: string, op: string, value: any) => ({ field, op, value }),
    collection: (db: any, name: string) => ({ db, name })
}));

jest.mock('@/firebase/client', () => ({
    db: {} // Mock db object
}));

describe('Performance Benchmark', () => {
    beforeEach(() => {
        jest.resetModules();
        mockDbStore.clear();
        addDocCounter = 0;
    });

    test('checkAndMigrateData execution time', async () => {
        const { checkAndMigrateData } = require('./migrate-data');

        const start = performance.now();
        await checkAndMigrateData();
        const end = performance.now();

        console.log(`BENCHMARK: checkAndMigrateData took ${(end - start).toFixed(2)}ms`);
    });
});
