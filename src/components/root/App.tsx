import {HelmetProvider} from "react-helmet-async";
import {AuthProvider} from "~/components/contexts/UserContext";
import Main from "~/components/root/Main";
import { initializeFirebase } from '../../lib/firebase';

initializeFirebase();

export const App = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Main />
      </AuthProvider>
    </HelmetProvider>
  )
};
