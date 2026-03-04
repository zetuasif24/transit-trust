var App = {
  currentPage: "fare",

  init: function() {
    Auth.restoreSession();
    if (!Auth.currentUser) { window.location.href = "/"; return; }
    this.renderNav();
    this.navigate("fare");
  },

  navigate: function(page) {
    this.currentPage = page;
    document.querySelectorAll("[data-nav]").forEach(function(el) {
      el.classList.toggle("nav-active", el.dataset.nav === page);
    });
    var main = document.getElementById("main-content");
    if (!main) return;
    var pages = { fare: FarePage, rating: RatingPage, dashboard: DashboardPage, profile: ProfilePage };
    if (pages[page]) pages[page].render(main);
  },

  renderNav: function() {
    var user = Auth.currentUser;
    var nav = document.getElementById("sidebar-user");
    if (!nav) return;
    nav.innerHTML =
      "<div class='flex items-center gap-3 mb-4'>" +
        "<div class='avatar-circle'>" + user.full_name[0].toUpperCase() + "</div>" +
        "<div class='overflow-hidden'>" +
          "<div class='text-sm font-bold text-slate-200 truncate'>" + user.full_name + "</div>" +
          "<div class='text-xs text-slate-500 capitalize'>" + user.role + "</div>" +
        "</div>" +
      "</div>" +
      "<button onclick='App.logout()' class='btn-danger-sm w-full'>Sign Out</button>";
  },

  logout: function() {
    Auth.logout();
    window.location.href = "/";
  },
};

