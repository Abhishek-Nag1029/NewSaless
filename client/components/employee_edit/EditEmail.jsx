import { useUpdateEmployeeEmailMutation } from "@/app/redux/api/EmployeeApi";
import { empData } from "@/app/redux/slice/empSlice";
import axios from "axios"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux";
import { toast } from 'react-toastify';

const EditEmail = ({ params, socket }) => {
    const dispatch = useDispatch()
    const [updateEmployeeEmail] = useUpdateEmployeeEmailMutation();

    const [emailData, setEmailData] = useState({
        currentPassword: "",
        newEmail: "",
        OTP: "",
    })
    const [status, setStatus] = useState()
    const [errorData, setErrorData] = useState()
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmailData({ ...emailData, [name]: value });

    };

    const submitNewEmail = async (newEmail) => {
        try {
            const updateResponse = await updateEmployeeEmail({ id: params.id, newEmail }).unwrap();
            setStatus(undefined);
            setEmailData({ currentPassword: '', newEmail: '', OTP: '' }); // Clearing the form
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
        try {
            if (status === undefined) {
                const response = await axios.post(`http://localhost:3000/api/employee/checkPass/${((params.id))}`, emailData)
                setStatus(200)
                toast.success("OTP Sent successfully")
                console.log('200 abjfbajbfja')

            } else if (status === 200) {
                const response = await axios.post(`http://localhost:3000/api/employee/otp/${((params.id))}`, emailData)
                console.log('OTP matched successfully')
                setStatus(201)

            } else if (status === 201) {
                await submitNewEmail(emailData.newEmail);
                setStatus(undefined)
                toast.success("Email Updated successfully")
            }

        } catch (error) {
            if (error.response) {
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
        socket.on("employeeUpdateResponse", data => {
            console.log("-======= DATA =========");
            console.log(data)
            dispatch(empData(data.employee))
            console.log("-================");
        })
        return () => socket.close();
    }, []);

    return <>
        <div className="h-full flex flex-col justify-between">
            <form action="" onSubmit={handelSubmit}>
                <div className=" p-3">
                    {
                        status ? "" : <div className="my-2">
                            <label className="md: text-lg" htmlFor="currentPassword">Enter Current Password<span className="text-red-600">*</span></label>
                            <input
                                name="currentPassword"
                                value={String(emailData.currentPassword)}
                                onChange={handleChange}
                                className="w-full my-2 border p-2 rounded-md" type="text" placeholder="Enter current Password" id="currentPassword" required />
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