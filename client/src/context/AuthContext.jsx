import { createContext, useState, useEffect, useContext } from 'react';
import { Amplify } from 'aws-amplify';
import { signIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { cognitoConfig } from '../aws-config';

// 1. Initialize Amplify with your configuration
Amplify.configure(cognitoConfig);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // The current logged-in user object
  const [userRole, setUserRole] = useState(null); // The user's role: 'CLIENT' / 'CPA' / 'ADMIN'
  const [loading, setLoading] = useState(true);   // Loading state for initial auth check

  // Check if the user is already signed in (runs on page load/refresh)
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();

       // DEBUG: Log the full session object
    console.log('Session Object:', session);
    console.log('Access Token Payload:', session.tokens?.accessToken?.payload);


      // Extract groups
    const groups = session.tokens?.accessToken?.payload['cognito:groups'] || [];
    console.log('Extracted Groups:', groups); // <-- THIS WILL SHOW WHAT GROUPS ARE FOUND
      
      // Determine role based on group membership
      const role = groups.includes('ADMIN') ? 'ADMIN'
                 : groups.includes('CPA') ? 'CPA'
                 : 'CLIENT'; // Default fallback if no group found
      console.log('Detected Role:', role); // <-- THIS WILL SHOW THE FINAL ROLE

      setUser(currentUser);
      setUserRole(role);
    } catch (error) {
      console.log('Not signed in');
      setUser(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      if (isSignedIn) {
        await checkUser(); // Update global state after successful login
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw error so the Login Page can handle/display it
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userRole, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);// Custom hook to use the AuthContext easily
