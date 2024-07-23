import React, { useEffect, useState } from 'react';
import '../pages/globals.css';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { toast } from "react-toastify"

const AdminRegister: React.FC = () => {

    const [loading, setLoading] = useState(false);

    const [isAuthorized, setIsAuthorized] = useState(false)

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: "",
        password: '',
    });

    const router = useRouter()
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/admin/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Registration successful:', data.message);
                // when the user  is registered, then sent to login page 
                alert("New Admin Registered !!!")

            } else {
                const errorData = await response.json();
                console.error('Registration error:', errorData.message);
                alert(`Registration error: ${errorData.message}`)
            }
        } catch (error) {
            console.error('Error during registration:', error);
        } finally {
            setLoading(false);
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                password: ""
            })
        }
    };



    useEffect(() => {
        const checkToken = async () => {
            const token = sessionStorage.getItem("masterToken");
            setIsAuthorized(!!token); // Set authorized to true if token exists
            setLoading(false)
            toast.success("Welcome Master")
        };

        checkToken();
    }, []);





    if (loading) {
        return <div className='flex justify-center items-center min-h-screen'>
            <p>Loading...</p>
        </div>;
    }



    return (
        <>
            <Head>
                <title>Admin Register</title>
                <link rel="icon" type="image/png" sizes="16x6" href="/1.png" />
            </Head>
            {
                isAuthorized ? <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="bg-white p-6 rounded-md shadow-2xl flex flex-col md:flex-row gap-6 w-3/4">
                        {/* Left Side: Form */}
                        <div className="flex-1 order-2 md:order-1 ">
                            <h1 className="text-3xl font-semibold text-purple-600 mb-6">Admin Register</h1>
                            <form onSubmit={handleFormSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-600">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        className="mt-1 p-3 block w-full rounded-md border focus:ring focus:ring-indigo-200"
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-600">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        className="mt-1 p-3 block w-full rounded-md border focus:ring focus:ring-indigo-200"
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-600">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="mt-1 p-3 block w-full rounded-md border focus:ring focus:ring-indigo-200"
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        className="mt-1 p-3 block w-full rounded-md border focus:ring focus:ring-indigo-200"
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="bg-indigo-500 text-white py-3 px-6 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-300"
                                >
                                    Register
                                </button>
                            </form>

                        </div>

                        {/* Right Side: Random Text */}
                        <div className="flex-1 order-1 md:order-2 bg-gray-200 p-6 rounded-md flex flex-col justify-center items-center">
                            <h2 className="text-xl font-semibold mb-4">Admin Text</h2>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut arcu eu erat tincidunt fermentum.
                                Integer ullamcorper urna eu augue laoreet, non tincidunt velit tempus. Donec euismod tincidunt libero,
                                a volutpat est efficitur non. Fusce vel vehicula justo. Nullam commodo quam vel nisi feugiat, a suscipit erat
                                bibendum. In sollicitudin rhoncus libero a dictum. Etiam euismod dolor at odio congue vestibulum.
                                orem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut arcu eu erat tincidunt fermentum.
                                Integer ullamcorper urna eu augue laoreet, non tincidunt velit tempus. Donec euismod tincidunt libero,
                                a volutpat est efficitur non. Fusce vel vehicula justo. Nullam commodo quam vel nisi feugiat, a suscipit erat
                                bibendum. In sollicitudin rhoncus libero a dictum. Etiam euismod dolor at odio congue vestibulum.orem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut arcu eu erat tincidunt fermentum.
                                Integer ullamcorper urna eu augue laoreet, non tincidunt velit tempus. Donec euismod tincidunt libero,
                                a volutpat est efficitur non. Fusce vel vehicula justo. Nullam commodo quam vel nisi feugiat, a suscipit erat
                                bibendum. In sollicitudin rhoncus libero a dictum. Etiam euismod dolor at odio congue vestibulum.
                            </p>
                        </div>
                    </div>
                </div>
                    : <div className='min-h-screen flex gap-2 justify-center items-center font-semibold text-2xl'>
                        <p>Access Denied.</p>
                        <Link className='text-blue-600' href={'/login'}>Please Login.</Link>
                    </div>
            }
        </>
    );
};

export default AdminRegister;
