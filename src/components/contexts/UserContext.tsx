import {createContext, ReactNode, useContext, useReducer} from "react";
import { User, signOut, getAuth } from "firebase/auth";

type AuthActions = { type: 'SIGN_IN', payload: { user: User } } | {type: 'SIGN_OUT'}

type AuthState = {
  state: 'SIGNED_IN'
  currentUser: User;
} | {
  state: 'SIGNED_OUT'
} | {
  state: 'UNKNOWN'
};

const AuthReducer = (state: AuthState, action: AuthActions): AuthState => {
  switch (action.type) {
    case "SIGN_IN":
      return {
        state: 'SIGNED_IN',
        currentUser: action.payload.user,
      };
      break
    case "SIGN_OUT":
      return {
        state: 'SIGNED_OUT',
      }
  }
}

type AuthContextProps = {
  state: AuthState
  dispatch: (value: AuthActions) => void
}

export const AuthContext = createContext<AuthContextProps>({ state: { state: 'UNKNOWN' }, dispatch: (val) => {
  } });

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(AuthReducer, { state: 'UNKNOWN' })

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuthState = () => {
  const { state } = useContext(AuthContext);
  return {
    state,
  };
};

const useSignIn = () => {
  const {dispatch} = useContext(AuthContext)
  return {
    signIn: (user: User) => {
      dispatch({type: "SIGN_IN", payload: {user}})
    }
  }
}

const useSignOut = () => {
  const {dispatch} = useContext(AuthContext)

  const signOutUser = async () => {
    try {
      await signOut(getAuth()); // Use signOut directly from the Firebase v9+ API
      console.log("done sir")
      dispatch({ type: "SIGN_OUT" });
      // Optionally, add logic to navigate to a login or home page
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return { signOut: signOutUser };
}

export { useAuthState, useSignIn, useSignOut, AuthProvider };
