import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Member, Letter, FinanceTransaction, FilmWork, NewsArticle, Officer } from '../types';
import {
  INITIAL_USERS,
  INITIAL_MEMBERS,
  INITIAL_LETTERS,
  INITIAL_FINANCES,
  INITIAL_WORKS,
  INITIAL_NEWS,
} from '../data/initialData';
import { CINEMIND_OFFICERS } from '../data/structureData';

// Firestore collection names
export const FIRESTORE_COLLECTIONS = {
  MEMBERS: 'members',
  LETTERS: 'letters',
  FINANCES: 'finances',
  WORKS: 'works',
  NEWS: 'news',
  OFFICERS: 'officers',
} as const;

// Local storage keys for user authentication sessions
const AUTH_STORAGE_KEYS = {
  CURRENT_USER: 'cinemind_current_user',
  AUTH_TOKEN: 'cinemind_auth_token',
};

// Safe localStorage helpers for user session
function safeGetLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
}

function safeSetLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

export const StorageService = {
  // ==========================================
  // AUTH SESSION (Client-side token & user)
  // ==========================================
  getCurrentUser(): User {
    return safeGetLocal<User>(AUTH_STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  },

  setCurrentUser(user: User): void {
    safeSetLocal(AUTH_STORAGE_KEYS.CURRENT_USER, user);
  },

  getAuthToken(): string | null {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEYS.AUTH_TOKEN);
    } catch {
      return null;
    }
  },

  setAuthToken(token: string): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (e) {
      console.error('Error saving auth token', e);
    }
  },

  clearAuth(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_TOKEN);
    } catch (e) {
      console.error('Error clearing auth', e);
    }
  },

  getAvailableUsers(): User[] {
    return INITIAL_USERS;
  },

  // ==========================================
  // 1. KEUANGAN (FINANCES) - CRUD & REAL-TIME
  // ==========================================
  async getFinances(): Promise<FinanceTransaction[]> {
    try {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.FINANCES));
      if (snap.empty) {
        // Auto-seed initial data to Firestore if collection is empty
        await this.seedInitialCollection(FIRESTORE_COLLECTIONS.FINANCES, INITIAL_FINANCES);
        return INITIAL_FINANCES;
      }
      return snap.docs.map((d) => d.data() as FinanceTransaction);
    } catch (error) {
      console.error('Error fetching finances from Firestore:', error);
      return INITIAL_FINANCES;
    }
  },

  async saveFinance(tx: FinanceTransaction): Promise<void> {
    const docId = tx.id || `fin-${Date.now()}`;
    const payload = { ...tx, id: docId };
    const docRef = doc(db, FIRESTORE_COLLECTIONS.FINANCES, docId);
    await setDoc(docRef, payload, { merge: true });
  },

  async deleteFinance(id: string): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.FINANCES, id);
    await deleteDoc(docRef);
  },

  subscribeFinances(callback: (finances: FinanceTransaction[]) => void): () => void {
    const q = query(collection(db, FIRESTORE_COLLECTIONS.FINANCES));
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is still empty, seed and return initial
          this.seedInitialCollection(FIRESTORE_COLLECTIONS.FINANCES, INITIAL_FINANCES);
          callback(INITIAL_FINANCES);
          return;
        }
        const data = snapshot.docs.map((d) => d.data() as FinanceTransaction);
        // Sort by date descending
        data.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
        callback(data);
      },
      (error) => {
        console.error('Real-time listener error for Finances:', error);
        callback(INITIAL_FINANCES);
      }
    );
  },

  calculateBalance(transactions: FinanceTransaction[]): { totalIn: number; totalOut: number; currentBalance: number } {
    let totalIn = 0;
    let totalOut = 0;
    for (const t of transactions) {
      if (t.type === 'in') {
        totalIn += t.amount;
      } else {
        totalOut += t.amount;
      }
    }
    return {
      totalIn,
      totalOut,
      currentBalance: totalIn - totalOut,
    };
  },

  // ==========================================
  // 2. PERSURATAN (LETTERS) - CRUD & REAL-TIME
  // ==========================================
  async getLetters(): Promise<Letter[]> {
    try {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.LETTERS));
      if (snap.empty) {
        await this.seedInitialCollection(FIRESTORE_COLLECTIONS.LETTERS, INITIAL_LETTERS);
        return INITIAL_LETTERS;
      }
      return snap.docs.map((d) => d.data() as Letter);
    } catch (error) {
      console.error('Error fetching letters from Firestore:', error);
      return INITIAL_LETTERS;
    }
  },

  async saveLetter(letter: Letter): Promise<void> {
    const docId = letter.id || `let-${Date.now()}`;
    const payload = { ...letter, id: docId };
    const docRef = doc(db, FIRESTORE_COLLECTIONS.LETTERS, docId);
    await setDoc(docRef, payload, { merge: true });
  },

  async deleteLetter(id: string): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.LETTERS, id);
    await deleteDoc(docRef);
  },

  subscribeLetters(callback: (letters: Letter[]) => void): () => void {
    const q = query(collection(db, FIRESTORE_COLLECTIONS.LETTERS));
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          this.seedInitialCollection(FIRESTORE_COLLECTIONS.LETTERS, INITIAL_LETTERS);
          callback(INITIAL_LETTERS);
          return;
        }
        const data = snapshot.docs.map((d) => d.data() as Letter);
        data.sort((a, b) => new Date(b.letterDate).getTime() - new Date(a.letterDate).getTime());
        callback(data);
      },
      (error) => {
        console.error('Real-time listener error for Letters:', error);
        callback(INITIAL_LETTERS);
      }
    );
  },

  // ==========================================
  // 3. KEANGGOTAAN (MEMBERS) - CRUD & REAL-TIME
  // ==========================================
  async getMembers(): Promise<Member[]> {
    try {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.MEMBERS));
      if (snap.empty) {
        await this.seedInitialCollection(FIRESTORE_COLLECTIONS.MEMBERS, INITIAL_MEMBERS);
        return INITIAL_MEMBERS;
      }
      return snap.docs.map((d) => d.data() as Member);
    } catch (error) {
      console.error('Error fetching members from Firestore:', error);
      return INITIAL_MEMBERS;
    }
  },

  async saveMember(member: Member): Promise<void> {
    const docId = member.id || `m-${Date.now()}`;
    const payload = { ...member, id: docId };
    const docRef = doc(db, FIRESTORE_COLLECTIONS.MEMBERS, docId);
    await setDoc(docRef, payload, { merge: true });
  },

  async deleteMember(id: string): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.MEMBERS, id);
    await deleteDoc(docRef);
  },

  subscribeMembers(callback: (members: Member[]) => void): () => void {
    const q = query(collection(db, FIRESTORE_COLLECTIONS.MEMBERS));
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          this.seedInitialCollection(FIRESTORE_COLLECTIONS.MEMBERS, INITIAL_MEMBERS);
          callback(INITIAL_MEMBERS);
          return;
        }
        const data = snapshot.docs.map((d) => d.data() as Member);
        callback(data);
      },
      (error) => {
        console.error('Real-time listener error for Members:', error);
        callback(INITIAL_MEMBERS);
      }
    );
  },

  // ==========================================
  // 4. STRUKTUR & TUPOKSI (OFFICERS)
  // ==========================================
  async getOfficers(): Promise<Officer[]> {
    try {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.OFFICERS));
      if (snap.empty) {
        await this.seedInitialCollection(FIRESTORE_COLLECTIONS.OFFICERS, CINEMIND_OFFICERS);
        return CINEMIND_OFFICERS;
      }
      const data = snap.docs.map((d) => d.data() as Officer);
      data.sort((a, b) => a.level - b.level);
      return data;
    } catch (error) {
      console.error('Error fetching officers from Firestore:', error);
      return CINEMIND_OFFICERS;
    }
  },

  async saveOfficer(officer: Officer): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.OFFICERS, officer.id);
    await setDoc(docRef, officer, { merge: true });
  },

  async updateOfficerAvatar(officerId: string, avatarUrl: string): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.OFFICERS, officerId);
    await setDoc(docRef, { avatar: avatarUrl }, { merge: true });
  },

  subscribeOfficers(callback: (officers: Officer[]) => void): () => void {
    const q = query(collection(db, FIRESTORE_COLLECTIONS.OFFICERS));
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          this.seedInitialCollection(FIRESTORE_COLLECTIONS.OFFICERS, CINEMIND_OFFICERS);
          callback(CINEMIND_OFFICERS);
          return;
        }
        const data = snapshot.docs.map((d) => d.data() as Officer);
        data.sort((a, b) => a.level - b.level);
        callback(data);
      },
      (error) => {
        console.error('Real-time listener error for Officers:', error);
        callback(CINEMIND_OFFICERS);
      }
    );
  },

  // ==========================================
  // 5. CMS - FILM KARYA (WORKS)
  // ==========================================
  async getWorks(): Promise<FilmWork[]> {
    try {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.WORKS));
      if (snap.empty) {
        await this.seedInitialCollection(FIRESTORE_COLLECTIONS.WORKS, INITIAL_WORKS);
        return INITIAL_WORKS;
      }
      const data = snap.docs.map((d) => d.data() as FilmWork);
      data.sort((a, b) => {
        const timeA = a.createdAt || (a.year ? new Date(`${a.year}-01-01`).getTime() : 0);
        const timeB = b.createdAt || (b.year ? new Date(`${b.year}-01-01`).getTime() : 0);
        if (timeB !== timeA) return timeB - timeA;
        return (b.year || 0) - (a.year || 0);
      });
      return data;
    } catch (error) {
      console.error('Error fetching works from Firestore:', error);
      return INITIAL_WORKS;
    }
  },

  async saveWork(work: FilmWork): Promise<void> {
    const docId = work.id || `film-${Date.now()}`;
    const payload: FilmWork = { 
      ...work, 
      id: docId,
      createdAt: work.createdAt || Date.now() 
    };
    const docRef = doc(db, FIRESTORE_COLLECTIONS.WORKS, docId);
    await setDoc(docRef, payload, { merge: true });
  },

  async deleteWork(id: string): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.WORKS, id);
    await deleteDoc(docRef);
  },

  subscribeWorks(callback: (works: FilmWork[]) => void): () => void {
    const q = query(collection(db, FIRESTORE_COLLECTIONS.WORKS));
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          this.seedInitialCollection(FIRESTORE_COLLECTIONS.WORKS, INITIAL_WORKS);
          callback(INITIAL_WORKS);
          return;
        }
        const data = snapshot.docs.map((d) => d.data() as FilmWork);
        // Urutkan karya film: unggahan terbaru muncul di bagian paling awal / pertama
        data.sort((a, b) => {
          const timeA = a.createdAt || (a.year ? new Date(`${a.year}-01-01`).getTime() : 0);
          const timeB = b.createdAt || (b.year ? new Date(`${b.year}-01-01`).getTime() : 0);
          if (timeB !== timeA) return timeB - timeA;
          return (b.year || 0) - (a.year || 0);
        });
        callback(data);
      },
      (error) => {
        console.error('Real-time listener error for Works:', error);
        callback(INITIAL_WORKS);
      }
    );
  },

  // ==========================================
  // 6. CMS - WARTA BERITA (NEWS)
  // ==========================================
  async getNews(): Promise<NewsArticle[]> {
    try {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.NEWS));
      if (snap.empty) {
        await this.seedInitialCollection(FIRESTORE_COLLECTIONS.NEWS, INITIAL_NEWS);
        return INITIAL_NEWS;
      }
      const data = snap.docs.map((d) => d.data() as NewsArticle);
      data.sort((a, b) => {
        const timeA = a.createdAt || (a.publishDate ? new Date(a.publishDate).getTime() : 0);
        const timeB = b.createdAt || (b.publishDate ? new Date(b.publishDate).getTime() : 0);
        if (timeB !== timeA) return timeB - timeA;
        const dateA = new Date(a.publishDate).getTime() || 0;
        const dateB = new Date(b.publishDate).getTime() || 0;
        return dateB - dateA;
      });
      return data;
    } catch (error) {
      console.error('Error fetching news from Firestore:', error);
      return INITIAL_NEWS;
    }
  },

  async saveNews(newsItem: NewsArticle): Promise<void> {
    const docId = newsItem.id || `news-${Date.now()}`;
    const payload: NewsArticle = { 
      ...newsItem, 
      id: docId,
      createdAt: newsItem.createdAt || Date.now() 
    };
    const docRef = doc(db, FIRESTORE_COLLECTIONS.NEWS, docId);
    await setDoc(docRef, payload, { merge: true });
  },

  async deleteNews(id: string): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.NEWS, id);
    await deleteDoc(docRef);
  },

  subscribeNews(callback: (news: NewsArticle[]) => void): () => void {
    const q = query(collection(db, FIRESTORE_COLLECTIONS.NEWS));
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          this.seedInitialCollection(FIRESTORE_COLLECTIONS.NEWS, INITIAL_NEWS);
          callback(INITIAL_NEWS);
          return;
        }
        const data = snapshot.docs.map((d) => d.data() as NewsArticle);
        // Urutkan berita: warta terbaru muncul di bagian paling awal / pertama
        data.sort((a, b) => {
          const timeA = a.createdAt || (a.publishDate ? new Date(a.publishDate).getTime() : 0);
          const timeB = b.createdAt || (b.publishDate ? new Date(b.publishDate).getTime() : 0);
          if (timeB !== timeA) return timeB - timeA;
          const dateA = new Date(a.publishDate).getTime() || 0;
          const dateB = new Date(b.publishDate).getTime() || 0;
          return dateB - dateA;
        });
        callback(data);
      },
      (error) => {
        console.error('Real-time listener error for News:', error);
        callback(INITIAL_NEWS);
      }
    );
  },

  // ==========================================
  // HELPER: Auto-seed initial dataset to Firestore
  // ==========================================
  async seedInitialCollection<T extends { id: string }>(collectionName: string, items: T[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      for (const item of items) {
        const docRef = doc(db, collectionName, item.id);
        batch.set(docRef, item, { merge: true });
      }
      await batch.commit();
      console.log(`[Firebase] Berhasil menginisialisasi ${items.length} dokumen awal ke koleksi '${collectionName}'`);
    } catch (e) {
      console.warn(`[Firebase] Gagal seed koleksi '${collectionName}':`, e);
    }
  },
};
