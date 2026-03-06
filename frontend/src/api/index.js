const API = "http://127.0.0.1:8000/api";

export const AuthAPI = {
  register: async (fullName, phone, password, gender) => {
    try {
      const res = await fetch(API + "/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, phone, password, gender })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Registration failed." };
      return { user: data.user };
    } catch(e) {
      return { error: "Cannot connect to server. Make sure Django is running." };
    }
  },

  login: async (phone, password) => {
    try {
      const res = await fetch(API + "/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Login failed." };
      return { user: data.user };
    } catch(e) {
      return { error: "Cannot connect to server. Make sure Django is running." };
    }
  },

  updateProfile: async (userId, fullName) => {
    try {
      const res = await fetch(API + "/auth/profile/" + userId + "/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error };
      return { user: data.user };
    } catch(e) {
      return { error: "Server error." };
    }
  },

  getStats: async () => {
    const res = await fetch(API + "/auth/stats/");
    return await res.json();
  },
};

export const RouteAPI = {
  getAll: async () => {
    const res = await fetch(API + "/routes/");
    return await res.json();
  },
  getById: async (id) => {
    const res = await fetch(API + "/routes/" + id + "/");
    return await res.json();
  },
  getBusesByRoute: async (routeId) => {
    const res = await fetch(API + "/routes/" + routeId + "/buses/");
    return await res.json();
  },
};

export const RatingAPI = {
  submit: async (passengerId, busId, ratingScore, comment) => {
    const res = await fetch(API + "/ratings/submit/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passenger: passengerId, bus: busId, rating_score: ratingScore, comment })
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    return { rating: data };
  },
  getAll: async (passengerId) => {
    const url = passengerId ? API + "/ratings/?passenger_id=" + passengerId : API + "/ratings/";
    const res = await fetch(url);
    return await res.json();
  },
};

export const ReportAPI = {
  submit: async (passengerId, busId, routeId, chargedAmount, officialFare) => {
    const res = await fetch(API + "/reports/submit/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        passenger: passengerId, bus: busId, route: routeId,
        charged_amount: chargedAmount, official_fare: officialFare
      })
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    return { report: data };
  },
  getAll: async (passengerId) => {
    const url = passengerId ? API + "/reports/?passenger_id=" + passengerId : API + "/reports/";
    const res = await fetch(url);
    return await res.json();
  },
};

export const formatDate = (iso) => {
  return new Date(iso).toLocaleString("en-BD", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);