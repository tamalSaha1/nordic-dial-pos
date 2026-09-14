// Include this script on every protected page (not login.html).
// It (1) redirects to login if there's no session, (2) renders the sidebar
// with links appropriate to the logged-in user's role, and (3) hides/shows
// manager-only nav items and page sections.

function getSession() {
  const token = localStorage.getItem('kl_token');
  const userRaw = localStorage.getItem('kl_user');
  if (!token || !userRaw) return null;
  try {
    return { token, user: JSON.parse(userRaw) };
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem('kl_token');
  localStorage.removeItem('kl_user');
  window.location.href = '/login.html';
}

// Nav items available to everyone, plus manager-only items appended when applicable.
const NAV_ITEMS = [
  { href: '/dashboard.html', label: 'Dashboard', roles: ['manager', 'staff'] },
  { href: '/invoice.html', label: 'New Invoice (POS)', roles: ['manager', 'staff'] },
  { href: '/invoices.html', label: 'Sales History', roles: ['manager', 'staff'] },
  { href: '/stock.html', label: 'Stock Tracking', roles: ['manager', 'staff'] },
  { href: '/returns.html', label: 'Returns & Refunds', roles: ['manager', 'staff'] },
  { href: '/suppliers.html', label: 'Suppliers', roles: ['manager'] },
  { href: '/reports.html', label: 'Reports & Revenue', roles: ['manager'] },
  { href: '/staff.html', label: 'Staff Accounts', roles: ['manager'] },
];

function renderSidebar(activePage) {
  const session = getSession();
  if (!session) {
    window.location.href = '/login.html';
    return null;
  }

  const { user } = session;
  const container = document.getElementById('sidebar');
  if (!container) return session;

  const links = NAV_ITEMS.filter((item) => item.roles.includes(user.role))
    .map(
      (item) => `
      <a class="nav-link ${item.href === activePage ? 'active' : ''}" href="${item.href}">${item.label}</a>
    `
    )
    .join('');

  container.innerHTML = `
    <div class="sidebar-brand">Nordic Dial</div>
    <div class="sidebar-role-badge">${user.name} · ${user.role}</div>
    ${links}
    <button class="logout-btn" onclick="logout()">Log out</button>
  `;

  return session;
}

// Call at the top of every protected page's inline script:
//   const session = requireAuth('/dashboard.html');
//   if (session.user.role !== 'manager') { ...restrict page... }
function requireAuth(activePage) {
  const session = renderSidebar(activePage);
  if (!session) throw new Error('Redirecting to login');
  return session;
}

function requireManager(session) {
  if (session.user.role !== 'manager') {
    document.querySelector('.main-content').innerHTML =
      '<div class="empty-state">This page is only available to managers.</div>';
    throw new Error('Not a manager');
  }
}

function formatMoney(n) {
  return '৳' + Number(n || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d) {
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
