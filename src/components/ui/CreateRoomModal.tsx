import React from "react";

enum RoomType {
  Public = 'public',
  Private = 'private'
}

type MaxMember = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

interface JoinRoomOptions {
  roomType: RoomType;
  maxMember: MaxMember;
}

const roomOptions = {
  type: [RoomType.Public, RoomType.Private],
  maxMember: [2, 3, 4, 5, 6, 7, 8, 9, 10] as MaxMember[]
}

interface CreateRoomModalProps {
  joinRoomOptions: JoinRoomOptions;
  setJoinRoomOptions: React.Dispatch<React.SetStateAction<JoinRoomOptions>>;
  onCreateRoom: () => void;
  roomID: string | null;
  loading: boolean;
  setRoomID: React.Dispatch<React.SetStateAction<string | null>>;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ joinRoomOptions, setJoinRoomOptions, onCreateRoom, roomID, loading, setRoomID }) => {
  const handleRoomTypeChange = (type: RoomType) => {
    setJoinRoomOptions((prevOptions) => ({
      ...prevOptions,
      roomType: type
    }));
  };

  const handleMaxMemberChange = (members: MaxMember) => {
    setJoinRoomOptions((prevOptions) => ({
      ...prevOptions,
      maxMember: members
    }));
  };

  return (
    <dialog id="create-room-modal" className="modal">
      <div className="modal-box w-11/12 max-w-5xl">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        ) : roomID ? (
          <div className="text-center">
            <h3 className="font-bold text-lg">Room Created</h3>
            <p className="py-4">Your room has been created successfully!</p>
            <div>
              
            </div>
            <p className="text-2xl font-semibold">Room ID: {roomID}</p>
            <button className="btn btn-secondary mt-4" onClick={() => setRoomID(null)}>Create New One</button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-lg">Create a Room</h3>
            <p className="py-4">Create Your Room for Sudoku The Great</p>

            <div role="tablist" className="tabs tabs-boxed">
              {
                roomOptions.type.map((type) => (
                  <a 
                    role="tab" 
                    className={`tab ${joinRoomOptions.roomType === type ? 'tab-active' : ''}`} 
                    onClick={() => handleRoomTypeChange(type)}
                    key={type}
                  >
                    {type}
                  </a>
                ))
              }
            </div>

            <div role="tablist" className="tabs tabs-boxed my-4">
              {
                roomOptions.maxMember.map((member) => (
                  <a 
                    role="tab" 
                    className={`tab ${joinRoomOptions.maxMember === member ? 'tab-active' : ''}`} 
                    onClick={() => handleMaxMemberChange(member as MaxMember)}
                    key={member}
                  >
                    {member}
                  </a>
                ))
              }
            </div>
            <div className="flex justify-center mt-16">
              <button className="btn btn-primary" onClick={onCreateRoom}>Create Room</button>
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
}

export default CreateRoomModal;
