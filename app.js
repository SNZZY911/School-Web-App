/* ============================================================
   app.js — Shared utilities for the School Web App demo
   ============================================================ */

// ── Auth ─────────────────────────────────────────────────────
function getUser() {
  try { return JSON.parse(localStorage.getItem('demo_user') || 'null'); } catch { return null; }
}

/**
 * requireAuth(roles?)
 *   roles: string | string[] | undefined
 *   If not logged in → login.html
 *   If roles specified and user doesn't match → login.html
 */
function requireAuth(roles) {
  const user = getUser();
  if (!user) { location.replace('login.html'); return; }
  if (roles) {
    const allowed = Array.isArray(roles) ? roles : [roles];
    if (!allowed.includes(user.role)) { location.replace('dashboard.html'); return; }
  }
  return user;
}

// ── Utilities ─────────────────────────────────────────────────
function esc(str) {
  return String(str ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0,2).map(w => w[0].toUpperCase()).join('');
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  if (diff < 2592000) return Math.floor(diff/86400) + 'd ago';
  return new Date(iso).toLocaleDateString();
}

// ── Sidebar ──────────────────────────────────────────────────
const SIDEBAR_NAV = [
  { href:'dashboard.html', label:'Dashboard', icon:'grid', roles:['admin','moderator','student'] },
  { href:'create-post.html', label:'Create Post', icon:'plus', roles:['admin','moderator','student'] },
  { href:'groups.html', label:'My Groups', icon:'users', roles:['admin','moderator','student'] },
  { href:'profile.html', label:'Profile', icon:'person', roles:['admin','moderator','student'] },
  { href:'user-management.html', label:'User Management', icon:'shield', roles:['admin'] },
  { href:'moderation.html', label:'Moderation', icon:'flag', roles:['admin','moderator'] },
];

const ICONS = {
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  person:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  flag:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
  logout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
};

function buildSidebar() {
  const mount = document.getElementById('sidebar-mount');
  if (!mount) return;
  const user = getUser();
  if (!user) return;

  const currentPage = location.pathname.split('/').pop() || 'dashboard.html';

  const navItems = SIDEBAR_NAV
    .filter(item => item.roles.includes(user.role))
    .map(item => {
      const active = currentPage === item.href;
      return `<a href="${item.href}" class="sidebar-nav-item${active?' active':''}">
        <span class="sidebar-nav-icon">${ICONS[item.icon]}</span>
        <span>${esc(item.label)}</span>
      </a>`;
    }).join('');

  const roleBadge = { admin:'Admin', moderator:'Teacher', student:'Student' }[user.role] || user.role;
  const roleClass = { admin:'badge-admin', moderator:'badge-mod', student:'badge-student' }[user.role] || '';

  mount.innerHTML = `
    <div class="sidebar-overlay" onclick="closeSidebar()"></div>
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
            <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
          </svg>
        </div>
        <div>
          <div class="sidebar-logo-title">SchoolApp</div>
          <div class="sidebar-logo-sub">Class Portal</div>
        </div>
      </div>

      <div class="sidebar-user">
        <div class="avatar avatar-md">${initials(user.name)}</div>
        <div>
          <div class="sidebar-user-name">${esc(user.name)}</div>
          <span class="badge ${roleClass}">${esc(roleBadge)}</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        ${navItems}
      </nav>

      <div class="sidebar-footer">
        <button class="sidebar-nav-item w-full" onclick="logout()">
          <span class="sidebar-nav-icon">${ICONS.logout}</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  `;
}

function logout() {
  localStorage.removeItem('demo_user');
  location.replace('login.html');
}

// ── Sidebar mobile toggle ──────────────────────────────────────
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay  = document.querySelector('.sidebar-overlay');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  overlay && overlay.classList.toggle('show');
}
function closeSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay  = document.querySelector('.sidebar-overlay');
  sidebar && sidebar.classList.remove('open');
  overlay && overlay.classList.remove('show');
}

// ── Dropdowns ────────────────────────────────────────────────
function toggleDropdown(id) {
  closeAllDropdowns(id);
  const el = document.getElementById(id);
  el && el.classList.toggle('hidden');
}
function closeAllDropdowns(exceptId) {
  document.querySelectorAll('.dropdown-menu').forEach(el => {
    if (el.id !== exceptId) el.classList.add('hidden');
  });
}

// Click outside closes dropdowns
document.addEventListener('click', function(e) {
  if (!e.target.closest('.dropdown-wrap')) closeAllDropdowns();
});

// ── Init ──────────────────────────────────────────────────────
// Auto-build sidebar on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  buildSidebar();
});
// If already loaded (script at bottom), call immediately
if (document.readyState !== 'loading') {
  buildSidebar();
}
