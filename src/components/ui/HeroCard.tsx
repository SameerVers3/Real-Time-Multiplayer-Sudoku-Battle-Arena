import react from "react"

const data = [
  {
    player: "Sameer",
    time: "Time",
    date: "date",
    status: "lose"
  },
  {
    player: "Sameer",
    time: "Time",
    date: "date",
    status: "lose"
  },
  {
    player: "Sameer",
    time: "Time",
    date: "date",
    status: "lose"
  },
  {
    player: "Sameer",
    time: "Time",
    date: "date",
    status: "lose"
  },
]

const HeroCard = () => {
  return <div className="">
      <div className="card m-4">
        <div className="card-body">
          <h2 className="card-title mx-auto"></h2>
          <p>Hello World</p>

          <button className="btn btn-wide">Create Solo Game</button>
          <div className="divider">or</div>
          <button className="btn btn-wide">Create a Room</button>
          <button className="btn btn-wide">Join a Room</button>
        </div>
      </div>
  </div>
}

export default HeroCard;