// ── Fare Calculator Page ─────────────────────────────────────
var FarePage = {
  routes: [],

  render: async function(container) {
    container.innerHTML = "<div class='flex items-center justify-center h-40'><div class='text-slate-500 text-sm'>Loading routes from database...</div></div>";
    try {
      this.routes = await RouteAPI.getAll();
    } catch(e) {
      container.innerHTML = "<div class='card'><div class='alert-error'>Cannot connect to Django server. Make sure it is running.</div></div>";
      return;
    }

    container.innerHTML =
      "<div class='page-header'>" +
        "<h1 class='page-title'>Smart Fare Calculator</h1>" +
        "<p class='page-sub'>Verify official government-mandated fares for your route</p>" +
      "</div>" +
      "<div class='grid grid-cols-1 lg:grid-cols-2 gap-6'>" +
        "<div class='card'>" +
          "<h2 class='card-title'>Select Your Route</h2>" +
          "<div class='form-group'><label class='form-label'>ROUTE</label>" +
            "<select id='fare-route' class='form-select' onchange='FarePage.onRouteChange(this.value)'>" +
              "<option value=''>-- Choose a route --</option>" +
              this.routes.map(function(r) {
                return "<option value='" + r.id + "'>" + r.name + "</option>";
              }).join("") +
            "</select>" +
          "</div>" +
          "<div id='fare-bus-group' class='form-group hidden'><label class='form-label'>BUS</label>" +
            "<select id='fare-bus' class='form-select'></select>" +
          "</div>" +
          "<div class='form-group'><label class='form-label'>FARE YOU PAID (Tk)</label>" +
            "<input id='fare-paid' type='number' min='0' placeholder='e.g. 35' class='form-input' />" +
          "</div>" +
          "<button onclick='FarePage.checkFare()' class='btn-primary w-full mt-2'>Check Fare</button>" +
          "<div id='fare-msg' class='mt-4 hidden'></div>" +
        "</div>" +
        "<div class='flex flex-col gap-6'>" +
          "<div id='fare-result' class='card flex flex-col items-center justify-center min-h-40 opacity-50'>" +
            "<div class='text-4xl mb-3'>&#128269;</div>" +
            "<p class='text-slate-500 text-sm'>Select a route and enter fare paid to verify</p>" +
          "</div>" +
          "<div class='card'><h2 class='card-title'>Official Fare Chart</h2>" +
            "<div class='max-h-52 overflow-y-auto pr-1'>" +
              "<table class='w-full text-sm'><thead><tr class='text-xs text-slate-500 border-b border-slate-700'>" +
              "<th class='text-left py-2'>Route</th><th class='text-right py-2'>Official Fare</th><th class='text-right py-2'>Dist</th></tr></thead><tbody>" +
              this.routes.map(function(r) {
                return "<tr class='border-b border-slate-800 hover:bg-slate-800/40'>" +
                  "<td class='py-2 text-slate-300'>" + r.name + "</td>" +
                  "<td class='py-2 text-right font-bold text-amber-400'>Tk " + r.official_fare + "</td>" +
                  "<td class='py-2 text-right text-slate-500'>" + r.distance + " km</td></tr>";
              }).join("") +
              "</tbody></table>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>";
  },

  onRouteChange: async function(routeId) {
    var busGroup  = document.getElementById("fare-bus-group");
    var busSelect = document.getElementById("fare-bus");
    if (!routeId) { busGroup.classList.add("hidden"); return; }
    var buses = await RouteAPI.getBusesByRoute(routeId);
    if (!buses.length) { busGroup.classList.add("hidden"); return; }
    busSelect.innerHTML = buses.map(function(b) {
      return "<option value='" + b.id + "'>" + b.name + " - " + b.license_num + "</option>";
    }).join("");
    busGroup.classList.remove("hidden");
  },

  checkFare: async function() {
    var routeId  = document.getElementById("fare-route").value;
    var paidRaw  = document.getElementById("fare-paid").value;
    var msgEl    = document.getElementById("fare-msg");
    var resultEl = document.getElementById("fare-result");
    if (!routeId || !paidRaw) {
      msgEl.innerHTML = "<div class='alert-error'>Please select a route and enter the fare you paid.</div>";
      msgEl.classList.remove("hidden"); return;
    }
    msgEl.classList.add("hidden");
    var route  = await RouteAPI.getById(routeId);
    var paid   = parseFloat(paidRaw);
    var over   = paid > route.official_fare;
    var excess = (paid - route.official_fare).toFixed(0);
    resultEl.classList.remove("opacity-50");
    resultEl.innerHTML =
      "<div class='text-center mb-4'>" +
        "<div class='text-5xl mb-2'>" + (over ? "&#9888;" : "&#9989;") + "</div>" +
        "<div class='text-xl font-black " + (over ? "text-red-400" : "text-emerald-400") + "'>" +
          (over ? "Overcharge Detected!" : "Fare is Correct") +
        "</div>" +
      "</div>" +
      "<div class='grid grid-cols-2 gap-3 w-full mb-4'>" +
        "<div class='stat-mini'><div class='stat-mini-label'>OFFICIAL FARE</div><div class='stat-mini-value text-emerald-400'>Tk " + route.official_fare + "</div></div>" +
        "<div class='stat-mini'><div class='stat-mini-label'>YOU PAID</div><div class='stat-mini-value " + (over ? "text-red-400" : "text-slate-100") + "'>Tk " + paid + "</div></div>" +
      "</div>" +
      "<div class='text-xs text-slate-500 mb-4'>" + route.name + " - " + route.distance + " km</div>" +
      (over ? "<button onclick='FarePage.reportOvercharge(" + routeId + "," + paid + "," + route.official_fare + ")' class='btn-danger w-full' id='report-btn'>Report Overcharge (Tk " + excess + " excess)</button>" : "") +
      "<div id='report-confirm' class='mt-3'></div>";
  },

  reportOvercharge: async function(routeId, paid, officialFare) {
    var busEl = document.getElementById("fare-bus");
    var busId = busEl ? busEl.value : "1";
    var res = await ReportAPI.submit(Auth.currentUser.id, busId, routeId, paid, officialFare);
    if (res.error) return;
    var btn = document.getElementById("report-btn");
    if (btn) btn.remove();
    document.getElementById("report-confirm").innerHTML =
      "<div class='alert-success'>Report submitted to database. Authorities notified.</div>";
  },
};

