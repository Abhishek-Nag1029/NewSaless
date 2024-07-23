"use client"
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import "../pages/globals.css"
import AdminRegister from "../components/AdminRegister"
import MasterCandidate from '../components/MasterCandidate';
import Head from 'next/head'

const master_admin = () => {
    const [toggle, setToggle] = useState("Candidate")
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [loading, setLoading] = useState(false)


    useEffect(() => {
        const checkToken = async () => {
            const token = sessionStorage.getItem("masterToken");
            setIsAuthorized(!!token); // Set authorized to true if token exists
            setLoading(false)
        };

        checkToken();
    }, []);

    if (loading) {
        return <div className='flex justify-center items-center min-h-screen'>
            <p>Loading...</p>
        </div>;
    }

    return <>
        <Head>
            <title>Master Admin Dashboard</title>
            <link rel="icon" type="image/png" sizes="16x6" href="/1.png" />
        </Head>

        {
            isAuthorized ? <div className='min-h-screen bg-slate-100 w-full  '>
                <div className='flex justify-between items-center gap-2 p-3 text-white bg-slate-800'>
                    <div>
                        <p className='text-lg  p-2 rounded-md  border border-dashed'>Master Admin</p>
                    </div>
                    <div className='flex justify-end items-center gap-2 p-3 cursor-pointer' >
                        <p className={`${toggle === "register" ? 'text-blue-600 text-lg' : 'text-white'}`} onClick={e => setToggle("register")}>Register</p>
                        <p className={`${toggle === "Candidate" ? 'text-blue-600 text-lg' : 'text-white'}`} onClick={e => setToggle("Candidate")}>Candidate</p>
                    </div>
                </div>

                <div className='h-full'>
                    {
                        toggle === "register" ? <AdminRegister /> : toggle === "Candidate" ? < MasterCandidate /> : ""
                    }
                </div>

            </div >
                : <div className='min-h-screen flex gap-2 justify-center items-center font-semibold text-2xl'>
                    <p>Access Denied.</p>
                    <Link className='text-blue-600' href={'/login'}>Please Login.</Link>
                </div>
        }


    </>
}

export default master_admin