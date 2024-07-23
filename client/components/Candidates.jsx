"use client"
import { useGetAdminQuery } from "@/app/redux/api/AdminApi";
import { useGetCandidateQuery } from "@/app/redux/api/CandidateApi";
import { data } from "@/pages/linechart";
import axios from "axios"
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react"
import { toast } from 'react-toastify';


const Candidates = () => {
    const [allCandidate, setAllCandidate] = useState([])
    const [candidate, setCandidate] = useState([])
    const [modalData, setModalData] = useState()
    const [mail, setMail] = useState(false)
    const [shouldRefetch, setShouldRefetch] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [id, setId] = useState()
    const [page, setPage] = useState(1)
    const [emailSent, setEmailSent] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [userId, setUserId] = useState()

    const params = useParams()
    const currentPage = 10
    const indexOfLastCandidate = currentPage * page;
    const indexOfFirstCandidate = indexOfLastCandidate - currentPage;
    const currentItems = candidate.slice(indexOfFirstCandidate, indexOfLastCandidate);
    const [gotoPageValue, setGotoPageValue] = useState('')

    const router = useRouter()
    // const { data } = useGetCandidateQuery()
    // console.log(JSON.stringify(data, null, 2));

    console.log(params);
    const handleNextBtn = () => {
        setPage((prev) => (prev < totalPages ? prev + 1 : prev));
    };

    const handlePreviouBtn = () => {
        setPage((prev) => (prev > 1 ? prev - 1 : prev));
    };


    const handleGotoPageSubmit = (event) => {
        event.preventDefault(); // Prevents the default form submit action
        const value = parseInt(gotoPageValue, 10);
        if (value && value >= 1 && value <= totalPages && value !== currentPage) {
            setPage(value);
        }
        setGotoPageValue('');
    };

    const handleGotoPageInputChange = (event) => {
        setGotoPageValue(event.target.value);
    };


    const table = <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white sm:p-2 ">
        <table className="w-full text-sm text-left rtl:text-right bg-slate-900 text-white  ">
            <thead className="text-xs  uppercase border-b border-slate-600">
                <tr>
                    <th scope="col" className="px-6 py-3">
                        #
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Candidates name
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Email
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Phone number
                    </th>
                    <th scope="col" className="px-6 py-3">
                        College
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Location
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Degree & passing
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Status
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Message
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Actions
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Profile
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Request
                    </th>
                </tr>
            </thead>
            <tbody>
                {
                    currentItems.map((item, i) => <tr key={item.id} className="bg-slate-800 text-slate-400 p-2 text-center hover:bg-slate-900 hover:text-white cursor-pointer border-b-2 border-slate-600  ">
                        <td>{i + 1}</td>
                        <td>{item.firstName} {item.lastName}</td>
                        <td>{item.email}</td>
                        <td className="w-full">{item.phone}</td>
                        <td className="text-xs">{item.college}</td>
                        <td>{item.state}</td>
                        <td>{item.degree} {item.branch} {item.passingYear}</td>
                        <td >
                            {item.status}
                        </td>
                        <td className="pt-2 ">
                            <textarea className=" resize-none p-2 text-slate-200 bg-slate-700 rounded-sm focus:outline-none cursor-pointer" name="" id="" cols="25" rows="4" readOnly>
                                {item.message}
                            </textarea>
                        </td>
                        <td>
                            <button
                                data-bs-toggle="modal" data-bs-target="#exampleModal"
                                onClick={e => setId(`${item._id}`)}
                                className="bg-green-600 text-white px-3 py-1 ">Edit</button>
                        </td>
                        <td>
                            <Link href={{
                                pathname: `/candidates/${item._id}`

                            }}>
                                <button
                                    className='py-1 px-3  mx-2 bg-blue-600 text-slate-50 '>View
                                </button>
                            </Link>
                        </td>

                        <td>
                            <button
                                onClick={e => setUserId(`${item._id}`)}
                                className="bg-green-900 text-white px-3 py-1 ">Mail</button>
                        </td>
                    </tr>)
                }

            </tbody>
        </table>
    </div>

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
    };

    const handelPostRequest = async () => {

        setStatusMessage('')
        const endpoint =
            modalData === 'selected' ? `shortlist/${id}` :
                modalData === 'discarded' ? `discard/${id}` :
                    modalData === 'pending' ? `pending/${id}` :
                        modalData === 'invited' ? `invited/${id}` :
                            modalData === 'employee' ? `employee/${id}` :
                                false

        try {
            const response = await axios.post(`http://localhost:3000/api/candidate/${endpoint}`);

            if (response.status === 200) {
                console.log('Status updated successfully:', response.data);
                setStatusMessage('Status updated successfully.');
                setShouldRefetch(true);
                toast.success("Status updated successfully ")
            }
        } catch (error) {
            if (error.response?.status === 400) {

                setStatusMessage('Status is the same.');
                toast.error("Status is already the same")
            } else {
                setStatusMessage('An error occurred while updating the status.');
                console.error('Error posting update:', error);
                toast.error("An error occurred while updating the status")

            }
        }
        setModalData(undefined)

            ; // Reset modal data after post attempt
    };


    const handelSendMail = async () => {
        try {

            const data = await axios.post("http://localhost:3000/api/candidate/sendemail")
            console.log(data.status);
            if (data.status === 200) {
                toast.success("mail sent successfully")
                setMail(false)
                setReload(true)
            }

        } catch (error) {
            console.log(error);
        }
    }


    const handelSendSingleMail = async () => {
        try {
            const response = await axios.post(`http://localhost:3000/api/candidate/sendemail/${userId}`)
            console.log(response.status);
            console.log(response.data);

            if (response.status === 200) {
                toast.success("Mail Sent success")
            }
        } catch (error) {
            toast.error(error)
            console.log(error);
        }
    }

    useEffect(() => {
        if (userId) {
            handelSendSingleMail()
        }
    }, [userId])



    useEffect(() => {
        const fetchAllCandidates = async () => {
            try {
                const { data } = await axios.get(`http://localhost:3000/api/candidate/admin-candidate/${params.id}`, {
                    withCredentials: true
                });
                setAllCandidate(data);
                setTotalPages(Math.ceil(data.length / currentPage)); // Update totalPages based on fetched data
                setShouldRefetch(undefined)
            } catch (error) {
                if (error.status === 401 || 403) {
                    setError(true)
                    router.push('/login')
                } else {
                    console.error("Failed to fetch candidates:", error);
                }
            } finally {
                setLoading(false)
            }
        };

        fetchAllCandidates();
    }, [shouldRefetch]);

    useEffect(() => {
        const filteredCandidates = statusFilter === "all" ? allCandidate : allCandidate.filter(item => item.status === statusFilter);
        setCandidate(filteredCandidates); // This populates "candidate" with the filtered or full candidate list
        setTotalPages(Math.ceil(filteredCandidates.length / currentPage));
        setPage(1); // Reset to the first page when status filter changes
    }, [statusFilter, allCandidate, currentPage]);

    useEffect(() => {
        if (emailSent) {
            setEmailSent(false);
        }
    }, [emailSent]);
    useEffect(() => {
        setTotalPages(Math.ceil(candidate.length / currentPage));
    }, [candidate]);

    if (loading) {
        return <div className="min-h-screen flex justify-center items-center ">
            Loading......
        </div>
    }

    if (error) {
        return <div className="min-h-screen flex justify-center items-center ">Invalid Request Please Login</div>
    }


    return <>
        <div className=" min-h-screen w-full bg-slate-100 p-4 ">
            <p className=" p-4  bg-white text-black font-semibold text-lg sm:text-xl md:text-3xl shadow-xl rounded-md">Candidates Portal</p>
            <div className="mt-6   flex flex-wrap sm:flex-row  justify-between items-center  gap-2">
                <div>
                    {
                        mail ? <button
                            onClick={handelSendMail}
                            className="px-2 md:px-4 py-1 md:py-2 bg-blue-700 text-white rounded-sm text-xs sm:text-sm md:text-lg">
                            Send Mail
                        </button> : ""
                    }
                </div>
                <div className="flex items-center gap-2">


                    <button
                        onClick={() => {
                            handleStatusFilter('all');
                            setMail(false);
                        }}
                        className="px-2 md:px-4 py-1 md:py-2 bg-green-600 text-white rounded-2xl">
                        All
                    </button>

                    <button
                        onClick={() => handleStatusFilter('pending')}
                        className="px-2 md:px-4 py-1 md:py-2 bg-gray-600 text-white rounded-2xl">
                        Pending
                    </button>

                    <button
                        onClick={() => ` ${handleStatusFilter('shortlisted')}, ${setMail(true)}`}

                        className="px-2 md:px-4 py-1 md:py-2 bg-blue-600 text-white rounded-2xl">
                        Shortlisted
                    </button>

                    <button
                        onClick={() => `${handleStatusFilter('discarded')}, ${setMail(false)}`}
                        className="px-2 md:px-4 py-1 md:py-2 bg-red-600 text-white rounded-2xl">
                        Discarded
                    </button>

                    <button
                        onClick={() => `${handleStatusFilter('invited')} , ${setMail(false)}`}
                        className="px-2 md:px-4 py-1 md:py-2 bg-green-600 text-white rounded-2xl">
                        Invited
                    </button>


                </div>
            </div>
            {table}


            <div className='text-center mt-10 mb-2 shadow-gray-300'>
                <button className={`${currentPage === 1 ? "bg-blue-400" : 'bg-blue-600'}  text-slate-50 px-2 py-1 rounded-md mx-3`}
                    onClick={handlePreviouBtn} disabled={currentPage === 1}>
                    Previous
                </button>
                <span className=" font-medium">{page}/{totalPages}</span>
                <button className={`${currentPage === totalPages ? "bg-blue-400" : 'bg-blue-600 '} text-slate-50 px-2 py-1 rounded-md mx-3`}
                    onClick={handleNextBtn} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
            <div className='text-end'>
                <form onSubmit={handleGotoPageSubmit} style={{ display: 'inline' }}>
                    <input
                        type="number"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-sm py-1 focus:ring-blue-500 focus:border-blue-500"
                        value={gotoPageValue}
                        onChange={handleGotoPageInputChange}
                        min={1}
                        max={totalPages}
                        placeholder={`${page}/${totalPages}`}
                    />
                    <button
                        type="submit"
                        className="px-4 py-1 bg-blue-600 text-slate-50 rounded-md mx-2"
                    >
                        Go
                    </button>
                </form>
            </div>

        </div >


        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">

                        <h5 class="modal-title" id="exampleModalLabel">Candidate Status </h5>
                        <h5 class="modal-title" id="exampleModalLabel"> </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>

                    <div className="modal-body ">
                        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-center ">
                            <button onClick={() => setModalData("pending")} className={`" text-white p-3 " ${modalData === "pending" ? "bg-gray-600" : "bg-gray-300"}`}>Pending</button>
                            <button onClick={() => setModalData("discarded")} className={`" text-white p-3 " ${modalData === "discarded" ? "bg-red-600" : "bg-red-300"}`}>Discarded</button>

                            <button onClick={() => setModalData("selected")} className={`" text-white p-3 " ${modalData === "selected" ? "bg-blue-600" : "bg-blue-300"}`}>Shortlisted</button>
                            <button onClick={() => setModalData("invited")} className={`" text-white p-3 " ${modalData === "invited" ? "bg-gray-600" : "bg-gray-300"}`}>Invited</button>
                            <button onClick={() => setModalData("employee")} className={`" text-white p-3 " ${modalData === "employee" ? "bg-green-600" : "bg-green-300"}`}>Employee</button>

                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" className="bg-gray-600 text-white px-2 md:px-6 py-1 md:py-3" data-bs-dismiss="modal">Close</button>
                        <button
                            onClick={handelPostRequest}
                            type="button" className="bg-blue-600 text-white px-2 md:px-6 py-1 md:py-3" data-bs-dismiss="modal">Save changes</button>
                    </div>
                </div>
            </div>
        </div>

    </>
}




export default Candidates