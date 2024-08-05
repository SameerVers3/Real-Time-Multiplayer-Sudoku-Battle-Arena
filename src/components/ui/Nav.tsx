import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthState, useSignOut, useTheme } from "../contexts/UserContext";
import NavCoin from "./NavCoin";

const Nav = () => {
  const { state } = useAuthState();
  const { signOut } = useSignOut();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    signOut();
  };

  const handleThemeChange = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const links = [
    { link: "/challenge", name: "Challenge", icon: "" },
    { link: "/play", name: "Play", icon: "" },
  ];

  return (
    <nav className="p-1 px-12 flex items-center justify-between">
      <div className="flex justify-between items-center w-full">
        <a className="text-2xl" href="/">
          Sudoku
          {/* <img src={coin} alt="coin" className="w-10 h-10" /> */}
        </a>
        <NavCoin />
        <div>
          {links.map((link) => (
            <Link key={link.link} to={link.link} className="hover:text-blue-500">
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex gap-4 justify-center items-center">
          {state.state === "SIGNED_IN" ? (
            <div className="flex items-center gap-2">
              <div>{state.currentUser.displayName}</div>
              <div className="dropdown dropdown-hover dropdown-end">
                <div className="avatar h-12 w-12">
                  <div className="w-24 rounded-full">
                    <img src={state.currentUser.photoURL ?? ""} alt="User Avatar" />
                  </div>
                </div>

                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                >
                  <li>
                    <button onClick={handleLogout}>Logout</button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div>Login / Sign in</div>
          )}

          <div>
            <label className="swap swap-rotate">
              <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={handleThemeChange}
                className="theme-controller"
              />

              {/* sun icon */}
              <svg
                className="swap-off h-10 w-10 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24">
                <path
                  d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
              </svg>

              {/* moon icon */}
              <svg
                className="swap-on h-10 w-10 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24">
                <path
                  d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
              </svg>
            </label>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
