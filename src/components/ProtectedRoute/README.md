# ProtectedRoute Component

## Overview
The `ProtectedRoute` component is a security wrapper that protects routes from unauthorized access. It verifies user authentication by checking for the presence of an `access_token` in localStorage before allowing access to protected pages.

## Features
- ✅ **Automatic Authentication Check**: Validates user login status before rendering protected components
- ✅ **Automatic Redirect**: Redirects unauthenticated users to the login page
- ✅ **Seamless Integration**: Works with existing React Router v6 routing structure
- ✅ **Token-based Security**: Checks for access_token stored in localStorage after successful login
- ✅ **History Management**: Uses `replace` navigation to prevent back-button bypass

## How It Works

### Authentication Flow
1. User logs in via the Login component (`/login`)
2. Upon successful authentication, the API returns an access token
3. The token is stored in `localStorage` with the key `'token'`
4. When navigating to any protected route, `ProtectedRoute` checks for the token
5. If token exists: User can access the protected page
6. If token is missing: User is automatically redirected to `/login`

### Token Storage
The component checks for an access token stored with the following key:
```javascript
localStorage.getItem('token')
```

The Login component automatically stores the token after successful authentication:
```javascript
localStorage.setItem('token', data.token); // or data.access_token
```

## Usage

### Basic Usage
Wrap any component that requires authentication with `ProtectedRoute`:

```javascript
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './components/HomePage';

<Route 
  path="/" 
  element={
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  } 
/>
```

### Multiple Protected Routes
You can protect multiple routes by wrapping each one:

```javascript
import ProtectedRoute from './components/ProtectedRoute';

<Routes>
  {/* Public Routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  
  {/* Protected Routes */}
  <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
  <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
</Routes>
```

## Implementation in App.js

The `App.js` file has been updated to protect all routes except authentication pages:

### Public Routes (No Authentication Required)
- `/login` - Login page
- `/login-password` - Password login page
- `/signup` - Registration page

### Protected Routes (Authentication Required)
- `/` - Home page
- `/craft` - Craft page
- `/other-section` - Other section page
- `/choreography` - Choreography page
- `/detailchoreographypage` - Detail choreography page
- `/wishlist` - Wishlist page
- `/notification` - Notifications page
- `/profile` - User profile page
- `/professionalaccount` - Professional account page
- `/profileupate` - Profile update page

## Component Code

### ProtectedRoute Component
```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return token !== null && token !== undefined && token !== '';
  };

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

## Testing the Protection

### Test Scenario 1: Unauthenticated User
1. Clear localStorage (or open in incognito mode)
2. Try to access any protected route (e.g., `http://localhost:3000/`)
3. **Expected Result**: Automatically redirected to `/login`

### Test Scenario 2: Authenticated User
1. Log in successfully through the login page
2. Navigate to any protected route
3. **Expected Result**: Page loads normally

### Test Scenario 3: Manual Token Removal
1. Log in successfully
2. Open browser DevTools → Application → Local Storage
3. Delete the `token` entry
4. Try to navigate to a protected route
5. **Expected Result**: Redirected to `/login`

## Customization

### Changing the Token Key
If your API uses a different key for the access token, update the key in the component:

```javascript
const token = localStorage.getItem('your_custom_token_key');
```

### Adding Additional Checks
You can enhance the authentication logic to include token expiration checks:

```javascript
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  
  if (!token) return false;
  
  if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    return false;
  }
  
  return true;
};
```

### Custom Redirect Path
To redirect to a different page instead of `/login`:

```javascript
return <Navigate to="/custom-login-page" replace />;
```

## Compatibility
- ✅ React Router v6
- ✅ React 16.8+ (Hooks support)
- ✅ All modern browsers
- ✅ Compatible with existing project structure and coding style

## Logout Functionality
To implement logout, simply clear the token from localStorage:

```javascript
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('auth');
  navigate('/login');
};
```

## Security Considerations

### Client-Side Protection Only
⚠️ **Important**: This component provides client-side route protection only. Always implement server-side authentication and authorization for API requests.

### Token Security
- Tokens are stored in localStorage (accessible via JavaScript)
- For sensitive applications, consider using httpOnly cookies
- Always use HTTPS in production
- Implement token expiration and refresh mechanisms

### Best Practices
1. ✅ Always validate tokens on the server side
2. ✅ Use HTTPS for all API communications
3. ✅ Implement token expiration
4. ✅ Add token refresh logic for better UX
5. ✅ Clear tokens on logout

## Troubleshooting

### Issue: Redirect Loop
**Cause**: The login page might be wrapped in ProtectedRoute
**Solution**: Ensure login, signup, and password pages are NOT wrapped in ProtectedRoute

### Issue: Token Exists but Still Redirects
**Cause**: Token value might be an empty string or the key is incorrect
**Solution**: Check localStorage in DevTools → Application tab → Local Storage

### Issue: After Login, Still Redirected to Login Page
**Cause**: Token not being saved properly in Login component
**Solution**: Verify the Login component is storing the token correctly in localStorage

## File Structure
```
src/
├── components/
│   ├── ProtectedRoute/
│   │   ├── index.js          # Main component
│   │   ├── index.css         # Styles (empty - no UI elements)
│   │   └── README.md         # This documentation
│   ├── Login/
│   │   └── index.js          # Stores token on successful login
│   └── ...
└── App.js                     # Routes configuration with ProtectedRoute
```

## Support
For issues or questions, please refer to:
- React Router documentation: https://reactrouter.com/
- Project codebase patterns in existing components
