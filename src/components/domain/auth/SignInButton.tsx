import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, doc, getDocs, query, setDoc, serverTimestamp, updateDoc, where} from "firebase/firestore";
import { useAuth } from "~/lib/firebase";
import { useFirestore } from "~/lib/firebase"

export const SignInButton = () => {

  const firestore = useFirestore();

  const handleClick = async () => {
    const provider = new GoogleAuthProvider();
    const auth = useAuth();
    // @see https://firebase.google.com/docs/auth/web/google-signin
    auth.languageCode = "ja";

    signInWithPopup(auth, provider)
    .then(async (result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      const user = result.user;

      const userCollection = collection(firestore, "users");
      const userQuery = query(userCollection, where("uid", "==", user.uid));
      const querySnapshot = await getDocs(userQuery);

      if (querySnapshot.empty) {
        // User does not exist, add them
        const userDocRef = doc(userCollection, user.uid);
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdDate: serverTimestamp(), // Set the creation date
          lastLoginDate: serverTimestamp(), // Set the last login date
          lastUpdatedDate: serverTimestamp() // Set the last updated date
          // Add any other user fields you need
        });

        console.log("New user added to Firestore:", user);
      } else {
        const userDocRef = doc(userCollection, user.uid);
        await updateDoc(userDocRef, {
          lastLoginDate: serverTimestamp(), // Update the last login date
        });
        console.log("User already exists in Firestore:", user);
      }

      console.log(user);

    }).catch((error) => {

      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
    });
    
  }

  return (
    <button
      onClick={handleClick}
      type="button"
      className="btn btn-primary normal-case min-w-60"
    >
      Sign In With Google
    </button>
  );
};
