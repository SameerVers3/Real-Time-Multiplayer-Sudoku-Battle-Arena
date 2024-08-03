import { createContext, ReactNode, useContext, useReducer, useEffect, useState } from "react";
import { User, signOut, getAuth } from "firebase/auth";

type AuthActions = 
  | { type: 'SIGN_IN', payload: { user: User } } 
  | { type: 'SIGN_OUT' };

type AuthState = 
  | { state: 'SIGNED_IN'; currentUser: User; } 
  | { state: 'SIGNED_OUT'; } 
  | { state: 'UNKNOWN'; };

const AuthReducer = (state: AuthState, action: AuthActions): AuthState => {
  switch (action.type) {
    case "SIGN_IN":
      return {
        state: 'SIGNED_IN',
        currentUser: action.payload.user,
      };
    case "SIGN_OUT":
      return {
        state: 'SIGNED_OUT',
      };
    default:
      return state;
  }
};

type AuthContextProps = {
  state: AuthState;
  dispatch: (value: AuthActions) => void;
  theme: string;
  setTheme: (theme: string) => void;
};

const AuthContext = createContext<AuthContextProps>({
  state: { state: 'UNKNOWN' },
  dispatch: () => {},
  theme: 'light',
  setTheme: () => {}
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(AuthReducer, { state: 'UNKNOWN' });
  const [theme, setTheme] = useState('light');

  // Apply the initial theme when component mounts
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <AuthContext.Provider value={{ state, dispatch, theme, setTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuthState = () => {
  const { state } = useContext(AuthContext);
  return { state };
};

const useSignIn = () => {
  const { dispatch } = useContext(AuthContext);
  return {
    signIn: (user: User) => {
      dispatch({ type: "SIGN_IN", payload: { user } });
    }
  };
};

const useSignOut = () => {
  const { dispatch } = useContext(AuthContext);
  const signOutUser = async () => {
    try {
      await signOut(getAuth()); // Use signOut directly from the Firebase v9+ API
      console.log("done sir");
      dispatch({ type: "SIGN_OUT" });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };
  return { signOut: signOutUser };
};

const useTheme = () => {
  const { theme, setTheme } = useContext(AuthContext);
  return { theme, setTheme };
};

export { useAuthState, useSignIn, useSignOut, useTheme, AuthProvider };
