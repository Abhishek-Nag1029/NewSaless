import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router"; // Corrected from 'next/navigation' to 'next/router'
import "./globals.css";
import eye from "../assets/eye.png";

const admin_access = () => {
  const [inpData, setInpData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(false);
  const [toggle, setToggle] = useState(false);

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = {
        email: inpData.email,
        password: inpData.password,
      };
      const result = await axios.post(
        "http://localhost:3000/api/master-admin/access",
        data
      );
      if (result.status === 200) {
        const token = sessionStorage.setItem(
          "masterToken",
          "Master Admin Token granted"
        );
        router.push("/MasterAdmin");
      }
    } catch (error) {
      console.error(
        "An error occurred during login:",
        error.response ? error.response.data : error.message
      );
      console.log(error);
      setError(error.response.data.message);
    }
  };

  return (
    <>
      <div className="h-screen flex flex-col p-2 justify-center items-center bg-slate-100 ">
        <p className="my-3 font-bold"> Admin Access</p>
        <form onSubmit={handleLogin} className="p-10 bg-slate-50 border-2">
          <div className="flex flex-col gap-2 justify-center p-2">
            <label htmlFor="adminEmail" className="font-medium">
              Email
            </label>
            <input
              onChange={(e) =>
                setInpData({ ...inpData, email: e.target.value })
              }
              type="email"
              className="p-2 border-2"
              id="adminEmail"
              placeholder="Enter Your Email"
              required
            />
          </div>
          <div className="flex flex-col gap-2 justify-center p-2">
            <label htmlFor="adminAccess" className="font-medium">
              Password
            </label>
            <div className="w-full border-2">
              <input
                onChange={(e) =>
                  setInpData({ ...inpData, password: e.target.value })
                }
                type={`${toggle ? "text" : "password"}`}
                className="p-2 outline-none"
                id="adminAccess"
                placeholder="Enter Your Password"
                required
              />
              <span
                onClick={(e) => setToggle(!toggle)}
                className="font-semibold p-2 cursor-pointer"
              >
                {" "}
                +
              </span>
            </div>
            <button className="bg-blue-600 text-white py-2">Login</button>
          </div>
          <p className="text-end">{error}</p>
        </form>
      </div>
    </>
  );
};

export default admin_access;
