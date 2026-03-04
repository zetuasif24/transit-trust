const API = 'http://127.0.0.1:8000/api';

// ─── Auth ────────────────────────────────────────────────────
var Auth = {
  currentUser: null,

  register: async function(fullName, phone, password, gender) {
    try {
      const res = await fetch(API + '/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, phone, password, gender })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Registration failed.' };
      return { user: data.user };
    } catch(e) {
      return { error: 'Cannot connect to server. Is Django running? Run: python manage.py runserver' };
    }
  },

  login: async function(phone, password) {
    try {
      const res = await fetch(API + '/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Login failed.' };
      this.currentUser = data.user;
      sessionStorage.setItem('transitTrust_user', JSON.stringify(data.user));
      return { user: data.user };
    } catch(e) {
      return { error: 'Cannot connect to server. Is Django running? Run: python manage.py runserver' };
    }
  },

  logout: function() {
    this.currentUser = null;
    sessionStorage.removeItem('transitTrust_user');
  },

  restoreSession: function() {
    try {
      const saved = sessionStorage.getItem('transitTrust_user');
      if (saved) this.currentUser = JSON.parse(saved);
    } catch(e) {}
  },

  updateProfile: async function(userId, fullName) {
    try {
      const res = await fetch(API + '/auth/profile/' + userId + '/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error };
      this.currentUser = data.user;
      sessionStorage.setItem('transitTrust_user', JSON.stringify(data.user));
      return { user: data.user };
    } catch(e) {
      return { error: 'Server error.' };
    }
  },
};

// ─── Routes ──────────────────────────────────────────────────
var RouteAPI = {
  getAll: async function() {
    const res = await fetch(API + '/routes/');
    return await res.json();
  },
  getById: async function(id) {
    const res = await fetch(API + '/routes/' + id + '/');
    return await res.json();
  },
  getBusesByRoute: async function(routeId) {
    const res = await fetch(API + '/routes/' + routeId + '/buses/');
    return await res.json();
  },
};

// ─── Ratings ─────────────────────────────────────────────────
var RatingAPI = {
  submit: async function(passengerId, busId, ratingScore, comment) {
    const res = await fetch(API + '/ratings/submit/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passenger: passengerId, bus: busId, rating_score: ratingScore, comment })
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    return { rating: data };
  },
  getAll: async function(passengerId) {
    const url = passengerId ? API + '/ratings/?passenger_id=' + passengerId : API + '/ratings/';
    const res = await fetch(url);
    return await res.json();
  },
};

// ─── Reports ─────────────────────────────────────────────────
var ReportAPI = {
  submit: async function(passengerId, busId, routeId, chargedAmount, officialFare) {
    const res = await fetch(API + '/reports/submit/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passenger: passengerId, bus: busId, route: routeId,
        charged_amount: chargedAmount, official_fare: officialFare
      })
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    return { report: data };
  },
  getAll: async function(passengerId) {
    const url = passengerId ? API + '/reports/?passenger_id=' + passengerId : API + '/reports/';
    const res = await fetch(url);
    return await res.json();
  },
};

// ─── Stats ───────────────────────────────────────────────────
var StatsAPI = {
  get: async function() {
    const [statsRes, ratingsRes, reportsRes] = await Promise.all([
      fetch(API + '/auth/stats/'),
      fetch(API + '/ratings/'),
      fetch(API + '/reports/'),
    ]);
    const stats   = await statsRes.json();
    const ratings = await ratingsRes.json();
    const reports = await reportsRes.json();
    return {
      ...stats,
      recentRatings: ratings.slice(0, 5),
      recentReports: reports.slice(0, 5),
    };
  },
};

// ─── Helpers ─────────────────────────────────────────────────
function formatDate(iso) {
  return new Date(iso).toLocaleString('en-BD', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function stars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}
