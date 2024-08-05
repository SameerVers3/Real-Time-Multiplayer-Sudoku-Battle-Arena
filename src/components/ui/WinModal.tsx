import React, { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import coin from "../../assets/coin.png";

type WinModalProps = {
  isWinner: boolean;
  coin: number;
};

const WinModal: React.FC<WinModalProps> = ({isWinner, coin}) => {
  console.log("hehe");
  return (
    <dialog id="win-room-modal" className="modal">
      <div className="modal-box w-11/12 max-w-5xl">
        <div>
          <button className="btn">
          <IoIosArrowBack /> Back to Home Page
          </button>

          {
            isWinner ? 
            (
              <div>
                <img src={coin} alt="image" />
                <h2 className="text-2xl font-bold">Congratulations!</h2>
                <p>You have successfully completed the room.</p>
              </div>
            ) :
            (
              <div>
                <h2 className="text-2xl font-bold">Game Over!</h2>
                <p>You have failed to complete the room.</p>
              </div>
            )
          }
          

        </div>
        
      </div>
    </dialog>
  );
};

export default WinModal;
