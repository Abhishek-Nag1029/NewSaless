"use client"
import React from 'react'
import './globals.css'
import Image from 'next/image'
import logo from "../assets/1.png"
import Link from "next/link"
const internship = () => {
    return <>
        <div className='min-h-screen w-full bg-white p-4 shadow-xl'>
            <div className=' relative h-[8rem] sm:h-[10rem]  md:h-[20rem]  bg-pink-400  text-slate-50 flex items-center justify-center gap-4'>
            <Image
                    src={logo}
                    width={100}
                    height={20}
                    className='shadow-2xl h-10 md:h-[5rem] w-10 md:w-[4rem] shadow-white rounded-full '
                    alt="Firelama logo"
                    priority
                />
                <p className='text-xl md:text-3xl font-medium text-slate-200'>MegSoft</p>
            </div>


           <div className='flex justify-center items-center'>
           <div className='absolute md:static  top-[18%]  sm:top-[20%] md:top-0 left-[8%] sm:left-[25%] md:left-[20%]  shadow-2xl  rounded-md   '>
                <form action="">
                <div  className=' h-full sm:h-[20rem] md:h-[25rem] w-[20rem] sm:w-[25rem]  md:w-[30rem] flex flex-col justify-center gap-4  border-2 rounded-md bg-white p-4 '>
                    <p className='text-lg md:text-2xl font-semibold'>Student Partner <span className='text-green-500'>Internship</span> Program</p>

                    <p className='font-medium text-xs md:text-base'>Enter your referral code in the box below to share your details and get your stipend</p>
                    <div>
                      <input type="text" className="w-full rounded-lg p-2 border" id="name" placeholder="Enter Your Referral code" required/>
                    </div>
                    <div>
                        <button type='submit' className='w-full bg-pink-400 text-black  text-xs md:text-base p-2 rounded-md'>Click  here to share your payment  details</button>
                    </div>
                    <Link href={'/'} className='text-xs md:text-base'>
                        Don't know your referral code? click her
                    </Link>
                </div>
                </form>
            </div>
           </div>

        </div>

    </>
}

export default internship