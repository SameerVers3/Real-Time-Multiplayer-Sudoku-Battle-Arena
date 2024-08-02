import React, { useState } from "react";
import { useFirestore } from "~/lib/firebase";
import { useAuthState } from "../contexts/UserContext";
import { validateAndUpdateRoom } from "../utils/roomUtils";
import { useNavigate } from "react-router-dom";

const JoinRoomModal: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [roomID, setRoomID] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { state } = useAuthState();
  const firestore = useFirestore();
  const navigate = useNavigate();

  const handleJoinRoom = async () => {
    setLoading(true);
    setError(null);

    if (state.state !== "SIGNED_IN") {
      alert("Please log in first");
      setLoading(false);
      return;
    }

    const userId = state.currentUser?.uid;
    const userName = state.currentUser?.displayName || null;
    const photoURL = state.currentUser?.photoURL || null;

    if (!userId) {
      alert("User ID is not available.");
      setLoading(false);
      return;
    }

    try {
      const res = await validateAndUpdateRoom(roomID, userId, userName, photoURL);

      if (res.success) {
        alert(res.message);
        navigate(`/play/${roomID}`);
        setLoading(false);
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error("Failed to join the room:", err);
      setError("Failed to join the room");
    }

    setLoading(false);
  };

  return (
    <dialog id="join-room-modal" className="modal">
      <div className="modal-box w-11/12 max-w-5xl">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-lg">Join a Room</h3>
            <p className="py-4">Join a Private Room or a public random Room</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Room ID To Join"
                className="input input-bordered input-success w-full max-w-xs"
                value={roomID}
                onChange={(e) => setRoomID(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleJoinRoom}>
                Join Room
              </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <div className="divider">OR</div>
            <div className="flex justify-center align-center">
              <button className="btn btn-wide">Join a Random Public Room</button>
            </div>
          </>
        )}
        <div className="modal-action">
          <form method="dialog">
            <button className="btn">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default JoinRoomModal;
