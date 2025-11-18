
/**
 * Test for migrate-data.ts
 */

// --- Test Setup ---

// 1. In-memory store to act as our mock Firestore database
const mockDbStore = new Map<string, any>();
let addDocCounter = 0;

// 2. Mock dependencies
jest.mock('firebase/firestore', () => ({
    getDocs: async (query: any) => {
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


// --- Test Execution ---
describe('migrateDataToFirestore', () => {
    beforeEach(() => {
        jest.resetModules();
        mockDbStore.clear();
        addDocCounter = 0;
    });

    test('should not add photos with duplicate src URLs', async () => {
        const { migrateDataToFirestore } = require('./migrate-data');

        console.log("Starting test to identify duplicate 'src' bug...");
        await migrateDataToFirestore();
        console.log(`Migration complete. Total documents in mock DB: ${mockDbStore.size}`);

        // The original data has 15 items, with one duplicate src.
        // This test should FAIL before the fix (it will find 15 docs)
        // and PASS after the fix (it will find 14 docs).
        const expectedDocsWithoutDuplicates = 14;
        expect(mockDbStore.size).toBe(expectedDocsWithoutDuplicates);
    });
});
