import react from "react"
import { Link } from "react-router-dom"
import {useAuthState, useSignOut} from "../contexts/UserContext"

const Nav = () => { 

  const links = [
    {
      link: "/challenge",
      name: "Challenge",
      icon: ""
    },
    {
      link: "/play",
      name: "Play",
      icon: ""
    }
  ]

  const {state} = useAuthState();
  const { signOut } = useSignOut();

  const handleLogout = () => {
    signOut();
  }

  return (
    <nav className="border p-2 px-12 flex items-center justify-between">
      <div className="flex justify-between items-center border w-full">
        <div className="text-2xl">
          Sudoku
        </div>

        <div>
          {
            links.map((link) => {
              return <Link key={link.link} to={link.link} className="hover:text-blue-500">
              {link.name}
            </Link>
            })
          }
        </div>

        <div>

        {
          state.state == "SIGNED_IN" ? 
          <div className="flex items-center gap-2">
            <div>
              {state.currentUser.displayName}
            </div>
            <div className="dropdown dropdown-hover dropdown-end">
              <div className="avatar h-12 w-12">
                <div className="w-24 rounded-full">
                  <img src={state.currentUser.photoURL} />
                </div>
              </div>

              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                <li><button onClick={handleLogout}>Logout</button></li>
                {/* <li><a>Item 2</a></li> */}
              </ul>
              
            </div>
          </div>
          : 
          <div className="">
            Login / Sign in
          </div>
        }

          
        </div>
      </div>
    </nav>
  )

}

export default Nav