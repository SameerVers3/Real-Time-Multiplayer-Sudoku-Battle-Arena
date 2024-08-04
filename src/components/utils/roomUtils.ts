// src/utils/roomUtils.ts

import { collection, getDoc, getDocs, query, updateDoc, where, arrayUnion, FieldValue } from "firebase/firestore";
import { Firestore } from "firebase/firestore";
import { useFirestore } from "~/lib/firebase";

export const validateAndUpdateRoom = async (
  roomId: string,
  userId: string,
  userName: string | null,
  photoURL: string | null,
  setMaxMember?: (maxMember: number | undefined) => void
): Promise<{ success: boolean; message: string }> => {
  const firestore = useFirestore();
  const roomsCollection = collection(firestore, "Rooms");
  const roomsQuery = query(roomsCollection, where("roomCode", "==", roomId));
  const querySnapshot = await getDocs(roomsQuery);

  if (querySnapshot.empty) {
    return { success: false, message: "No matching room found." };
  }

  const roomDocRef = querySnapshot.docs[0].ref;
  const roomDoc = await getDoc(roomDocRef);
  const roomData = roomDoc.data();

  if (!roomData?.isActive) {
    return {
      success: false,
      message: "Room Expired"
    }
  }

  // Retrieve maxMember and joinedBy
  const maxMember = roomData?.maxMember;
  if (setMaxMember) {
    setMaxMember(maxMember);
  }
  const joinedBy = roomData?.joinedBy || [];
  const currentMembersCount = joinedBy.length;

  if (maxMember === undefined) {
    return { success: false, message: "Max members limit is not defined in the room document." };
  }

  // Check if the user already exists in the joinedBy array
  const userExists = joinedBy.some((user: { userId: string }) => user.userId === userId);

  if (currentMembersCount >= maxMember && !userExists) {
    return { success: false, message: "Room has reached the maximum number of members." };
  }

  // Update the room document
  const updateData: { joinedBy: FieldValue; currentMembers?: FieldValue } = {
    joinedBy: arrayUnion({ userId, userName, photoURL })
  };

  await updateDoc(roomDocRef, updateData);
  return { success: true, message: "Document updated successfully." };
};
