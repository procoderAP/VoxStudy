import { CourseDocument } from '../types';

const STORAGE_KEY = 'voxstudy_user_documents';
const LAST_ACTIVE_DOC_KEY = 'voxstudy_last_active_doc_id';
const IDB_NAME = 'voxstudy_db';
const IDB_STORE = 'documents';
const IDB_VERSION = 1;

class StorageService {
  private inMemoryDocs: CourseDocument[] = [];
  private idbPromise: Promise<IDBDatabase | null> | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    // 1. First, load whatever is available in localStorage into memory immediately
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.inMemoryDocs = JSON.parse(stored);
      }
    } catch {
      this.inMemoryDocs = [];
    }

    // 2. Open IndexedDB for large-scale permanent storage
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.idbPromise = new Promise((resolve) => {
        try {
          const req = indexedDB.open(IDB_NAME, IDB_VERSION);
          req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(IDB_STORE)) {
              db.createObjectStore(IDB_STORE, { keyPath: 'id' });
            }
          };
          req.onsuccess = () => {
            const db = req.result;
            // Sync any existing IDB documents into inMemoryDocs
            this.syncFromIdb(db);
            resolve(db);
          };
          req.onerror = () => {
            console.warn('IndexedDB could not be opened, using localStorage fallback');
            resolve(null);
          };
        } catch {
          resolve(null);
        }
      });
    }
  }

  private async syncFromIdb(db: IDBDatabase) {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const idbDocs = req.result as CourseDocument[];
        if (idbDocs && idbDocs.length > 0) {
          // Merge with inMemoryDocs (prefer IDB if newer)
          const mergedMap = new Map<string, CourseDocument>();
          this.inMemoryDocs.forEach(d => mergedMap.set(d.id, d));
          idbDocs.forEach(d => mergedMap.set(d.id, d));
          this.inMemoryDocs = Array.from(mergedMap.values());
          // Keep localStorage up to date with metadata
          this.syncToLocalStorage();
        }
        this.isInitialized = true;
      };
    } catch (e) {
      console.warn('Could not sync from IDB:', e);
    }
  }

  private syncToLocalStorage() {
    try {
      // Save full docs or lightweight metadata if quota exceeded
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.inMemoryDocs));
    } catch (err) {
      // Quota exceeded: trim rawText from oldest items in localStorage cache
      try {
        const lightDocs = this.inMemoryDocs.map(d => ({
          ...d,
          rawText: d.rawText.slice(0, 5000),
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lightDocs));
      } catch {
        // Ignore
      }
    }
  }

  // Save or update a document permanently in memory, localStorage, and IndexedDB
  public saveDocument(doc: CourseDocument): void {
    const existingIdx = this.inMemoryDocs.findIndex(d => d.id === doc.id);
    if (existingIdx >= 0) {
      this.inMemoryDocs[existingIdx] = doc;
    } else {
      this.inMemoryDocs.unshift(doc);
    }

    this.syncToLocalStorage();
    this.setLastActiveDocId(doc.id);

    // Persist full-resolution document to IndexedDB asynchronously
    if (this.idbPromise) {
      this.idbPromise.then((db) => {
        if (!db) return;
        try {
          const tx = db.transaction(IDB_STORE, 'readwrite');
          const store = tx.objectStore(IDB_STORE);
          store.put(doc);
        } catch (e) {
          console.warn('IDB write failed:', e);
        }
      });
    }
  }

  // Get all user saved documents synchronously from memory
  public getAllDocuments(): CourseDocument[] {
    return this.inMemoryDocs;
  }

  // Get a specific document by ID
  public getDocumentById(id: string): CourseDocument | null {
    return this.inMemoryDocs.find(d => d.id === id) || null;
  }

  // Delete a document
  public deleteDocument(id: string): void {
    this.inMemoryDocs = this.inMemoryDocs.filter(d => d.id !== id);
    this.syncToLocalStorage();

    if (this.getLastActiveDocId() === id) {
      localStorage.removeItem(LAST_ACTIVE_DOC_KEY);
    }

    if (this.idbPromise) {
      this.idbPromise.then((db) => {
        if (!db) return;
        try {
          const tx = db.transaction(IDB_STORE, 'readwrite');
          const store = tx.objectStore(IDB_STORE);
          store.delete(id);
        } catch (e) {
          console.warn('IDB delete failed:', e);
        }
      });
    }
  }

  // Track last active document
  public setLastActiveDocId(id: string): void {
    try {
      localStorage.setItem(LAST_ACTIVE_DOC_KEY, id);
    } catch {
      // Ignore
    }
  }

  public getLastActiveDocId(): string | null {
    try {
      return localStorage.getItem(LAST_ACTIVE_DOC_KEY);
    } catch {
      return null;
    }
  }
}

export const storageService = new StorageService();
