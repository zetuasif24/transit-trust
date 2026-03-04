document.addEventListener("DOMContentLoaded", function () {

  // ── Login Page ──────────────────────────────────────────────
  var loginForm = document.getElementById("login-form");
  if (loginForm) {
    Auth.restoreSession();
    if (Auth.currentUser) {
      window.location.href = "/app/";
      return;
    }

    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var phone    = document.getElementById("login-phone").value.trim();
      var password = document.getElementById("login-password").value;
      var msgEl    = document.getElementById("login-msg");
      var btn      = document.getElementById("login-btn");

      btn.textContent = "Signing in...";
      btn.disabled = true;

      var res = await Auth.login(phone, password);

      btn.textContent = "Sign In";
      btn.disabled = false;

      if (res.error) {
        msgEl.innerHTML = "<div class='alert-error'>" + res.error + "</div>";
        return;
      }
      msgEl.innerHTML = "<div class='alert-success'>Login successful! Redirecting...</div>";
      setTimeout(function () { window.location.href = "/app/"; }, 700);
    });

    var dp = document.getElementById("demo-passenger");
    if (dp) dp.addEventListener("click", function () {
      document.getElementById("login-phone").value    = "01711000001";
      document.getElementById("login-password").value = "demo123";
    });

    var da = document.getElementById("demo-admin");
    if (da) da.addEventListener("click", function () {
      document.getElementById("login-phone").value    = "01711000002";
      document.getElementById("login-password").value = "admin123";
    });
  }

  // ── Register Page ───────────────────────────────────────────
  var registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      var fullName        = document.getElementById("reg-name").value.trim();
      var phone           = document.getElementById("reg-phone").value.trim().replace(/\s+/g, "");
      var gender          = document.getElementById("reg-gender").value;
      var password        = document.getElementById("reg-password").value;
      var confirmPassword = document.getElementById("reg-confirm").value;
      var msgEl           = document.getElementById("register-msg");
      var btn             = document.querySelector("#register-form button[type='submit']");

      msgEl.innerHTML = "";

      if (!fullName) {
        msgEl.innerHTML = "<div class='alert-error'>Full name is required.</div>"; return;
      }
      if (!phone || !/^01\d{9}$/.test(phone)) {
        msgEl.innerHTML = "<div class='alert-error'>Phone must be 11 digits starting with 01 (e.g. 01712345678).</div>"; return;
      }
      if (!gender) {
        msgEl.innerHTML = "<div class='alert-error'>Please select a gender.</div>"; return;
      }
      if (password.length < 6) {
        msgEl.innerHTML = "<div class='alert-error'>Password must be at least 6 characters.</div>"; return;
      }
      if (password !== confirmPassword) {
        msgEl.innerHTML = "<div class='alert-error'>Passwords do not match.</div>"; return;
      }

      btn.textContent = "Creating account...";
      btn.disabled = true;

      var res = await Auth.register(fullName, phone, password, gender);

      btn.textContent = "Create Account";
      btn.disabled = false;

      if (res.error) {
        msgEl.innerHTML = "<div class='alert-error'>" + res.error + "</div>";
        return;
      }

      msgEl.innerHTML = "<div class='alert-success'>Account created! Redirecting to login...</div>";
      setTimeout(function () { window.location.href = "/"; }, 1500);
    });
  }

});
