# Login & Signup API - Quick Start Guide

## 📋 What's Been Created

### Backend Files (Frappe)
- **`franchise_crm/api/auth_api.py`** - API endpoints for login, signup, logout, and get current user
- **`franchise_crm/api/__init__.py`** - Package initialization file
- **`hooks.py`** - Updated with auth configuration

### Frontend Files (React/TypeScript)
- **`src/lib/api/auth.ts`** - API client functions for authentication
- **`src/hooks/useAuth.ts`** - Custom React hook for authentication state management
- **`src/pages/LoginPage.tsx`** - Pre-built login page component
- **`src/pages/SignupPage.tsx`** - Pre-built signup page component
- **`src/components/ProtectedRoute.tsx`** - Route protection components
- **`.env.example`** - Environment configuration template
- **`routing-example.tsx`** - Example routing configuration

### Documentation
- **`AUTHENTICATION_API.md`** - Comprehensive API documentation
- **`QUICK_START.md`** - This file

---

## 🚀 Quick Setup

### Step 1: Backend Configuration (Frappe)

1. **Restart Frappe backend**:
   ```bash
   cd /Users/deepakkumar/frappe-bench
   bench restart
   ```

2. **Verify API endpoints** are accessible:
   ```bash
   # From another terminal, test the API
   curl -X POST http://localhost:8000/api/method/franchise_crm.api.auth_api.get_current_user
   ```

### Step 2: Frontend Configuration (React)

1. **Copy environment variables**:
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` if needed** (default should work for local development):
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. **Install dependencies** (if not already done):
   ```bash
   cd /Users/deepakkumar/FranchiseCRM/FranchiseCRM
   npm install
   ```

### Step 3: Integrate Routes

Update your main `App.tsx` or routing file to use the authentication:

```typescript
import AppRouting from '@/routing-example';

function App() {
  return <AppRouting />;
}

export default App;
```

---

## 💡 Usage Examples

### Basic Login
```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Navigate to dashboard
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button disabled={isLoading}>{isLoading ? 'Logging in...' : 'Login'}</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

### Protected Route
```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardPage from '@/pages/DashboardPage';

<Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
```

### Check Authentication Status
```typescript
const { user, isAuthenticated, isLoading } = useAuth();

if (isLoading) return <div>Loading...</div>;
if (isAuthenticated) return <div>Welcome {user?.full_name}!</div>;
return <div>Please login</div>;
```

---

## 🔐 API Endpoints

All endpoints are under the base URL: `http://localhost:8000/api/method/franchise_crm.api.auth_api`

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/login` | POST | No | User login with email & password |
| `/signup` | POST | No | Create new user account |
| `/logout` | POST | Yes | Logout current user |
| `/get_current_user` | GET | Yes | Get current authenticated user |

---

## 🧪 Testing

### Test Login Endpoint
```bash
curl -X POST http://localhost:8000/api/method/franchise_crm.api.auth_api.login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  -c cookies.txt
```

### Test Get Current User
```bash
curl http://localhost:8000/api/method/franchise_crm.api.auth_api.get_current_user \
  -b cookies.txt
```

---

## ⚙️ Configuration

### Backend Configuration (Optional)

If you need to customize the API behavior, edit `franchise_crm/api/auth_api.py`:

- **Password requirements**: Modify the length check in `signup()` function
- **User fields**: Add/remove fields in user creation
- **Response format**: Customize the returned data structure

### Frontend Configuration

Update `src/lib/api/auth.ts` to:
- Change API base URL (already in `.env`)
- Add custom headers
- Modify error handling
- Add additional API calls

---

## 🐛 Troubleshooting

### Issue: "API not found" Error
- ✅ Restart Frappe backend: `bench restart`
- ✅ Verify file path: `franchise_crm/api/auth_api.py` exists
- ✅ Check file has proper imports

### Issue: CORS Errors
- ✅ Add to Frappe site config:
  ```python
  cors_allowed_origins = ["http://localhost:5173", "http://localhost:3000"]
  ```
- ✅ Restart Frappe backend

### Issue: Session Not Persisting
- ✅ Check browser cookies are enabled
- ✅ Verify `credentials: 'include'` in API calls
- ✅ Check localStorage for session_id

### Issue: "Invalid email or password"
- ✅ Verify user exists in Frappe User DocType
- ✅ Check password is correct
- ✅ Ensure user is enabled (enabled field = 1)

---

## 📝 Next Steps

1. **Customize Login/Signup Pages**: Modify `LoginPage.tsx` and `SignupPage.tsx` with your branding
2. **Add Password Reset**: Create forgot password functionality
3. **Add 2FA**: Implement two-factor authentication
4. **Add Social Auth**: Integrate Google, GitHub, or other OAuth providers
5. **Add Profile Management**: Create user profile/settings pages
6. **Add Role-based Access**: Implement permission checking based on user roles

---

## 📚 File Structure

```
Frontend:
├── src/
│   ├── lib/api/
│   │   └── auth.ts              # API client functions
│   ├── hooks/
│   │   └── useAuth.ts           # Auth hook
│   ├── pages/
│   │   ├── LoginPage.tsx        # Login page
│   │   └── SignupPage.tsx       # Signup page
│   └── components/
│       └── ProtectedRoute.tsx    # Route protection
├── .env                          # Environment variables
├── .env.example                  # Example env file
└── AUTHENTICATION_API.md         # Detailed API docs

Backend:
└── franchise_crm/
    ├── api/
    │   ├── __init__.py
    │   └── auth_api.py          # API endpoints
    └── hooks.py                 # Updated with auth config
```

---

## ✅ Verification Checklist

- [ ] Backend API file created without syntax errors
- [ ] Frappe backend restarted
- [ ] `.env` file created with correct API URL
- [ ] Frontend components imported correctly
- [ ] Routes configured in main App component
- [ ] Test login/signup in browser
- [ ] Session persists across page refreshes
- [ ] Protected routes redirect unauthenticated users

---

## 🎉 You're All Set!

Your login and signup API is now ready for use. Start by:

1. Running your Frappe backend: `bench start`
2. Running your frontend: `npm run dev`
3. Navigating to `http://localhost:5173/login`
4. Creating a new account or logging in

For detailed API documentation, see [AUTHENTICATION_API.md](./AUTHENTICATION_API.md)
