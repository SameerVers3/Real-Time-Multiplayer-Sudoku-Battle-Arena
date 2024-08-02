import React, { useState } from "react";
import CreateRoomModal from "./CreateRoomModal";
import JoinRoomModal from "./JoinRoomModal";
import { useAuthState } from "../contexts/UserContext";
import { collection, doc, setDoc } from "firebase/firestore";
import { useFirestore } from "~/lib/firebase";

export enum RoomType {
  Public = 'public',
  Private = 'private'
}

export type MaxMember = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

const generateRoomCode = (length: number = 6): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  console.log(result);
  return result;
};

const HeroCard: React.FC = () => {
  const [joinRoomOptions, setJoinRoomOptions] = useState<{
    roomType: RoomType;
    maxMember: MaxMember;
  }>({
    roomType: RoomType.Public,
    maxMember: 2
  });

  const [roomID, setRoomID] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { state } = useAuthState();
  const firestore = useFirestore();

  const handleCreateRoom = () => {
    const element = document.getElementById("create-room-modal") as HTMLDialogElement;
    element?.showModal();
  }

  const handleJoinRoom = () => {
    const element = document.getElementById("join-room-modal") as HTMLDialogElement;
    element?.showModal();
  }

  const createRoom = async () => {
    setLoading(true);

    console.log("Room Created with options:", joinRoomOptions);

    if (state.state !== "SIGNED_IN") {
      alert("Please log in first");
      setLoading(false);
      return;
    }

    const user = state.state === "SIGNED_IN" ? state.currentUser?.uid : null;

    if (!user) {
      alert("User ID is not available.");
      setLoading(false);
      return;
    }

    const roomCode = generateRoomCode(); // Generate a unique room code

    const roomCollection = collection(firestore, "Rooms");
    const roomDocRef = doc(roomCollection); // Create a new document reference with auto-generated ID

    await setDoc(roomDocRef, {
      roomCode, // Add the room code to the document
      createdBy: user,
      createdAt: new Date(),
      type: joinRoomOptions.roomType,
      maxMember: joinRoomOptions.maxMember,
      currentMembers: 0, // Initialize with 0 current members
      joinedBy: [] // Initialize with an empty array
    });

    setRoomID(roomCode); // Set the room ID
    setLoading(false);
  };

  return (
    <div className="">
      <div className="card m-4">
        <div className="card-body">
          <h2 className="card-title mx-auto">Welcome to the Game</h2>
          <p>Hello World</p>

          <button className="btn btn-wide">Create Solo Game</button>
          <div className="divider">or</div>
          <button className="btn btn-wide" onClick={handleCreateRoom}>Create a Room</button>
          <button className="btn btn-wide" onClick={handleJoinRoom}>Join a Room</button>
        </div>
      </div>

      <CreateRoomModal 
        joinRoomOptions={joinRoomOptions}
        setJoinRoomOptions={setJoinRoomOptions}
        onCreateRoom={createRoom}
        roomID={roomID}
        loading={loading}
        setRoomID={setRoomID}
      />
      <JoinRoomModal/>
    </div>
  );
}

export default HeroCard;
