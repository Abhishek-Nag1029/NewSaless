"use client"
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const Page = ({ params }) => {
    const [candidate, setCandidate] = useState([]);
    const [status, setStatus] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const router = useRouter();

    const handelSendMail = async () => {
        try {
            if (status === "shortlisted") {
                const { data } = await axios.post(`http://localhost:3000/api/candidate/sendemail/${params.id}`);
                if (data.status === 200) {
                    toast.success("Mail sent successfully");
                    setStatus(false);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const { data } = await axios.get(`http://localhost:3000/api/candidate/${params.id}`, {
                    withCredentials: true
                });

                setCandidate([data]);
                setStatus(data.status);
            } catch (error) {
                if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
                    router.push('/login');
                } else {
                    setError('Error fetching data.');
                    console.error('Error fetching candidate data:', error);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [params.id, router]);

    if (isLoading) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <p className='text-lg'>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <p className='text-lg'>{error}</p>
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <p className='text-lg'>Invalid Request Please Login</p>
            </div>
        );
    }

    return (
        <>
            {isLoading ? (
                <div className='flex justify-center items-center h-screen '>
                    <p className='text-lg'>Loading candidates...</p>
                </div>
            ) : (
                <div className='min-h-screen bg-slate-200'>
                    <div className='p-4 bg-slate-50'>
                        <p className='font-bold text-lg sm:text-xl uppercase text-center my-2'>Candidate profile</p>
                    </div>

                    {candidate ? candidate.map(item => (
                        <div key={item._id} className='bg-slate-200 my-4 h-full sm:p-4 mx-4'>
                            <div className='text-end'>
                                {status === "shortlisted" ? (
                                    <button
                                        onClick={handelSendMail}
                                        className='p-2 bg-green-900 text-sm sm:text-base text-white my-3'
                                    >
                                        Request for Resume/CV
                                    </button>
                                ) : ""}
                            </div>

                            <div className='p-1 sm:p-4 md:p-4 bg-slate-300 rounded-md'>
                                <p className='font-semibold'>Name:<span className='mx-2 text-base font-normal text-black'>{item.firstName} {item.lastName}</span></p>
                                <p className='font-semibold'>Status:<span className={`mx-2 text-base font-semibold text-black`}>{item.status}</span></p>
                                <p className='font-semibold'>Admin:<span className={`mx-2 text-base font-medium text-black`}>{item.adminAction}</span></p>
                                <p className='font-semibold'>Time of Update:<span className={`mx-2 text-base font-normal text-black`}>{new Date(item.updatedAt).toLocaleString()}</span></p>
                            </div>
                            <div className='p-1 sm:p-4 md:p-4 bg-slate-300 my-2 rounded-md'>
                                <p className='font-semibold'>Email:<span className='mx-2 text-base font-normal text-black'>{item.email}</span></p>
                                <p className='font-semibold'>Phone:<span className='mx-2 text-base font-normal text-black'>{item.phone}</span></p>
                            </div>
                            <div className='p-1 sm:p-4 md:p-4 bg-slate-300 my-2 rounded-md'>
                                <p className='font-semibold'>State:<span className='mx-2 text-base font-normal text-black'>{item.state}</span></p>
                                <p className='font-semibold'>College:<span className='mx-2 text-base font-normal text-black'>{item.college}</span></p>
                                <p className='font-semibold'>Branch:<span className='mx-2 text-base font-normal text-black'>{item.branch}</span></p>
                                <p className='font-semibold'>Degree:<span className='mx-2 text-base font-normal text-black'>{item.degree}</span></p>
                                <p className='font-semibold'>Passing Year:<span className='mx-2 text-base font-normal text-black'>{item.passingYear}</span></p>
                            </div>
                            <div className='p-1 sm:p-4 md:p-4 bg-slate-300 my-2 h-full rounded-md'>
                                <p className='font-semibold'>Message:</p>
                                <p className='text-gray-800'>{item.message}</p>
                            </div>
                        </div>
                    )) : (
                        <div className='flex justify-center items-center h-screen'>
                            <p className='text-lg'>
                                Loading candidates...
                            </p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default Page;
