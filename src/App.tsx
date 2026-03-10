/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  BookOpen, 
  Image as ImageIcon, 
  User, 
  Mail, 
  LogOut, 
  Plus, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Star,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, googleProvider } from './services/firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';

// --- Types ---
type Page = 'home' | 'courses' | 'gallery' | 'member' | 'contact';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  category: string;
  imageUrl: string;
  description: string;
  createdAt: number;
  createdByName: string;
}

// --- Components ---

const Navbar = ({ currentPage, setCurrentPage, user, onLogin, onLogout }: { 
  currentPage: Page, 
  setCurrentPage: (p: Page) => void,
  user: any,
  onLogin: () => void,
  onLogout: () => void
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: '首頁', icon: Palette },
    { id: 'courses', label: '課程資訊', icon: BookOpen },
    { id: 'gallery', label: '作品畫廊', icon: ImageIcon },
    { id: 'member', label: '會員中心', icon: User },
    { id: 'contact', label: '聯絡我們', icon: Mail },
  ];

  const handleNavClick = (id: Page) => {
    setCurrentPage(id);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-bg/80 border-b border-line">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => handleNavClick('home')}>
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-linear-to-br from-accent to-[#ebbc8d] text-white grid place-items-center shadow-soft font-bold text-base md:text-lg">
            妮
          </div>
          <div className="hidden sm:block">
            <div className="font-extrabold tracking-tight text-ink text-sm md:text-base">妮妮美術室</div>
            <div className="text-[9px] md:text-[10px] font-semibold text-muted uppercase tracking-wider">NiNi Art Studio</div>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as Page)}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                currentPage === item.id 
                  ? 'bg-accent/15 text-accent-deep' 
                  : 'text-muted hover:bg-accent/10 hover:text-accent-deep'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden sm:block">
            {user ? (
              <button 
                onClick={onLogout}
                className="px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-white border border-line text-ink font-bold text-xs md:text-sm hover:-translate-y-0.5 transition-all flex items-center gap-2 shadow-sm"
              >
                <LogOut size={14} />
                登出
              </button>
            ) : (
              <button 
                onClick={onLogin}
                className="px-5 md:px-6 py-2 md:py-2.5 rounded-full bg-accent text-white font-bold text-xs md:text-sm hover:-translate-y-0.5 transition-all shadow-md shadow-accent/20"
              >
                Google 登入
              </button>
            )}
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white border border-line text-ink hover:bg-stone-50 transition-all"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-line overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as Page)}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${
                    currentPage === item.id 
                      ? 'bg-accent/15 text-accent-deep' 
                      : 'text-muted hover:bg-accent/5'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
              <div className="pt-4 mt-2 border-t border-line sm:hidden">
                {user ? (
                  <button 
                    onClick={() => { onLogout(); setIsMenuOpen(false); }}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-line text-ink font-bold text-sm flex items-center gap-3"
                  >
                    <LogOut size={18} />
                    登出
                  </button>
                ) : (
                  <button 
                    onClick={() => { onLogin(); setIsMenuOpen(false); }}
                    className="w-full px-4 py-3 rounded-xl bg-accent text-white font-bold text-sm flex items-center gap-3 justify-center"
                  >
                    Google 登入
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const HomePage = ({ onNavigate }: { onNavigate: (p: Page) => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="container mx-auto px-4 py-8 md:py-12"
  >
    <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 md:gap-8 items-stretch">
      <div className="bg-panel border border-white/70 rounded-2xl shadow-soft p-6 md:p-10 relative overflow-hidden flex flex-col justify-center min-h-[360px] md:min-h-[420px]">
        <div className="absolute -right-16 -bottom-16 w-48 h-48 md:w-64 md:h-64 rounded-full bg-radial from-accent/20 to-transparent" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-line text-muted text-[10px] md:text-xs font-extrabold mb-4 md:mb-6 w-fit">
          🎨 妮妮美術室官方網站
        </div>
        
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] mb-4 md:mb-6 text-ink">
          專注美術教學、<br />作品展示與學員管理。
        </h1>
        
        <p className="text-muted text-base md:text-lg mb-6 md:mb-8 max-w-2xl leading-relaxed">
          我們致力於培養孩子與學員的觀察力、創造力與表現能力，透過系統化課程與作品展示，建立有溫度的學習空間。
        </p>
        
        <div className="flex gap-3 md:gap-4 flex-wrap mb-8 md:mb-10">
          <button 
            onClick={() => onNavigate('courses')}
            className="flex-1 sm:flex-none px-6 md:px-8 py-3 md:py-3.5 rounded-full bg-accent text-white font-black text-sm hover:-translate-y-0.5 transition-all shadow-lg shadow-accent/25 flex items-center justify-center gap-2"
          >
            查看課程 <ChevronRight size={18} />
          </button>
          <button 
            onClick={() => onNavigate('gallery')}
            className="flex-1 sm:flex-none px-6 md:px-8 py-3 md:py-3.5 rounded-full bg-white border border-line text-ink font-black text-sm hover:-translate-y-0.5 transition-all shadow-sm flex items-center justify-center"
          >
            前往畫廊
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {[
            { val: '5', label: '獨立頁面' },
            { val: 'Google', label: '會員登入' },
            { val: 'Gallery', label: '作品展示' },
          ].map((s, i) => (
            <div key={i} className="p-4 md:p-5 rounded-2xl bg-white/80 border border-line flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2">
              <div className="text-xl md:text-2xl font-black text-ink">{s.val}</div>
              <div className="text-[10px] md:text-xs font-bold text-muted uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-panel border border-white/70 rounded-2xl shadow-soft p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-black mb-4 md:mb-6 flex items-center gap-2">
            <Star className="text-accent" size={20} fill="currentColor" />
            網站核心功能
          </h3>
          <div className="grid gap-3">
            {[
              '首頁介紹與招生形象',
              '課程頁獨立顯示，不跟其他內容混在一起',
              '畫廊頁專門展示學員與畫室作品',
              '會員中心登入後可新增作品',
            ].map((f, i) => (
              <div key={i} className="p-3 md:p-4 bg-white/75 border border-line rounded-xl text-muted font-bold text-xs md:text-sm">
                {f}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-panel border border-white/70 rounded-2xl shadow-soft p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-black mb-3 md:mb-4">適合用途</h3>
          <p className="text-muted text-sm md:text-base leading-relaxed font-medium">
            可用於兒童繪畫班、素描班、水彩班、比賽作品展示、招生與家長查看學習成果。
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);

const CoursesPage = () => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="container mx-auto px-4 py-8 md:py-12"
  >
    <div className="mb-8 md:mb-12">
      <h2 className="text-2xl md:text-3xl font-black mb-3 md:mb-4">課程資訊</h2>
      <p className="text-muted max-w-3xl text-base md:text-lg">
        這一頁專門放課程，不和首頁、畫廊混在一起。我們提供多元的美術訓練，適合不同年齡層的學員。
      </p>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { 
          title: '兒童創意繪畫班', 
          desc: '以主題引導、色彩表現、媒材探索與想像力訓練為核心，適合建立美感與基礎創作能力。',
          tags: ['適合 5–10 歲', '創意表達']
        },
        { 
          title: '素描基礎班', 
          desc: '從比例、結構、明暗、質感與物體觀察開始，循序建立穩定的基礎造型能力。',
          tags: ['國小高年級以上', '基礎訓練']
        },
        { 
          title: '水彩與插畫班', 
          desc: '練習色彩搭配、構圖安排與畫面完整度，讓學員逐步形成自己的創作風格。',
          tags: ['進階創作', '色彩表現']
        },
      ].map((c, i) => (
        <div key={i} className="bg-panel border border-white/70 rounded-2xl shadow-soft p-6 md:p-8 hover:-translate-y-1 transition-all">
          <h3 className="text-lg md:text-xl font-black mb-3 md:mb-4">{c.title}</h3>
          <p className="text-muted text-sm md:text-base mb-6 leading-relaxed">{c.desc}</p>
          <div className="flex flex-wrap gap-2">
            {c.tags.map((t, j) => (
              <span key={j} className="px-3 py-1.5 rounded-full bg-accent/10 text-accent-deep text-[10px] md:text-xs font-black">
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

const GalleryPage = ({ artworks, onReload }: { artworks: Artwork[], onReload: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    className="container mx-auto px-4 py-8 md:py-12"
  >
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12">
      <div>
        <h2 className="text-2xl md:text-3xl font-black mb-3 md:mb-4">作品畫廊</h2>
        <p className="text-muted max-w-2xl text-base md:text-lg">
          這一頁只顯示畫廊內容，適合家長、學生 or 訪客直接查看畫室作品成果。
        </p>
      </div>
      <button 
        onClick={onReload}
        className="w-full md:w-auto px-6 py-2.5 rounded-full bg-white border border-line text-ink font-bold text-sm hover:bg-accent/5 transition-all flex items-center justify-center gap-2"
      >
        <RefreshCw size={16} />
        重新載入
      </button>
    </div>

    <div className="bg-panel border border-white/70 rounded-2xl shadow-soft p-4 md:p-8">
      {artworks.length === 0 ? (
        <div className="py-16 md:py-20 text-center border-2 border-dashed border-line rounded-2xl bg-white/50">
          <ImageIcon size={40} className="mx-auto text-muted/30 mb-4" />
          <p className="text-muted font-bold text-sm md:text-base px-4">目前還沒有作品。登入後新增第一件作品吧。</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {artworks.map((art) => (
            <article key={art.id} className="bg-white rounded-2xl border border-line overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <div className="aspect-4/3 overflow-hidden bg-stone-100">
                <img 
                  src={art.imageUrl} 
                  alt={art.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-5 md:p-6">
                <div className="mb-3">
                  <span className="px-3 py-1 rounded-full bg-accent/10 text-accent-deep text-[9px] md:text-[10px] font-black uppercase tracking-wider">
                    {art.category}
                  </span>
                </div>
                <h4 className="text-lg md:text-xl font-black mb-2">{art.title}</h4>
                <p className="text-muted text-xs md:text-sm mb-5 line-clamp-2">{art.description}</p>
                <div className="flex justify-between items-center text-[10px] md:text-[11px] font-bold text-muted border-t border-line pt-4">
                  <span>作者：{art.artist}</span>
                  <span>上傳：{art.createdByName}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  </motion.div>
);

const MemberPage = ({ user, onAddArtwork }: { user: any, onAddArtwork: (a: any) => void }) => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    category: '',
    imageUrl: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('請先登入 Google 帳號後再新增作品。');
      return;
    }
    onAddArtwork(formData);
    setFormData({ title: '', artist: '', category: '', imageUrl: '', description: '' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container mx-auto px-4 py-8 md:py-12"
    >
      <div className="mb-8 md:mb-12">
        <h2 className="text-2xl md:text-3xl font-black mb-3 md:mb-4">會員中心</h2>
        <p className="text-muted max-w-3xl text-base md:text-lg">
          管理您的個人資料與上傳作品。登入後即可將您的創作分享到畫廊。
        </p>
      </div>

      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 md:gap-8 items-start">
        <div className="bg-panel border border-white/70 rounded-2xl shadow-soft p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-black mb-4 md:mb-6">登入狀態</h3>
          <div className="p-5 md:p-6 rounded-2xl bg-white/80 border border-line">
            {!user ? (
              <p className="text-muted font-medium text-sm md:text-base">尚未登入。請先點擊右上角 Google 登入按鈕。</p>
            ) : (
              <div className="flex items-center gap-4 md:gap-5">
                <img src={user.photoURL} alt={user.displayName} className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-accent/20" />
                <div>
                  <div className="text-base md:text-lg font-black text-ink">{user.displayName}</div>
                  <div className="text-xs md:text-sm font-bold text-muted">{user.email}</div>
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 p-4 bg-accent/5 border border-accent/10 rounded-xl text-[10px] md:text-xs font-bold text-accent-deep leading-relaxed">
            目前示範為登入後即可新增作品。正式上線建議搭配 Firestore 安全規則限制管理者。
          </div>
        </div>

        <div className="bg-panel border border-white/70 rounded-2xl shadow-soft p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-black mb-4 md:mb-6">新增作品到畫廊</h3>
          <form onSubmit={handleSubmit} className="grid gap-3 md:gap-4">
            <input 
              type="text" 
              placeholder="作品名稱" 
              required 
              className="w-full px-4 md:px-5 py-2.5 md:py-3 rounded-xl border border-line bg-white/90 outline-none focus:border-accent transition-colors text-sm md:text-base"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
            <input 
              type="text" 
              placeholder="作者名稱 / 學員名稱" 
              required 
              className="w-full px-4 md:px-5 py-2.5 md:py-3 rounded-xl border border-line bg-white/90 outline-none focus:border-accent transition-colors text-sm md:text-base"
              value={formData.artist}
              onChange={e => setFormData({...formData, artist: e.target.value})}
            />
            <select 
              required 
              className="w-full px-4 md:px-5 py-2.5 md:py-3 rounded-xl border border-line bg-white/90 outline-none focus:border-accent transition-colors text-sm md:text-base"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="">選擇分類</option>
              <option value="兒童創作">兒童創作</option>
              <option value="素描">素描</option>
              <option value="水彩">水彩</option>
              <option value="插畫">插畫</option>
              <option value="壓克力">壓克力</option>
            </select>
            <input 
              type="url" 
              placeholder="圖片網址 (例如: https://picsum.photos/800/600)" 
              required 
              className="w-full px-4 md:px-5 py-2.5 md:py-3 rounded-xl border border-line bg-white/90 outline-none focus:border-accent transition-colors text-sm md:text-base"
              value={formData.imageUrl}
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
            />
            <textarea 
              placeholder="作品介紹、創作概念、學習紀錄" 
              className="w-full px-4 md:px-5 py-2.5 md:py-3 rounded-xl border border-line bg-white/90 outline-none focus:border-accent transition-colors min-h-[100px] md:min-h-[120px] text-sm md:text-base"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="submit" className="w-full sm:w-auto px-8 py-3 rounded-full bg-accent text-white font-black text-sm hover:-translate-y-0.5 transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2">
                <Plus size={18} />
                新增到畫廊
              </button>
              <button type="reset" onClick={() => setFormData({title:'', artist:'', category:'', imageUrl:'', description:''})} className="w-full sm:w-auto px-8 py-3 rounded-full bg-white border border-line text-ink font-black text-sm hover:bg-stone-50 transition-all">
                清空表單
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

const ContactPage = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 1.1 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="container mx-auto px-4 py-8 md:py-12"
  >
    <div className="mb-8 md:mb-12">
      <h2 className="text-2xl md:text-3xl font-black mb-3 md:mb-4">聯絡我們</h2>
      <p className="text-muted max-w-3xl text-base md:text-lg">
        我們隨時歡迎您的諮詢。無論是報名課程、參觀畫室或合作洽談，請隨時與我們聯繫。
      </p>
    </div>

    <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 md:gap-8">
      <div className="bg-panel border border-white/70 rounded-2xl shadow-soft p-6 md:p-8">
        <h3 className="text-lg md:text-xl font-black mb-4 md:mb-6">畫室資訊</h3>
        <div className="grid gap-3 md:gap-4">
          {[
            { label: '畫室名稱', val: '妮妮美術室' },
            { label: '營業時間', val: '週一至週六 10:00–20:00' },
            { label: '聯絡電話', val: '02-1234-5678' },
            { label: '地址', val: '台北市某某區某某路 123 號' },
          ].map((info, i) => (
            <div key={i} className="p-4 md:p-5 rounded-2xl bg-white/80 border border-line">
              <div className="text-[10px] md:text-xs font-black text-muted uppercase tracking-wider mb-1">{info.label}</div>
              <div className="text-base md:text-lg font-bold text-ink">{info.val}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-panel border border-white/70 rounded-2xl shadow-soft p-6 md:p-8">
        <h3 className="text-lg md:text-xl font-black mb-3 md:mb-4">報名與諮詢</h3>
        <p className="text-muted mb-6 md:mb-8 font-medium text-sm md:text-base leading-relaxed">
          您可以透過以下方式與我們聯繫，或直接點擊按鈕開啟通訊軟體。
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'LINE 官方帳號', icon: ExternalLink },
            { label: '課程報名表', icon: ExternalLink },
            { label: '交通資訊', icon: ExternalLink },
          ].map((btn, i) => (
            <button key={i} className="flex-1 sm:flex-none px-5 md:px-6 py-3 rounded-full bg-accent/10 text-accent-deep font-black text-xs md:text-sm hover:bg-accent/20 transition-all flex items-center justify-center gap-2">
              <btn.icon size={16} />
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

// --- Main App ---

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore Listener
  useEffect(() => {
    const q = query(collection(db, 'artworks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const arts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Artwork[];
      setArtworks(arts);
    }, (error) => {
      console.error("Error fetching artworks:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
      alert('登入失敗，請確認 Firebase 設定。');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleAddArtwork = async (data: any) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'artworks'), {
        ...data,
        createdAt: serverTimestamp(),
        createdByName: user.displayName || '匿名',
        createdByUid: user.uid
      });
      alert('作品已成功新增！');
      setCurrentPage('gallery');
    } catch (error) {
      console.error("Add Artwork Error:", error);
      alert('新增失敗，請檢查 Firestore 權限設定。');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-muted">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <HomePage key="home" onNavigate={setCurrentPage} />
          )}
          {currentPage === 'courses' && (
            <CoursesPage key="courses" />
          )}
          {currentPage === 'gallery' && (
            <GalleryPage 
              key="gallery" 
              artworks={artworks} 
              onReload={() => alert('資料已重新整理')} 
            />
          )}
          {currentPage === 'member' && (
            <MemberPage 
              key="member" 
              user={user} 
              onAddArtwork={handleAddArtwork} 
            />
          )}
          {currentPage === 'contact' && (
            <ContactPage key="contact" />
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 border-t border-line text-center text-muted text-sm font-bold">
        <div className="container mx-auto px-4">
          妮妮美術室 NiNi Art Studio © 2026 ｜ 專業美術教學與作品展示平台
        </div>
      </footer>
    </div>
  );
}
