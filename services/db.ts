
import { Quiz } from '../types';

const DB_NAME = 'QuizLiveDB';
const DB_VERSION = 1;
const STORE_QUIZZES = 'quizzes';

class IndexedDBService {
    private db: IDBDatabase | null = null;

    async init(): Promise<IDBDatabase> {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(request.result);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_QUIZZES)) {
                    db.createObjectStore(STORE_QUIZZES, { keyPath: 'id' });
                }
            };
        });
    }

    async getAllQuizzes(): Promise<Quiz[]> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_QUIZZES, 'readonly');
            const store = transaction.objectStore(STORE_QUIZZES);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async getQuiz(id: string): Promise<Quiz | undefined> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_QUIZZES, 'readonly');
            const store = transaction.objectStore(STORE_QUIZZES);
            const request = store.get(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async saveQuiz(quiz: Quiz): Promise<void> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_QUIZZES, 'readwrite');
            const store = transaction.objectStore(STORE_QUIZZES);
            const request = store.put(quiz);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async deleteQuiz(id: string): Promise<void> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_QUIZZES, 'readwrite');
            const store = transaction.objectStore(STORE_QUIZZES);
            const request = store.delete(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
}

export const dbService = new IndexedDBService();