// ── Service Rating Page ──────────────────────────────────────
var RatingPage = {
  _selectedStar: 0,
  routes: [],

  render: async function(container) {
    container.innerHTML = "<div class='flex items-center justify-center h-40'><div class='text-slate-500 text-sm'>Loading...</div></div>";
    this.routes = await RouteAPI.getAll();
    var allRatings = await RatingAPI.getAll(null);

    var scoreColors = ["","text-red-400","text-orange-400","text-amber-400","text-lime-400","text-emerald-400"];
    var ratingRows = allRatings.length === 0
      ? "<p class='text-slate-500 text-sm'>No ratings yet.</p>"
      : allRatings.map(function(r) {
          var busName = r.bus_detail ? r.bus_detail.name : "Unknown";
          var busNum  = r.bus_detail ? r.bus_detail.license_num : "";
          return "<div class='rating-card mb-3'>" +
            "<div class='flex justify-between items-start'>" +
              "<div><div class='text-sm font-bold text-slate-200'>" + busName + "</div>" +
              "<div class='text-xs text-slate-500'>" + busNum + "</div></div>" +
              "<div class='" + scoreColors[r.rating_score] + " font-mono text-sm'>" + stars(r.rating_score) + "</div>" +
            "</div>" +
            (r.comment ? "<p class='text-xs text-slate-400 italic mt-2'>\"" + r.comment + "\"</p>" : "") +
            "<div class='text-xs text-slate-600 mt-2'>" + formatDate(r.created_at) + "</div>" +
          "</div>";
        }).join("");

    container.innerHTML =
      "<div class='page-header'><h1 class='page-title'>Service Rating</h1>" +
      "<p class='page-sub'>Rate bus service quality and driver behavior</p></div>" +
      "<div class='grid grid-cols-1 lg:grid-cols-2 gap-6'>" +
        "<div class='card'>" +
          "<h2 class='card-title'>Submit a Rating</h2>" +
          "<div id='rating-msg'></div>" +
          "<div class='form-group'><label class='form-label'>ROUTE</label>" +
            "<select id='rating-route' class='form-select' onchange='RatingPage.onRouteChange(this.value)'>" +
              "<option value=''>-- Select route --</option>" +
              this.routes.map(function(r) {
                return "<option value='" + r.id + "'>" + r.name + "</option>";
              }).join("") +
            "</select>" +
          "</div>" +
          "<div id='rating-bus-group' class='form-group hidden'><label class='form-label'>BUS</label>" +
            "<select id='rating-bus' class='form-select'></select>" +
          "</div>" +
          "<div class='form-group'><label class='form-label'>YOUR RATING</label>" +
            "<div id='star-rating' class='flex gap-1 mt-1'>" +
              [1,2,3,4,5].map(function(n) {
                return "<button data-star='" + n + "' onclick='RatingPage.setStar(" + n + ")' class='star-btn text-3xl text-slate-600 hover:text-amber-400 transition-colors'>&#9733;</button>";
              }).join("") +
            "</div>" +
            "<div id='star-label' class='text-sm mt-2 font-semibold text-slate-500'>Click to rate</div>" +
          "</div>" +
          "<div class='form-group'><label class='form-label'>COMMENT (OPTIONAL)</label>" +
            "<textarea id='rating-comment' rows='3' placeholder='Share your experience...' class='form-input resize-none'></textarea>" +
          "</div>" +
          "<button onclick='RatingPage.submitRating()' class='btn-primary w-full'>Submit Rating</button>" +
        "</div>" +
        "<div class='card'><h2 class='card-title'>Recent Ratings</h2>" +
          "<div class='max-h-96 overflow-y-auto pr-1'>" + ratingRows + "</div>" +
        "</div>" +
      "</div>";
    this._selectedStar = 0;
  },

  onRouteChange: async function(routeId) {
    var busGroup  = document.getElementById("rating-bus-group");
    var busSelect = document.getElementById("rating-bus");
    if (!routeId) { busGroup.classList.add("hidden"); return; }
    var buses = await RouteAPI.getBusesByRoute(routeId);
    if (!buses.length) { busGroup.classList.add("hidden"); return; }
    busSelect.innerHTML = buses.map(function(b) {
      return "<option value='" + b.id + "'>" + b.name + " - " + b.license_num + "</option>";
    }).join("");
    busGroup.classList.remove("hidden");
  },

  setStar: function(n) {
    this._selectedStar = n;
    var labels = ["","Very Poor","Poor","Average","Good","Excellent"];
    var colors = ["","text-red-400","text-orange-400","text-amber-400","text-lime-400","text-emerald-400"];
    document.querySelectorAll(".star-btn").forEach(function(btn) {
      var s = parseInt(btn.dataset.star);
      btn.classList.toggle("text-amber-400", s <= n);
      btn.classList.toggle("text-slate-600", s > n);
    });
    var lbl = document.getElementById("star-label");
    lbl.textContent = labels[n];
    lbl.className = "text-sm mt-2 font-bold " + colors[n];
  },

  submitRating: async function() {
    var busId   = document.getElementById("rating-bus") ? document.getElementById("rating-bus").value : "";
    var comment = document.getElementById("rating-comment") ? document.getElementById("rating-comment").value : "";
    var msgEl   = document.getElementById("rating-msg");
    if (!busId) { msgEl.innerHTML = "<div class='alert-error mb-4'>Please select a route and bus.</div>"; return; }
    if (!this._selectedStar) { msgEl.innerHTML = "<div class='alert-error mb-4'>Please give a star rating.</div>"; return; }
    var res = await RatingAPI.submit(Auth.currentUser.id, busId, this._selectedStar, comment);
    if (res.error) { msgEl.innerHTML = "<div class='alert-error mb-4'>" + res.error + "</div>"; return; }
    msgEl.innerHTML = "<div class='alert-success mb-4'>Rating saved to database successfully!</div>";
    setTimeout(function() { RatingPage.render(document.getElementById("main-content")); }, 1200);
  },
};

