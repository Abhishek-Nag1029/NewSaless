"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const MasterCandidate = () => {
    const [candidates, setCandidates] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        bankName: '',
        accountNumber: '',
        payeeName: '',
        ifscCode: ''
    });

    const [editId, setEditId] = useState(null)
    const [currentPage, setCurrentPage] = useState(1);
    const [candidatesPerPage] = useState(10); // Set number of candidates to display per pages

    const indexOfLastCandidate = currentPage * candidatesPerPage;
    const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage;
    const currentCandidates = candidates.slice(indexOfFirstCandidate, indexOfLastCandidate);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Go to the next page
    const nextPage = () => {
        setCurrentPage(currentPage + 1);
    };

    // Go to the previous page
    const prevPage = () => {
        setCurrentPage(currentPage - 1);
    };


    // Method to create page numbers
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(candidates.length / candidatesPerPage); i++) {
        pageNumbers.push(i);
    }


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const openModal = (candidate) => {
        setFormData({
            email: candidate.email,
            bankName: candidate.bankName,
            accountNumber: candidate.accountNumber,
            payeeName: candidate.payeeName,
            ifscCode: candidate.ifscCode
        });
        setEditId(candidate._id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await axios.put(`http://localhost:3000/api/master-admin/candidate/update/${editId}`, formData);
        if (result.status === 200) {
            console.log(result);
            toast.success("Candidate Updated")
            closeModal();
        }

    };


    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/master-admin/candidate-data', {
                    withCredentials: true
                });
                setCandidates(response.data);
            } catch (error) {
                console.error("Error fetching candidates", error);
            }
        };

        fetchCandidates();
    }, [isModalOpen]);

   

   

    return <>
        <div className="overflow-x-auto my-2 p-3 shadow-lg h-full">
            <p className='uppercase font-semibold my-2'>Candidate Bank Details </p>
            <table className="min-w-full bg-white">
                <thead>
                    <tr className='bg-slate-300'>
                        <th className="border px-4 py-4">Sr.no</th>
                        <th className="border px-8 py-4">First Name</th>
                        <th className="border px-8 py-4">Last Name</th>
                        <th className="border px-8 py-4">Email</th>
                        <th className="border px-8 py-4">Payee Name</th>
                        <th className="border px-8 py-4">Bank Name</th>
                        <th className="border px-8 py-4">Account Number</th>
                        <th className="border px-8 py-4">IFSC Code</th>
                        <th className="border px-8 py-4">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentCandidates.map((candidate, index) => (
                        <tr className=' hover:bg-slate-100 hover:text-black  cursor-pointer' key={index}>
                            <td className="border px-4 py-4 text-center">{index + 1}</td>
                            <td className="border px-8 py-4 text-center">{candidate.firstName}</td>
                            <td className="border px-8 py-4 text-center">{candidate.lastName}</td>
                            <td className="border px-8 py-4 text-center">{candidate.email}</td>
                            <td className="border px-8 py-4 text-center">{candidate.payeeName}</td>
                            <td className="border px-8 py-4 text-center">{candidate.bankName}</td>
                            <td className="border px-8 py-4 text-center">{candidate.accountNumber}</td>
                            <td className="border px-8 py-4 text-center">{candidate.ifscCode}</td>
                            <td className="border px-8 py-4 text-center">
                                <button onClick={() => openModal(candidate)} className='mx-2 px-6 py-1 bg-blue-600 text-white'>Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-center items-center my-4">
                <button
                    onClick={prevPage}
                    className={`px-3 py-1 mx-1 bg-blue-600 text-white rounded ${currentPage === 1 && 'cursor-not-allowed opacity-50'}`}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span>
                    Page {currentPage} of {pageNumbers.length}
                </span>
                <button
                    onClick={nextPage}
                    className={`px-3 py-1 mx-1 bg-blue-600 text-white rounded ${currentPage === pageNumbers.length && 'cursor-not-allowed opacity-50'}`}
                    disabled={currentPage === pageNumbers.length}
                >
                    Next
                </button>
            </div>


        </div>




        {isModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <div className="mt-3 text-center">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Bank Details</h3>
                        <form onSubmit={handleSubmit} className="m-4">
                            <div className="my-2 flex flex-col gap-2">
                                <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    placeholder='Enter Email id'
                                    required
                                />
                            </div>
                            <div className="my-2 flex flex-col gap-2">
                                <label htmlFor="bankName" className="block text-gray-700 font-semibold mb-2">Bank Name</label>
                                <input
                                    type="text"
                                    id="bankName"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    placeholder='Enter bankName'
                                    required
                                />
                            </div>
                            <div className="my-2 flex flex-col gap-2">
                                <label htmlFor="accountNumber" className="block text-gray-700 font-semibold mb-2">Payee Account Number</label>
                                <input
                                    type="text"
                                    id="accountNumber"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    placeholder='Enter accountNumber'
                                    required
                                />
                            </div>
                            <div className="my-2 flex flex-col gap-2">
                                <label htmlFor="payeeName" className="block text-gray-700 font-semibold mb-2">Payee Name</label>
                                <input
                                    type="text"
                                    id="payeeName"
                                    name="payeeName"
                                    value={formData.payeeName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    placeholder='Enter Payee Name'
                                    required
                                />
                            </div>
                            <div className="my-2 flex flex-col gap-2">
                                <label htmlFor="ifscCode" className="block text-gray-700 font-semibold mb-2">IFSC Code</label>
                                <input
                                    type="text"
                                    id="ifscCode"
                                    name="ifscCode"
                                    value={formData.ifscCode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    placeholder='Enter IFSC Code'
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none"
                            >
                                Submit
                            </button>
                            <button
                                onClick={closeModal}
                                className="mx-4 px-4 py-2 bg-white text-red-500 border border-red-500 rounded hover:bg-gray-100 focus:outline-none"
                            >
                                Close
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )}

    </>
};

export default MasterCandidate;