import { Router } from "~/components/router/Router";
import { initializeFirebase } from "~/lib/firebase";
import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useSignIn, useSignOut } from "~/components/contexts/UserContext";

function Main() {
  const { signIn } = useSignIn();
  const { signOut } = useSignOut();
  useEffect(() => {
    initializeFirebase();

    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
      console.log(user);
      if (user) {
        signIn(user);
      } else {
        signOut();
      }
    });
  }, []);
  return (
    <main>
      <Router />
    </main>
  );
}

export default Main;
