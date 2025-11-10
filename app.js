// Simple Account Manager (React 18 via CDN)
// - Single file app to keep things simple
// - Hash-based routing (no external router)
// - localStorage "database" (users) and session (current user)

const { useEffect, useMemo, useState } = React;

// -----------------------------
// Storage utilities (localStorage)
// -----------------------------
const STORAGE_KEYS = {
  users: "app.users",
  session: "app.session",
};

function readUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.users);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.session);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeSession(session) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEYS.session);
  } else {
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  }
}

// -----------------------------
// Tiny router using location.hash
// -----------------------------
const ROUTES = {
  login: "#/login",
  register: "#/register",
  account: "#/account",
};

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash || ROUTES.login);
  useEffect(() => {
    const handler = () => setHash(window.location.hash || ROUTES.login);
    window.addEventListener("hashchange", handler);
    if (!window.location.hash) window.location.hash = ROUTES.login;
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  return hash;
}

function navigate(to) {
  window.location.hash = to;
}

// -----------------------------
// Helpers
// -----------------------------
function validateEmail(email) {
  // Extremely simple email check; good enough for demo
  return typeof email === "string" && email.includes("@") && email.includes(".");
}

function safeTrim(value) {
  return (value || "").toString().trim();
}

// -----------------------------
// Components
// -----------------------------
function Header({ session }) {
  const currentRoute = window.location.hash || ROUTES.login;
  return (
    React.createElement("div", { className: "header" },
      React.createElement("div", { className: "brand" },
        React.createElement("div", { className: "logo" }),
        React.createElement("div", { className: "brand-title" }, "Account Manager")
      ),
      React.createElement("nav", { className: "nav" },
        React.createElement("a", {
          className: `link ${currentRoute === ROUTES.login ? "active" : ""}`,
          href: ROUTES.login
        }, "Login"),
        React.createElement("a", {
          className: `link ${currentRoute === ROUTES.register ? "active" : ""}`,
          href: ROUTES.register
        }, "Register"),
        session ? React.createElement("a", {
          className: `link ${currentRoute === ROUTES.account ? "active" : ""}`,
          href: ROUTES.account
        }, "My Account") : null
      )
    )
  );
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const eMail = safeTrim(email).toLowerCase();
    const pass = safeTrim(password);
    if (!validateEmail(eMail)) {
      setError("Please enter a valid email.");
      return;
    }
    if (pass.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    setIsLoading(true);
    // Simulate lightweight async
    setTimeout(() => {
      const users = readUsers();
      const user = users.find(u => u.email === eMail && u.password === pass);
      if (!user) {
        setIsLoading(false);
        setError("Invalid email or password.");
        return;
      }
      writeSession({ email: user.email });
      setIsLoading(false);
      onLogin(user);
      navigate(ROUTES.account);
    }, 300);
  }

  return (
    React.createElement("div", { className: "card" },
      React.createElement(Header, { session: readSession() }),
      React.createElement("h2", null, "Login"),
      error && React.createElement("div", { className: "error" }, error),
      React.createElement("form", { onSubmit: handleSubmit },
        React.createElement("div", { className: "row" },
          React.createElement("label", null, "Email"),
          React.createElement("input", {
            type: "email",
            autoComplete: "username",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            placeholder: "you@example.com",
            required: true
          })
        ),
        React.createElement("div", { className: "row" },
          React.createElement("label", null, "Password"),
          React.createElement("input", {
            type: "password",
            autoComplete: "current-password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            placeholder: "••••",
            required: true
          })
        ),
        React.createElement("div", { className: "actions" },
          React.createElement("button", { type: "button", className: "link", onClick: () => navigate(ROUTES.register) }, "Create account"),
          React.createElement("button", { className: "primary", type: "submit", disabled: isLoading }, isLoading ? "Signing in…" : "Sign in")
        )
      ),
      React.createElement("div", { className: "footer" }, "Demo app. Data is stored in your browser only.")
    )
  );
}

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const fullName = safeTrim(name);
    const eMail = safeTrim(email).toLowerCase();
    const pass = safeTrim(password);
    const conf = safeTrim(confirm);

    if (fullName.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (!validateEmail(eMail)) {
      setError("Please enter a valid email.");
      return;
    }
    if (pass.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    if (pass !== conf) {
      setError("Passwords do not match.");
      return;
    }
    const users = readUsers();
    if (users.some(u => u.email === eMail)) {
      setError("An account with this email already exists.");
      return;
    }
    const newUser = { name: fullName, email: eMail, password: pass };
    writeUsers([...users, newUser]);
    setSuccess("Registration successful. You can now log in.");
    setName(""); setEmail(""); setPassword(""); setConfirm("");
  }

  return (
    React.createElement("div", { className: "card" },
      React.createElement(Header, { session: readSession() }),
      React.createElement("h2", null, "Register"),
      React.createElement("div", { className: "note" }, "Passwords are stored in plain text for demo simplicity. Do not use real credentials."),
      React.createElement("form", { onSubmit: handleSubmit },
        React.createElement("div", { className: "row" },
          React.createElement("label", null, "Full name"),
          React.createElement("input", {
            value: name,
            onChange: (e) => setName(e.target.value),
            placeholder: "Jane Doe",
            required: true
          })
        ),
        React.createElement("div", { className: "row" },
          React.createElement("label", null, "Email"),
          React.createElement("input", {
            type: "email",
            autoComplete: "username",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            placeholder: "you@example.com",
            required: true
          })
        ),
        React.createElement("div", { className: "row" },
          React.createElement("label", null, "Password"),
          React.createElement("input", {
            type: "password",
            autoComplete: "new-password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            placeholder: "••••",
            required: true
          })
        ),
        React.createElement("div", { className: "row" },
          React.createElement("label", null, "Confirm password"),
          React.createElement("input", {
            type: "password",
            autoComplete: "new-password",
            value: confirm,
            onChange: (e) => setConfirm(e.target.value),
            placeholder: "••••",
            required: true
          })
        ),
        React.createElement("div", { className: "actions" },
          React.createElement("button", { type: "button", onClick: () => navigate(ROUTES.login) }, "Back to login"),
          React.createElement("button", { className: "success", type: "submit" }, "Create account")
        ),
        React.createElement("div", null,
          error && React.createElement("div", { className: "error" }, error),
          !error && success && React.createElement("div", { className: "success-text" }, success)
        )
      )
    )
  );
}

function AccountPage({ session, onLogout }) {
  const [profile, setProfile] = useState(() => {
    const users = readUsers();
    const user = session ? users.find(u => u.email === session.email) : null;
    return user ? { ...user } : null;
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const users = readUsers();
    const user = session ? users.find(u => u.email === session.email) : null;
    setProfile(user ? { ...user } : null);
  }, [session]);

  if (!session || !profile) {
    return (
      React.createElement("div", { className: "card" },
        React.createElement(Header, { session }),
        React.createElement("div", { className: "error" }, "You must be logged in to view this page."),
        React.createElement("div", { className: "actions" },
          React.createElement("button", { onClick: () => navigate(ROUTES.login) }, "Go to login")
        )
      )
    );
  }

  function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const fullName = safeTrim(profile.name);
    const pass = safeTrim(profile.password);
    if (fullName.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (pass.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    const users = readUsers();
    const idx = users.findIndex(u => u.email === session.email);
    if (idx === -1) {
      setError("User not found.");
      return;
    }
    users[idx] = { ...users[idx], name: fullName, password: pass };
    writeUsers(users);
    setSuccess("Account updated.");
  }

  function handleField(field, value) {
    setProfile(prev => ({ ...prev, [field]: value }));
  }

  return (
    React.createElement("div", { className: "card" },
      React.createElement(Header, { session }),
      React.createElement("h2", null, "My Account"),
      React.createElement("form", { onSubmit: handleSave },
        React.createElement("div", { className: "row" },
          React.createElement("label", null, "Email (read only)"),
          React.createElement("input", { value: profile.email, disabled: true })
        ),
        React.createElement("div", { className: "row" },
          React.createElement("label", null, "Full name"),
          React.createElement("input", {
            value: profile.name,
            onChange: (e) => handleField("name", e.target.value)
          })
        ),
        React.createElement("div", { className: "row" },
          React.createElement("label", null, "Password"),
          React.createElement("input", {
            type: "password",
            value: profile.password,
            onChange: (e) => handleField("password", e.target.value)
          })
        ),
        React.createElement("div", { className: "actions" },
          React.createElement("button", { className: "primary", type: "submit" }, "Save changes"),
          React.createElement("button", { className: "danger", type: "button", onClick: onLogout }, "Log out")
        ),
        React.createElement("div", null,
          error && React.createElement("div", { className: "error" }, error),
          !error && success && React.createElement("div", { className: "success-text" }, success)
        )
      )
    )
  );
}

function App() {
  const [session, setSession] = useState(() => readSession());
  const route = useHashRoute();

  // Auto-redirect to account if already logged in and tries to go to login/register
  useEffect(() => {
    if (session && (route === ROUTES.login || route === ROUTES.register)) {
      navigate(ROUTES.account);
    }
  }, [session, route]);

  function handleLogout() {
    writeSession(null);
    setSession(null);
    navigate(ROUTES.login);
  }

  function handleLogin(user) {
    setSession({ email: user.email });
  }

  let page = null;
  if (route === ROUTES.login) {
    page = React.createElement(LoginPage, { onLogin: handleLogin });
  } else if (route === ROUTES.register) {
    page = React.createElement(RegisterPage);
  } else if (route === ROUTES.account) {
    page = React.createElement(AccountPage, { session, onLogout: handleLogout });
  } else {
    page = React.createElement("div", { className: "card" },
      React.createElement(Header, { session }),
      React.createElement("div", null, "Not found"),
      React.createElement("div", { className: "actions" },
        React.createElement("button", { onClick: () => navigate(ROUTES.login) }, "Go Home")
      )
    );
  }

  return React.createElement("div", { className: "app" }, page);
}

// Mount React app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));