// ── Dashboard Page ───────────────────────────────────────────
var DashboardPage = {
  render: async function(container) {
    container.innerHTML = "<div class='flex items-center justify-center h-40'><div class='text-slate-500 text-sm'>Loading dashboard data from database...</div></div>";
    var stats = await StatsAPI.get();

    var heatData = [
      { route: "Mirpur-10 to Motijheel", risk: 0.85 },
      { route: "Uttara to Farmgate",     risk: 0.40 },
      { route: "Gazipur to Gulistan",    risk: 0.70 },
      { route: "Sadarghat to Mirpur-1",  risk: 0.20 },
      { route: "Demra to Motijheel",     risk: 0.60 },
      { route: "Bashundhara to KB",      risk: 0.30 },
    ];

    var statCards = [
      { label: "Registered Users",   value: stats.total_users,   icon: "&#128101;", color: "text-violet-400" },
      { label: "Service Ratings",    value: stats.total_ratings, icon: "&#11088;",  color: "text-amber-400"  },
      { label: "Overcharge Reports", value: stats.total_reports, icon: "&#128680;", color: "text-red-400"    },
      { label: "Avg Rating",         value: stats.avg_rating + (stats.avg_rating !== "N/A" ? " / 5" : ""), icon: "&#128202;", color: "text-emerald-400" },
    ];

    var badgeColors = ["","bg-red-900 text-red-300","bg-orange-900 text-orange-300","bg-amber-900 text-amber-300","bg-lime-900 text-lime-300","bg-emerald-900 text-emerald-300"];

    container.innerHTML =
      "<div class='page-header'><h1 class='page-title'>Admin Dashboard</h1>" +
      "<p class='page-sub'>Live data from PostgreSQL database</p></div>" +

      "<div class='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>" +
        statCards.map(function(s) {
          return "<div class='card text-center'><div class='text-3xl mb-2'>" + s.icon + "</div>" +
            "<div class='text-3xl font-black " + s.color + "'>" + s.value + "</div>" +
            "<div class='text-xs text-slate-500 mt-1'>" + s.label + "</div></div>";
        }).join("") +
      "</div>" +

      "<div class='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>" +
        "<div class='card'><h2 class='card-title'>Recent Service Ratings</h2>" +
          (stats.recentRatings.length === 0 ? "<p class='text-slate-500 text-sm'>No ratings yet.</p>" :
            stats.recentRatings.map(function(r) {
              var busName = r.bus_detail ? r.bus_detail.name : "Unknown";
              return "<div class='flex justify-between items-center py-2 border-b border-slate-800'>" +
                "<div><div class='text-sm font-semibold text-slate-200'>" + busName + "</div>" +
                "<div class='text-xs text-slate-500'>" + formatDate(r.created_at) + "</div></div>" +
                "<span class='badge " + badgeColors[r.rating_score] + "'>" + stars(r.rating_score) + " " + r.rating_score + "/5</span>" +
              "</div>";
            }).join("")) +
        "</div>" +
        "<div class='card'><h2 class='card-title'>Overcharge Reports</h2>" +
          (stats.recentReports.length === 0 ? "<p class='text-slate-500 text-sm'>No reports yet.</p>" :
            stats.recentReports.map(function(r) {
              var busNum    = r.bus_detail   ? r.bus_detail.license_num : "Unknown";
              var routeName = r.route_detail ? r.route_detail.name      : "";
              return "<div class='py-2 border-b border-slate-800'>" +
                "<div class='flex justify-between items-start'>" +
                  "<div class='text-sm font-semibold text-slate-200'>" + busNum + "</div>" +
                  "<span class='badge bg-red-900 text-red-300'>+Tk " + r.excess_amount + " overcharged</span>" +
                "</div>" +
                "<div class='text-xs text-slate-500 mt-1'>" + routeName + "</div>" +
                "<div class='text-xs text-slate-600'>Paid: Tk " + r.charged_amount + " - Official: Tk " + r.official_fare + "</div>" +
              "</div>";
            }).join("")) +
        "</div>" +
      "</div>" +

      "<div class='card'><h2 class='card-title'>Safety Heatmap</h2>" +
        "<div class='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4'>" +
          heatData.map(function(d) {
            var level = d.risk > 0.65 ? "HIGH RISK" : d.risk > 0.45 ? "MODERATE" : "SAFE";
            var cls   = d.risk > 0.65 ? "heatmap-high" : d.risk > 0.45 ? "heatmap-mid" : "heatmap-low";
            return "<div class='heatmap-cell " + cls + "'>" +
              "<div class='text-xs font-bold text-center leading-tight'>" + d.route + "</div>" +
              "<div class='heatmap-label mt-2'>" + level + "</div></div>";
          }).join("") +
        "</div>" +
        "<p class='text-xs text-slate-600 mt-4'>Generated from aggregated passenger safety reports.</p>" +
      "</div>";
  },
};

