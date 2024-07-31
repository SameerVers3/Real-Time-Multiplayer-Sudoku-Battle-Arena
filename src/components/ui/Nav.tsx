import react from "react"



const Nav = () => { 

  const handleLogout = () => {



  }

  return (
    <nav className="border p-2 px-12 flex items-center justify-between">
      <div className="flex justify-between items-center border w-full">
        <div className="text-2xl">
          Sudoku
        </div>

        <div>
          Linkssssssssss
        </div>

        <div>
        <div className="dropdown dropdown-hover">
          <div className="avatar h-12 w-12">
            <div className="w-24 rounded-full">
              <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            </div>
          </div>

          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            <li><a>Logout</a></li>
            {/* <li><a>Item 2</a></li> */}
          </ul>
          
        </div>

          
        </div>
      </div>
    </nav>
  )

}

export default Nav