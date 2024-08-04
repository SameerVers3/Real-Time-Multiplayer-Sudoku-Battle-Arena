import React, { useState } from "react";


const WinModal: React.FC = ({}) => {


  return (
    <dialog id="win-room-modal" className="modal">
      <div className="modal-box w-11/12 max-w-5xl">
        hehe boi
        <div className="modal-action">
          <form method="dialog">
            <button className="btn">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default WinModal;
