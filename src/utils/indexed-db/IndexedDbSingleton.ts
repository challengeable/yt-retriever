import { INDEXED_DB_CONFIG } from "../Constants";

class IndexedDbSingleton {
    private static instance: IndexedDbSingleton | null = null;
    private dbName: string;
    private version: number;
    private db: IDBDatabase | null = null;
  
    private constructor(dbName: string, version: number) {
      this.dbName = dbName;
      this.version = version;
    }
  
    public static getInstance(): IndexedDbSingleton {
      if (!IndexedDbSingleton.instance) {
        IndexedDbSingleton.instance = new IndexedDbSingleton(INDEXED_DB_CONFIG.DB_NAME, INDEXED_DB_CONFIG.VERSION);
      }
      return IndexedDbSingleton.instance;
    }
  
    private async openDatabase(storeName: string): Promise<IDBDatabase> {
      if (this.db) {
        return this.db;
      }
  
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);
  
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        };
  
        request.onsuccess = () => {
          this.db = request.result;
          resolve(this.db);
        };
  
        request.onerror = () => reject(request.error);
      });
    }
  
    public async insert<T>(storeName: string, data: T): Promise<void> {
      const db = await this.openDatabase(storeName);
  
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
  
        const request = store.put(data);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  
    public async read<T>(storeName:string, id: IDBValidKey): Promise<T | undefined> {
      const db = await this.openDatabase(storeName);
  
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
  
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result as T | undefined);
        request.onerror = () => reject(request.error);
      });
    }
  }
  
  export default IndexedDbSingleton;
  