// ── Profile Page ─────────────────────────────────────────────
var ProfilePage = {
  render: async function(container) {
    var user = Auth.currentUser;
    var myRatings = await RatingAPI.getAll(user.id);
    var myReports = await ReportAPI.getAll(user.id);

    container.innerHTML =
      "<div class='page-header'><h1 class='page-title'>My Profile</h1>" +
      "<p class='page-sub'>Manage your account details</p></div>" +
      "<div class='grid grid-cols-1 lg:grid-cols-2 gap-6'>" +
        "<div class='card'>" +
          "<div class='flex items-center gap-4 mb-6'>" +
            "<div class='avatar-lg'>" + user.full_name[0].toUpperCase() + "</div>" +
            "<div><div class='text-lg font-black text-slate-100'>" + user.full_name + "</div>" +
            "<div class='text-sm text-slate-500 capitalize'>" + user.role + " - " + user.gender + "</div></div>" +
          "</div>" +
          "<div id='profile-msg'></div>" +
          "<div class='form-group'><label class='form-label'>FULL NAME</label>" +
            "<input id='profile-name' type='text' value='" + user.full_name + "' class='form-input' /></div>" +
          "<div class='form-group'><label class='form-label'>PHONE NUMBER</label>" +
            "<input type='text' value='" + user.phone + "' disabled class='form-input opacity-50 cursor-not-allowed' /></div>" +
          "<button onclick='ProfilePage.saveProfile()' class='btn-primary w-full'>Save Changes</button>" +
        "</div>" +
        "<div class='flex flex-col gap-6'>" +
          "<div class='card'><h2 class='card-title'>My Activity</h2>" +
            "<div class='grid grid-cols-2 gap-4 mt-2'>" +
              "<div class='stat-mini'><div class='stat-mini-label'>RATINGS GIVEN</div><div class='stat-mini-value text-amber-400'>" + myRatings.length + "</div></div>" +
              "<div class='stat-mini'><div class='stat-mini-label'>OVERCHARGE REPORTS</div><div class='stat-mini-value text-red-400'>" + myReports.length + "</div></div>" +
            "</div>" +
          "</div>" +
          "<div class='card flex-1'><h2 class='card-title'>My Recent Ratings</h2>" +
            (myRatings.length === 0 ? "<p class='text-slate-500 text-sm'>No ratings yet.</p>" :
              myRatings.slice(0,4).map(function(r) {
                var busName = r.bus_detail ? r.bus_detail.name : "Unknown";
                return "<div class='flex justify-between items-center py-2 border-b border-slate-800 text-sm'>" +
                  "<div><div class='text-slate-300 font-semibold'>" + busName + "</div>" +
                  "<div class='text-xs text-slate-600'>" + formatDate(r.created_at) + "</div></div>" +
                  "<div class='text-amber-400 font-mono'>" + stars(r.rating_score) + "</div></div>";
              }).join("")) +
          "</div>" +
        "</div>" +
      "</div>";
  },

  saveProfile: async function() {
    var name  = document.getElementById("profile-name").value.trim();
    var msgEl = document.getElementById("profile-msg");
    if (!name) { msgEl.innerHTML = "<div class='alert-error mb-4'>Name cannot be empty.</div>"; return; }
    var res = await Auth.updateProfile(Auth.currentUser.id, name);
    if (res.error) { msgEl.innerHTML = "<div class='alert-error mb-4'>" + res.error + "</div>"; return; }
    App.renderNav();
    msgEl.innerHTML = "<div class='alert-success mb-4'>Profile updated successfully.</div>";
  },
};

document.addEventListener("DOMContentLoaded", function() { App.init(); });
