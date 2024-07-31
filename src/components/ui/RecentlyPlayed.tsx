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

const RecentlyPlayed = () => {
  return <div className="">
      <div className="card m-4 w-[500px] shadow">
        <div className="card-body">
          <h2 className="card-title mx-auto">Recently Played</h2>
          
          <div className="overflow-x-auto">
            <table className="table">

              <thead>
                <tr>
                  <th></th>
                  <th>Player</th>
                  <th>Time Played</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {
                  data.map((e, index) => {
                    return <tr>
                      <th>{index + 1}</th>
                      <td>{e.player}</td>
                      <td>{e.time}</td>
                      <td>{e.date}</td>
                      <td>{e.status}</td>
                    </tr>
                  })
                }
              </tbody>
            </table>
          </div>

        </div>
      </div>
  </div>
}

export default RecentlyPlayed;