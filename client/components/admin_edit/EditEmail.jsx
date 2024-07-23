import { DATA } from "@/app/admin/[id]/page";
import axios from "axios"
import { useParams } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import { toast } from 'react-toastify';
import io from "socket.io-client";
import { createContext } from "react";
import { useUpdateAdminEmailMutation } from "@/app/redux/api/AdminApi";
import { useDispatch } from "react-redux";
import { updateAdminData } from "@/app/redux/slice/adminSlice";

const EditEmail = ({ params, socket }) => {
    const dispatch = useDispatch()
    const [updateAdminEmail] = useUpdateAdminEmailMutation();
    const [emailData, setEmailData] = useState({
        currentPassword: "",
        newEmail: "",
        OTP: "",
    })
    const [status, setStatus] = useState()
    const [errorData, setErrorData] = useState()
    // const [socket, setSocket] = useState(null);


    // const handleEmailUpdateViaSocket = () => {
    //     socket.emit('updateEmail', { id: params.id, newEmail: emailData.newEmail });
    // };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmailData({ ...emailData, [name]: value });
    };

    const submitNewEmail = async (newEmail) => {
        try {
            const updateResponse = await updateAdminEmail({ id: params.id, newEmail }).unwrap();
            // console.log(updateResponse);
            // handleEmailUpdateViaSocket()
            setStatus(undefined);
            setEmailData({ currentPassword: '', newEmail: '', OTP: '' }); // Clear the form
            toast.success('Email updated successfully');
        } catch (error) {
            const message = error.data?.error || 'Error updating email';
            setErrorData(message);
            toast.error(message);
        }
    };



    const handelSubmit = async e => {
        e.preventDefault()
        console.log(emailData);
        console.log((params.id))
        try {
            if (status === undefined) {
                const response = await axios.post(`http://localhost:3000/api/admin/checkpass/${params.id}`, emailData)
                setStatus(200)
                toast.success("OTP Sent successfully")
                console.log('200 abjfbajbfja')

            } else if (status === 200) {
                const response = await axios.post(`http://localhost:3000/api/admin/otp/${params.id}`, emailData)
                console.log('OTP matched successfully')
                setStatus(201)

            } else if (status === 201) {
                // const response = await axios.put(`http://localhost:3000/api/admin/updateEmail/${params.id}`, emailData)
                await submitNewEmail(emailData.newEmail);
                console.log('Email updated successfully ')
                setStatus(undefined)
            }


        } catch (error) {
            if (error.response) {
                // setErrorData(error.response.data.message);
                setErrorData(error.response.data.message);
            } else {
                setErrorData('An error occurred during update Email');
            }
            setTimeout(() => {
                setErrorData("");
            }, 2500)
        }
        setEmailData({
            currentPassword: "",
            newEmail: "",
            OTP: "",
        })

    }



    useEffect(() => {

        socket.on("updateResponse", data => {
            console.log("-======= DATA =========");
            console.log(data)
            dispatch(updateAdminData(data.admin))
            console.log("-================");
        })
        return () => socket.close();
    }, []);

    return <>
        <div className="h-full flex flex-col justify-between">
            {/* <pre>{JSON.stringify(status, null, 2)}</pre> */}
            <form action="" onSubmit={handelSubmit}>
                <div className=" p-3">
                    {
                        status ? "" : <div className="my-2">
                            <label className="md: text-lg" htmlFor="currentPassword">Enter Current Password<span className="text-red-600">*</span></label>
                            <input
                                name="currentPassword"
                                value={String(emailData.currentPassword)}
                                onChange={handleChange}
                                className="w-full my-2 border p-2 rounded-md" type="password" placeholder="Enter current Password" id="currentPassword" required />
                            <p>{errorData}</p>
                        </div>
                    }
                    {
                        status === 200 ?
                            <div className="my-2">
                                <label className="md: text-lg" htmlFor="OTP">Enter OTP<span className="text-red-600">*</span></label>
                                <input
                                    name="OTP"
                                    value={String(emailData.OTP)}
                                    onChange={handleChange}
                                    className="w-full my-2 border p-2 rounded-md" type="number" placeholder="Enter your OTP" id="OTP" required />
                                <p>{errorData}</p>
                            </div> : ''
                    }
                    {
                        status === 201 ?
                            <div className="my-2">
                                <label className="md: text-lg" htmlFor="newEmail">Enter newEmail<span className="text-red-600">*</span></label>
                                <input
                                    name="newEmail"
                                    value={String(emailData.newEmail)}
                                    onChange={handleChange}
                                    className="w-full my-2 border p-2 rounded-md" type="email" placeholder="Enter your new Email" id="newEmail" required />
                                <p>{errorData}</p>
                            </div> : ''
                    }

                </div>
                <div className="my-2 text-end ">

                    {
                        status ? "" : <button type="submit" className=" bg-blue-600 text-slate-50 px-3 md:px-5 py-1 md:py-2">Check</button>
                    }
                    {
                        status === 200 ? <button type="submit" className=" bg-blue-600 text-slate-50 px-3 md:px-5 py-1 md:py-2" >Verify OTP</button> : status === 201
                            ?
                            <button
                                type="submit"
                                className=" bg-blue-600 text-slate-50 px-3 md:px-5 py-1 md:py-2"
                                data-bs-dismiss={status === 201 ? `modal` : ""}
                            >submit</button> : ""
                    }

                </div>
            </form>
        </div>
    </>
}

export default EditEmail