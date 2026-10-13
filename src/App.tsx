import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { User, Member, Letter, FinanceTransaction, FilmWork, NewsArticle, Officer } from './types';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Public Components (Exclusively Public Content)
import { PublicNavbar } from './components/public/PublicNavbar';
import { PublicHero } from './components/public/PublicHero';
import { PublicFilmShowcase } from './components/public/PublicFilmShowcase';
import { FilmDetailModal } from './components/public/FilmDetailModal';
import { PublicNewsSection } from './components/public/PublicNewsSection';
import { NewsDetailModal } from './components/public/NewsDetailModal';
import { PublicStructureSection } from './components/public/PublicStructureSection';
import { PublicAboutSection } from './components/public/PublicAboutSection';
import { PublicFooter } from './components/public/PublicFooter';

// SIM Components (Protected Internal Admin)
import { SimLayout } from './components/sim/SimLayout';
import { SimDashboard } from './components/sim/SimDashboard';
import { SimLetterGenerator } from './components/sim/SimLetterGenerator';
import { SimLetterArchive } from './components/sim/SimLetterArchive';
import { SimFinanceLedger } from './components/sim/SimFinanceLedger';
import { SimMemberDatabase } from './components/sim/SimMemberDatabase';
import { SimStructureModule } from './components/sim/SimStructureModule';
import { SimCmsModule } from './components/sim/SimCmsModule';
import { SimAccessDenied } from './components/sim/SimAccessDenied';

// Auth & Security Components
import { CloudflareSecurityCheck } from './components/auth/CloudflareSecurityCheck';
import { LoginPage } from './components/auth/LoginPage';
import { ChangePasswordPage } from './components/auth/ChangePasswordPage';

function CinemindAppContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Navigation Mode:
  // - 'public': Default public-facing website (NO administrative features exposed)
  // - 'cloudflare': Cloudflare Turnstile automated security inspection
  // - 'login': Protected Admin Login Page with Google reCAPTCHA & RBAC
  // - 'change-password': Force Change Password on HTTP 428 Precondition Required
  // - 'sim': Restricted Admin Dashboard
  const [activeMode, setActiveMode] = useState<'public' | 'cloudflare' | 'login' | 'change-password' | 'sim'>('public');
  const [simView, setSimView] = useState<string>('dashboard');

  // Authenticated State & Tokens
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser());
  const [authToken, setAuthToken] = useState<string | null>(() => StorageService.getAuthToken());
  const availableUsers = StorageService.getAvailableUsers();

  // Force Change Password State (HTTP 428 Precondition Required)
  const [pendingChangePasswordUser, setPendingChangePasswordUser] = useState<User | null>(null);
  const [temporaryToken, setTemporaryToken] = useState<string | null>(null);

  // Data Collections (Synchronized with Firebase Firestore in Real-time)
  const [members, setMembers] = useState<Member[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [finances, setFinances] = useState<FinanceTransaction[]>([]);
  const [works, setWorks] = useState<FilmWork[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);

  // Setup Real-time Firestore Listeners on Mount
  useEffect(() => {
    const unsubFinances = StorageService.subscribeFinances((data) => setFinances(data));
    const unsubLetters = StorageService.subscribeLetters((data) => setLetters(data));
    const unsubMembers = StorageService.subscribeMembers((data) => setMembers(data));
    const unsubWorks = StorageService.subscribeWorks((data) => setWorks(data));
    const unsubNews = StorageService.subscribeNews((data) => setNews(data));
    const unsubOfficers = StorageService.subscribeOfficers((data) => setOfficers(data));

    return () => {
      unsubFinances();
      unsubLetters();
      unsubMembers();
      unsubWorks();
      unsubNews();
      unsubOfficers();
    };
  }, []);

  // Public Modals
  const [selectedFilmForModal, setSelectedFilmForModal] = useState<FilmWork | null>(null);
  const [selectedNewsForModal, setSelectedNewsForModal] = useState<NewsArticle | null>(null);

  // STRICT ROUTING & SECRET GATEWAY LOGIC
  // Admin portal is strictly hidden from public routing and indexing to prevent brute-force attacks.
  // Access is triggered ONLY via secret URL hash (#admin or #/admin), keyboard shortcut (Ctrl+Shift+A), or discreet lock.
  useEffect(() => {
    const handleCheckHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin' || hash === '#/admin') {
        if (authToken && currentUser) {
          setActiveMode('sim');
        } else {
          setActiveMode('cloudflare');
        }
      }
    };

    handleCheckHash();
    window.addEventListener('hashchange', handleCheckHash);

    // Keyboard shortcut: Ctrl + Shift + A (or Cmd + Shift + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (authToken && currentUser) {
          setActiveMode('sim');
        } else {
          setActiveMode('cloudflare');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleCheckHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [authToken, currentUser]);

  const handleOpenSecretAdmin = () => {
    if (authToken && currentUser) {
      setActiveMode('sim');
    } else {
      setActiveMode('cloudflare');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth Callbacks
  const handleLoginSuccess = (user: User, token: string) => {
    StorageService.setAuthToken(token);
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
    setAuthToken(token);
    setActiveMode('sim');
    setSimView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequirePasswordChange = (pendingUser: User, tempToken: string) => {
    setPendingChangePasswordUser(pendingUser);
    setTemporaryToken(tempToken);
    setActiveMode('change-password');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePasswordChangedSuccess = (user: User, token: string) => {
    StorageService.setAuthToken(token);
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
    setAuthToken(token);
    setPendingChangePasswordUser(null);
    setTemporaryToken(null);
    setActiveMode('sim');
    setSimView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    StorageService.clearAuth();
    setAuthToken(null);
    setActiveMode('public');
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchUser = (newUser: User) => {
    setCurrentUser(newUser);
    StorageService.setCurrentUser(newUser);
  };

  // Mutation handlers syncing to Firestore
  const handleSaveMember = async (member: Member) => {
    await StorageService.saveMember(member);
  };

  const handleDeleteMember = async (id: string) => {
    await StorageService.deleteMember(id);
  };

  const handleSaveLetter = async (letter: Letter) => {
    await StorageService.saveLetter(letter);
  };

  const handleDeleteLetter = async (id: string) => {
    await StorageService.deleteLetter(id);
  };

  const handleSaveFinance = async (tx: FinanceTransaction) => {
    await StorageService.saveFinance(tx);
  };

  const handleDeleteFinance = async (id: string) => {
    await StorageService.deleteFinance(id);
  };

  const handleSaveWork = async (work: FilmWork) => {
    await StorageService.saveWork(work);
  };

  const handleDeleteWork = async (id: string) => {
    await StorageService.deleteWork(id);
  };

  const handleSaveNews = async (newsItem: NewsArticle) => {
    await StorageService.saveNews(newsItem);
  };

  const handleDeleteNews = async (id: string) => {
    await StorageService.deleteNews(id);
  };

  const handleUpdateOfficerAvatar = async (officerId: string, newAvatarUrl: string) => {
    await StorageService.updateOfficerAvatar(officerId, newAvatarUrl);
    if (currentUser) {
      const targetOfficer = officers.find((o) => o.id === officerId);
      if (targetOfficer && currentUser.nim && targetOfficer.nim === currentUser.nim) {
        const updatedUser = { ...currentUser, avatar: newAvatarUrl };
        StorageService.setCurrentUser(updatedUser);
        setCurrentUser(updatedUser);
      }
    }
  };

  const balanceData = StorageService.calculateBalance(finances);

  // Urutkan karya film & warta berita: unggahan/rilis terbaru muncul di bagian pertama (menggeser unggahan sebelumnya)
  const sortedWorks = [...works].sort((a, b) => {
    const timeA = a.createdAt || (a.year ? new Date(`${a.year}-01-01`).getTime() : 0);
    const timeB = b.createdAt || (b.year ? new Date(`${b.year}-01-01`).getTime() : 0);
    if (timeB !== timeA) return timeB - timeA;
    return (b.year || 0) - (a.year || 0);
  });

  const sortedNews = [...news].sort((a, b) => {
    const timeA = a.createdAt || (a.publishDate ? new Date(a.publishDate).getTime() : 0);
    const timeB = b.createdAt || (b.publishDate ? new Date(b.publishDate).getTime() : 0);
    if (timeB !== timeA) return timeB - timeA;
    const dateA = new Date(a.publishDate).getTime() || 0;
    const dateB = new Date(b.publishDate).getTime() || 0;
    return dateB - dateA;
  });

  const featuredFilm = sortedWorks.find((w) => w.featured) || sortedWorks[0] || null;

  // RBAC Permission logic for SIM dashboard views
  const renderSimContent = () => {
    if (simView === 'dashboard') {
      return (
        <SimDashboard
          currentUser={currentUser}
          members={members}
          letters={letters}
          finances={finances}
          works={sortedWorks}
          balanceData={balanceData}
          onNavigate={(target) => setSimView(target)}
          onOpenLetter={() => setSimView('surat-arsip')}
        />
      );
    }

    if (simView === 'surat-buat') {
      if (currentUser.role !== 'bph_inti' && currentUser.role !== 'bph_sekretaris') {
        return (
          <SimAccessDenied
            currentRole={currentUser.role}
            requiredRoleDescription="Admin Persuratan (bph_sekretaris) atau Superadmin (bph_inti)"
            onNavigateHome={() => setSimView('dashboard')}
          />
        );
      }
      return (
        <SimLetterGenerator
          existingLetters={letters}
          onSaveLetter={handleSaveLetter}
          onNavigateToArchive={() => setSimView('surat-arsip')}
        />
      );
    }

    if (simView === 'surat-arsip') {
      if (currentUser.role !== 'bph_inti' && currentUser.role !== 'bph_sekretaris') {
        return (
          <SimAccessDenied
            currentRole={currentUser.role}
            requiredRoleDescription="Admin Persuratan (bph_sekretaris) atau Superadmin (bph_inti)"
            onNavigateHome={() => setSimView('dashboard')}
          />
        );
      }
      return (
        <SimLetterArchive
          letters={letters}
          onNavigateToCreate={() => setSimView('surat-buat')}
          onDeleteLetter={handleDeleteLetter}
        />
      );
    }

    if (simView === 'keuangan') {
      if (currentUser.role !== 'bph_inti' && currentUser.role !== 'bph_bendahara') {
        return (
          <SimAccessDenied
            currentRole={currentUser.role}
            requiredRoleDescription="Admin Keuangan (bph_bendahara) atau Superadmin (bph_inti)"
            onNavigateHome={() => setSimView('dashboard')}
          />
        );
      }
      return (
        <SimFinanceLedger
          finances={finances}
          balanceData={balanceData}
          onSaveFinance={handleSaveFinance}
          onDeleteFinance={handleDeleteFinance}
        />
      );
    }

    if (simView === 'anggota') {
      if (currentUser.role === 'admin_medinfo') {
        return (
          <SimAccessDenied
            currentRole={currentUser.role}
            requiredRoleDescription="Pengurus Inti (bph_inti, bph_sekretaris, atau bph_bendahara)"
            onNavigateHome={() => setSimView('dashboard')}
          />
        );
      }
      return (
        <SimMemberDatabase
          members={members}
          onSaveMember={handleSaveMember}
          onDeleteMember={handleDeleteMember}
        />
      );
    }

    if (simView === 'struktur') {
      return (
        <SimStructureModule
          officers={officers}
          onUpdateOfficerAvatar={handleUpdateOfficerAvatar}
        />
      );
    }

    if (simView === 'cms') {
      if (currentUser.role !== 'bph_inti' && currentUser.role !== 'admin_medinfo') {
        return (
          <SimAccessDenied
            currentRole={currentUser.role}
            requiredRoleDescription="Divisi Media & Informasi (admin_medinfo) atau Superadmin (bph_inti)"
            onNavigateHome={() => setSimView('dashboard')}
          />
        );
      }
      return (
        <SimCmsModule
          works={sortedWorks}
          news={sortedNews}
          onSaveWork={handleSaveWork}
          onDeleteWork={handleDeleteWork}
          onSaveNews={handleSaveNews}
          onDeleteNews={handleDeleteNews}
        />
      );
    }

    return null;
  };

  // 1. CLOUDFLARE TURNSTILE AUTOMATED SECURITY LAYER
  if (activeMode === 'cloudflare') {
    return (
      <CloudflareSecurityCheck
        onVerified={() => setActiveMode('login')}
        onCancel={() => {
          setActiveMode('public');
          if (window.location.hash) {
            history.replaceState(null, '', window.location.pathname);
          }
        }}
      />
    );
  }

  // 2. PROTECTED ADMIN LOGIN PAGE (Google reCAPTCHA + RBAC)
  if (activeMode === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onRequirePasswordChange={handleRequirePasswordChange}
        onReturnToPublic={() => {
          setActiveMode('public');
          if (window.location.hash) {
            history.replaceState(null, '', window.location.pathname);
          }
        }}
      />
    );
  }

  // 3. FORCE CHANGE PASSWORD (HTTP 428 Precondition Required)
  if (activeMode === 'change-password') {
    if (!pendingChangePasswordUser || !temporaryToken) {
      return (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onRequirePasswordChange={handleRequirePasswordChange}
          onReturnToPublic={() => {
            setActiveMode('public');
            if (window.location.hash) {
              history.replaceState(null, '', window.location.pathname);
            }
          }}
        />
      );
    }
    return (
      <ChangePasswordPage
        pendingUser={pendingChangePasswordUser}
        temporaryToken={temporaryToken}
        onPasswordChangedSuccess={handlePasswordChangedSuccess}
        onCancelToLogin={() => setActiveMode('login')}
      />
    );
  }

  // 4. PROTECTED ADMIN DASHBOARD (SIM) LAYOUT WITH RESTRICTED ACCESS ROUTING
  if (activeMode === 'sim') {
    // Access control check: Unauthenticated access forbidden
    if (!authToken || !currentUser) {
      return (
        <CloudflareSecurityCheck
          onVerified={() => setActiveMode('login')}
          onCancel={() => setActiveMode('public')}
        />
      );
    }

    return (
      <SimLayout
        currentUser={currentUser}
        availableUsers={availableUsers}
        currentView={simView}
        onNavigate={(view) => {
          setSimView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSwitchUser={handleSwitchUser}
        onReturnToPublic={handleLogout}
      >
        {renderSimContent()}
      </SimLayout>
    );
  }

  // 5. DEFAULT: PURELY PUBLIC WEBSITE (NO ADMIN FEATURES EXPOSED)
  return (
    <div className={`min-h-screen transition-colors duration-300 font-body selection:bg-[#E50914] selection:text-white ${
      isDark ? 'bg-[#0A0A0A] text-white' : 'bg-[#F8F9FA] text-slate-900'
    }`}>
      <PublicNavbar />

      <main>
        <PublicHero
          featuredFilm={featuredFilm}
          onWatchFilm={(film) => setSelectedFilmForModal(film)}
          onExploreFilms={() => {
            const el = document.getElementById('karya');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <PublicFilmShowcase
          films={sortedWorks}
          onSelectFilm={(film) => setSelectedFilmForModal(film)}
        />

        <PublicNewsSection
          news={sortedNews}
          onSelectNews={(article) => setSelectedNewsForModal(article)}
        />

        <PublicStructureSection officers={officers} />

        <PublicAboutSection />
      </main>

      <PublicFooter onSecretAdminTrigger={handleOpenSecretAdmin} />

      {/* Modals for Public Experience */}
      <FilmDetailModal
        film={selectedFilmForModal}
        onClose={() => setSelectedFilmForModal(null)}
      />

      <NewsDetailModal
        article={selectedNewsForModal}
        onClose={() => setSelectedNewsForModal(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CinemindAppContent />
    </ThemeProvider>
  );
}
