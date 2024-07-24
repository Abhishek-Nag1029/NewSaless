"use client"
import React, { useEffect, useState, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useGetAdminQuery, useUpdateAdminEmailMutation } from '@/app/redux/api/AdminApi';
import Pagination from '../../../components/Pagination';
import { io } from "socket.io-client";
import EditEmail from "../../../components/admin_edit/EditEmail";
import EditPassword from "../../../components/admin_edit/EditPassword";
import { useSelector } from 'react-redux';
import Loading from "../../../components/Loading";

const Page = ({ params }) => {
    const [admin, setAdmin] = useState([]);
    const [edit, setEdit] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        profileCreationDate: "",
        adminId: "",
        id: "",
    });
    const [active, setActive] = useState("Email");
    const [employees, setEmployees] = useState([]);
    const [adminData, setAdminData] = useState();
    const [backData, setBackData] = useState([]);
    const [toggle, setToggle] = useState(false);
    const [check, setCheck] = useState(null);

    const search = useSearchParams();
    const router = useRouter();
    const { data, error, isFetching, isError, status } = useGetAdminQuery(params.id);

    const { adminData: adata } = useSelector(state => state.admin);
    const [updateAdminEmail] = useUpdateAdminEmailMutation();

    const handleLogout = async () => {
        try {
            const response = await axios.post(`http://localhost:3000/api/employee/logout`, {}, {
                withCredentials: true
            });
            toast.success('Logout successful');
            router.push('/login');
        } catch (error) {
            console.error('Error while logging out:', error);
        }
    };

    const socket = useMemo(() => io("http://localhost:3000"), []);
    const adminId = params.id;

    const fetchAdminData = (id) => {
        socket.emit('getAdmin', id);
    };

    useEffect(() => {
        socket.on('adminResponse', (response) => {
            if (response.error) {
                toast.error(`Error: ${response.message}`);
            } else {
                setBackData([response.data]);
            }
        });

        if (adminId) {
            fetchAdminData(adminId);
        }

        return () => {
            socket.off('adminResponse');
        };
    }, [adminId, updateAdminEmail]);

    useEffect(() => {
        if (isError && (error?.status === 401 || error?.status === 403)) {
            router.replace('/login');
        }
    }, [isError, error, router]);

    if (isFetching) {
        return <div className='min-h-screen flex justify-center items-center font-semibold text-2xl'>LOADING...</div>
    } else if (isError) {
        return <div className='min-h-screen flex justify-center items-center font-semibold text-2xl'>Invalid Request Please Login</div>;
    } else if (!data) {
        return <div className='min-h-screen flex justify-center items-center font-semibold text-2xl'>No data available.</div>;
    }

    return (
        <>
            {status === 200 && isFetching ? <Loading /> : (
                <div className='min-h-screen bg-gray-100 p-4'>
                    <p className='md:text-2xl my-2 font-semibold text-center'>Admin Dashboard</p>
                    <div className='bg-slate-50 shadow-lg p-4 md:h-[10rem] rounded-lg mb-4'>
                        {adata && (
                            <div className='flex flex-col md:flex-row md:justify-between md:items-center h-full gap-0 md:gap-4 p-2' key={data.id}>
                                <div className='mb-4 md:mb-0 md:mr-4'>
                                    <div className='flex flex-col'>
                                        <div className='mb-2'>
                                            <span className='md:text-lg font-semibold'>Name:</span>
                                            <span className='md:text-lg'> {adata.firstName} {adata.lastName}</span>
                                        </div>
                                        <div className='mb-2'>
                                            <span className='md:text-lg font-semibold'>Date of joining: </span>
                                            <span className='md:text-lg'>{new Date(adata.createdAt).toLocaleDateString().split('/').reverse().join('-')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex flex-col md:justify-between gap-2 mb-4 md:mb-0'>
                                    <div className='mb-2'>
                                        <span className='md:text-lg font-semibold'>Email: </span>
                                        <span className='md:text-lg'>{adata.email}</span>
                                    </div>
                                    <div>
                                        <span className='md:text-lg font-semibold'>AdminID: </span>
                                        <span className='md:text-lg'>{adata.adminId}</span>
                                    </div>
                                </div>
                                <div>
                                    <Link href={`/candidates/admin/${params.id}`} className='text-sm md:text-base'>
                                        <button type="button" className="bg-blue-600 text-white px-4 py-1 md:py-2 rounded-sm">
                                            Candidates
                                        </button>
                                    </Link>
                                </div>
                                <div>
                                    <button type="button" className="bg-blue-600 text-white px-4 py-1 md:py-2 rounded-sm" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                        <span className='text-sm md:text-base'>Edit</span>
                                    </button>
                                </div>
                                <div className='text-end'>
                                    <button onClick={handleLogout} className='bg-blue-600 p-2 text-slate-50 rounded-sm'>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="bg-slate-50 shadow-md rounded p-4">
                        <div className="overflow-x-auto">
                            <Pagination />
                        </div>
                    </div>
                </div>
            )}
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Edit Admin data</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className='flex gap-2'>
                                <button className={`${(active === "Email") ? "bg-blue-600 text-slate-100 p-2" : "p-2 bg-slate-200"}`} onClick={() => setActive('Email')}>Email</button>
                                <button className={`${(active === "Password") ? "bg-blue-600 text-slate-100 p-2" : "p-2 bg-slate-200"}`} onClick={() => setActive('Password')}>Password</button>
                            </div>
                            <div>
                                {active === "Email" ? <EditEmail params={params} socket={socket} /> : <EditPassword params={params} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Page;
