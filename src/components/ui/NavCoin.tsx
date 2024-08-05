import React, { useEffect, useState } from "react";
import coin from "../../assets/coin.png";
import { useAuthState, useTheme } from "../contexts/UserContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useFirestore } from "~/lib/firebase";


const NavCoin: React.FC = () => {
  const { theme } = useTheme();
  const { state } = useAuthState();
  const firestore = useFirestore();
  const [coinAmount, setCoinAmount] = useState<number>(0);

  useEffect(() => {
    let unsubscribe = () => {};

    if (state.state === "SIGNED_IN") {
      const user = state.currentUser;
      const userCollection = collection(firestore, "users");
      const userQuery = query(userCollection, where("uid", "==", user.uid));

      // Real-time listener
      unsubscribe = onSnapshot(userQuery, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setCoinAmount(userData.coin);
        }
      });
    }

    // Clean up listener on component unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [firestore, state]);

  return (
    <div
      className={`flex justify-center items-center gap-1 font-bold py-1 px-2 rounded-xl ${
        theme === "dark"
          ? "bg-gray-800 border border-gray-600 text-gray-100"
          : "bg-gray-100 border border-gray-200 text-gray-700"
      }`}
    >
      <h2 className="text-2xl">{coinAmount}</h2>
      <img src={coin} alt="coin" className="w-10 h-10" />
    </div>
  );
};

export default NavCoin;
