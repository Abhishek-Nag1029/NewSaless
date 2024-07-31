"use client"
import React, { ChangeEvent, useEffect, useState } from 'react';
import '../globals.css'
import { useRouter } from 'next/navigation';
import axios from "axios"
import Link from 'next/link';
import Head from 'next/head';
import { useAdminLoginMutation, useEmployeeLoginMutation } from '@/app/redux/api/loginApi';
import Loading from '@/components/Loading';
interface FormData {
    email: string,
    password: string,
}

const Login: React.FC = () => {
    const router = useRouter()
    const [adminLogin, { isLoading: isLoadingAdmin, isSuccess: isSuccessAdmin, data: userAdmin }] = useAdminLoginMutation();
    const [employeeLogin, { isLoading: isLoadingEmployee, isSuccess: isSuccessEmployee, data: userEmp }] = useEmployeeLoginMutation();
    const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
    const [active, setActive] = useState('admin');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const isLoading = isLoadingAdmin || isLoadingEmployee; // Keeps track if either login call is loading

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();


        if (active === 'admin') {
            try {
                const resultAction = await adminLogin(formData).unwrap();
                console.log(resultAction);
                const { _id } = resultAction.admin;
                router.push(`/admin/${_id}`);
            } catch (error: any) {
                setErrorMessage(error?.data?.message || 'An error occurred during admin login.');
            }
        } else {
            try {
                const resultAction = await employeeLogin(formData).unwrap();
                const { id } = resultAction.employee;
                router.push(`/emp/${id}`);
            } catch (error: any) {
                setErrorMessage(error?.data?.message || 'An error occurred during employee login.');
            }
        }
    };


    useEffect(() => {
        if ((isSuccessAdmin && userAdmin && userAdmin.role === 'admin') || (isSuccessEmployee && userEmp && userEmp.role === 'employee')) {
            const routePath = userAdmin ? `/admin/${userAdmin._id}` : `/emp/${userEmp.id}`;
            router.push(routePath);
        }
        // Else, stay on the login page
    }, [userAdmin, userEmp, router, isSuccessAdmin, isSuccessEmployee]);


    if (isLoading) {
        return <div className='flex justify-center items-center min-h-screen'>
            Loading.....
        </div>
    }

    return (
        <>
            <Head>
                <title>User Login </title>
                <link rel="icon" type="image/png" sizes="16x6" href="/1.png" />
            </Head>
            {
                isLoading ? <Loading /> : <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="bg-white p-6 rounded shadow-md w-[30rem] md:w-96">
                        <div className='flex justify-between items-center'>
                            <h1 className="text-3xl font-semibold text-purple-600 mb-6">Login </h1>
                            {/* Admin or Employee btn */}
                            <div className='flex justify-between gap-2'>

                                <button className={`${(active == "admin") ? "bg-blue-600 text-slate-100 p-2" : "p-2 bg-slate-200"}`}
                                    onClick={() => setActive('admin')}
                                >Admin</button>

                                <button className={`${(active == "employee") ? "bg-blue-600 text-slate-100 p-2" : "p-2 bg-slate-200"}`}
                                    onClick={() => setActive('employee')}
                                >Employee</button>

                            </div>
                        </div>

                        <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)} >
                            {/* email---------------- */}
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-600">
                                    User ID
                                </label>
                                <input
                                    value={String(formData.email)}
                                    onChange={handleChange}
                                    type="text"
                                    id="email"
                                    name="email"
                                    className="mt-1 p-3 block w-full rounded-md border focus:ring focus:ring-indigo-200"
                                    placeholder={`${active == 'admin' ? "Enter Email or AdminID" : "Enter Email or ReferalID"}`}
                                    required
                                />
                            </div>



                            <div className="mb-6">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                                    Password
                                </label>
                                <input
                                    value={String(formData.password)}
                                    onChange={handleChange}
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="mt-1 p-3 block w-full rounded-md border focus:ring focus:ring-indigo-200"
                                    placeholder='Enter Password'
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className={`bg-indigo-500 text-white py-3 px-6 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-300 ${(isLoadingAdmin || isLoadingEmployee) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoadingAdmin || isLoadingEmployee}
                            >
                                {active === 'admin' ? 'Login as Admin' : 'Login as Employee'}
                            </button>
                            <h1 className='text-red-600 text-end my-2'>{errorMessage}</h1>
                        </form>


                    </div>
                </div>
            }
        </>
    );
};

export default Login;