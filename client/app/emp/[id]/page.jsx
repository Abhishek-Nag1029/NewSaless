"use client";
import { data, options } from "@/pages/linechart";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Chat from "../../../components/Chat";
import Head from "next/head";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { toast } from "react-toastify";
import Chart from "../../../components/Chat";
import {
  useGetEmployeeQuery,
  useUpdateEmployeeEmailMutation,
} from "@/app/redux/api/EmployeeApi";
import EditEmail from "@/components/employee_edit/EditEmail";
import EditPassword from "@/components/employee_edit/EditPassword";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import CustomerTable from "../../../components/CustomerTable";

//Home Page
const Page = ({ params }) => {
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState("Email");
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [custError, setCustError] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [admin, setAdmin] = useState("true");
  const [backData, setBackData] = useState([]);
  const [logout, setLogout] = useState();
  const [validate, setValidate] = useState("true");
  const [salesData, setSalesData] = useState([]);
  const [goToPage, setGoToPage] = useState("");
  const [edit, setEdit] = useState({
    email: "",
    password: "",
  });
  const search = useSearchParams();
  const { data, error, isFetching, status, isError } = useGetEmployeeQuery(
    params.id
  );
  const { empData: edata } = useSelector((state) => state.employee);
  const [updateEmployeeEmail] = useUpdateEmployeeEmailMutation();

  const formatDate = (customer) => {
    const date = new Date(customer);
    // Format the date to YYYY-MM-DD
    return date.toISOString().split("T")[0];
  };

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentDay = new Date().getDate();

  const filteredCustomers =
    filter === "all"
      ? customers
      : filter === "thisMonth"
      ? customers.filter(
          (customer) =>
            new Date(customer.createdAt).getFullYear() === currentYear &&
            new Date(customer.createdAt).getMonth() === currentMonth
        )
      : filter === "lastMonth"
      ? customers.filter((customer) => {
          const createdAt = new Date(customer.createdAt);
          const createdAtYear = createdAt.getFullYear();
          const createdAtMonth = createdAt.getMonth();
          return (
            (createdAtYear === currentYear &&
              createdAtMonth === currentMonth - 1) ||
            (createdAtYear === currentYear - 1 && createdAtMonth === 11)
          );
        })
      : filter === "quarterly"
      ? customers.filter((customer) => {
          const createdAt = new Date(customer.createdAt);
          const createdAtYear = createdAt.getFullYear();
          const createdAtMonth = createdAt.getMonth();
          const quarter = Math.floor(createdAtMonth / 3) + 1;
          const currentQuarter = Math.floor(currentMonth / 3) + 1;
          return (
            (createdAtYear === currentYear && quarter === currentQuarter) ||
            (createdAtYear === currentYear - 1 &&
              currentQuarter === 1 &&
              quarter === 4)
          );
        })
      : filter === "semiAnnually"
      ? customers.filter((customer) => {
          const createdAt = new Date(customer.createdAt);
          const createdAtYear = createdAt.getFullYear();
          const createdAtMonth = createdAt.getMonth();
          const halfYear = createdAtMonth < 6 ? 1 : 2; // 1 for first half, 2 for second half
          const currentHalfYear = currentMonth < 6 ? 1 : 2;
          return (
            (createdAtYear === currentYear && halfYear === currentHalfYear) ||
            (createdAtYear === currentYear - 1 &&
              currentHalfYear === 1 &&
              halfYear === 2)
          );
        })
      : filter === "annually"
      ? customers.filter(
          (customer) =>
            new Date(customer.createdAt).getFullYear() === currentYear
        )
      : customers.filter((customer) =>
          customer.products.some((product) => product.name === filter)
        );

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "quarterly", label: "Quarterly" },
    { value: "semiAnnually", label: "Semi-Annually" },
    { value: "annually", label: "Annually" },
    { value: "Product A", label: "Product A" },
    { value: "Product B", label: "Product B" },
    { value: "Product C", label: "Product C" },
    { value: "Product D", label: "Product D" },
  ];

  const product = [
    { value: "Product A", label: "Product A" },
    { value: "Product B", label: "Product B" },
    { value: "Product C", label: "Product C" },
    { value: "Product D", label: "Product D" },
  ];

  const month = [
    { value: "all", label: "All" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "quarterly", label: "Quarterly" },
    { value: "semiAnnually", label: "Semi-Annually" },
    { value: "annually", label: "Annually" },
  ];
  const customerPerPage = 3;
  const indexOfLastcustomer = currentPage * customerPerPage;
  const indexOfFirstCustomer = indexOfLastcustomer - customerPerPage;
  const currentItems = filteredCustomers.slice(
    indexOfFirstCustomer,
    indexOfLastcustomer
  );
  const totalPages = Math.ceil(filteredCustomers.length / customerPerPage);
  const router = useRouter();

  const handleNextBtn = () => {
    setCurrentPage((prev) => (prev < 10 ? prev + 1 : prev));
  };

  const handlePreviousBtn = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleInputChange = (e) => {
    setGoToPage(e.target.value);
  };

  const handleGoToPage = (e) => {
    e.preventDefault(); // Prevent the default form submit action
    let PageNumber = parseInt(goToPage, 10);
    if (!isNaN(PageNumber)) {
      PageNumber = Math.max(1, PageNumber); // Minimum Page number should be 1
      PageNumber = Math.min(PageNumber, totalPages); // Maximum is the totalPages
      setCurrentPage(PageNumber);
    }
    setGoToPage(""); // Optionally clear the input after jump
  };

  const thisMonthCustomers = customers.filter((customer) => {
    const createdAtDate = new Date(customer.createdAt);
    return (
      createdAtDate.getMonth() === new Date().getMonth() &&
      createdAtDate.getFullYear() === new Date().getFullYear()
    );
  });

  const firstEmployee = employees[0];
  const referalID = firstEmployee ? firstEmployee.referalID : undefined;
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `https://newsaless-2.onrender.com/api/employee/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      console.log(response.data);
      toast.success("logout success");
      router.push("/login");
      setLogout(true);
    } catch (error) {
      console.error("Error while logging out:", error);
    }
  };

  // --------------------------------------------------------------------------

  const socket = useMemo(() => io("https://newsaless-2.onrender.com"), []);
  const empId = params.id;
  const fetchEmployeeData = (id) => {
    socket.emit("getEmp", id);
  };

  useEffect(() => {
    socket.on("empResponse", (response) => {
      if (response.error) {
        toast.error(`Error: ${response.message}`);
        console.log(response.error);
      } else {
        // toast.success('Welcome ');
        setBackData([response.data]);
      }
    });

    if (empId) {
      fetchEmployeeData(empId);
    }

    return () => {
      socket.off("adminResponse");
    };
  }, [empId, updateEmployeeEmail]);

  // Check if the admin is viewing
  useEffect(() => {
    if (search.get("name") === null) {
      setAdmin(false);
    } else {
      setAdmin(true);
    }
  }, []);

  // Customer Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `https://newsaless-2.onrender.com/api/customer/${params.id}`,
          {
            withCredentials: true,
          }
        );
        setCustomers(data);
        // console.log(data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setCustError(error.response.data.message);
          console.log(error);
        } else {
          console.error("Error fetching employee data:", error);
          toast.error("Failed to fetch data");
        }
      }
    };

    fetchData();
  }, [data]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  //  Customer data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://newsaless-2.onrender.com/api/customer/employee/total-amount-per-month/${params.id}`
        );
        setSalesData(response.data);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    fetchData();
  }, []);

  // fetch customer total monthly sale
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://newsaless-2.onrender.com/api/employee/employee/total-customers/${params.id}`
        );
        // console.log(salesData);
      } catch (error) {
        console.error("Error fetching total customers data:", error);
      }
    };

    fetchData();
  }, []);

  // Errors
  useEffect(() => {
    if (isError && (error?.status === 401 || error?.status === 403)) {
      router.replace("/login");
    }
  }, [isError, error, router]);

  // Loading state until fetching is done and there is data
  if (isFetching) {
    return (
      <div className="min-h-screen flex justify-center items-center font-semibold text-lg sm:text-xl md:text-2xl">
        LOADING...
      </div>
    );
  } else if (isError) {
    return (
      <div className="min-h-screen flex justify-center items-center font-semibold text-lg sm:text-xl md:text-2xl">
        Invalid Request Please Login
      </div>
    );
  } else if (!data) {
    return (
      <div className="min-h-screen flex justify-center items-center font-semibold text-lg sm:text-xl md:text-2xl">
        No data available.
      </div>
    );
  }
  const totalSales = salesData.reduce((acc, cur) => acc + cur.totalAmount, 0);

  return (
    <>
      <Head>
        <link rel="icon" type="image/png" sizes="16x6" href="/1.png" />
      </Head>
      <div>
        <div className="min-h-screen bg-slate-100 scroll-smooth ">
          <div className="h-full grid grid-cols-12 px-6 md:px-10 py-6  md:py-10  gap-3">
            <div className=" h-[20rem] flex justify-center items-center  col-span-12 md:col-span-6 bg-slate-100">
              <div className="h-[18rem] w-full flex flex-col justify-center  py-2  md:py-5 px-2 md:px-5  text-sm  md:text-base shadow-xl bg-slate-50  text-black rounded-xl gap-6">
                {edata && (
                  <div className="flex flex-col gap-2" key={edata.id}>
                    <div>
                      <div className=" flex justify-between">
                        <div>
                          <span className="md:text-lg font-semibold mx-2">
                            Name:
                          </span>
                          <span className="md:text-lg">
                            {edata.firstName} {edata.lastName}
                          </span>
                        </div>
                        <div>
                          <span className="md:text-lg font-semibold mx-2">
                            ID:
                          </span>
                          <span className="md:text-lg">{edata.id}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div>
                        <span className="md:text-lg font-semibold mx-2">
                          Referal ID:
                        </span>
                        <span className="md:text-lg">{edata.referalID}</span>
                      </div>
                      <div>
                        <span className="md:text-lg font-semibold mx-2">
                          Email:
                        </span>
                        <span className="md:text-lg ">{edata.email}</span>
                      </div>
                    </div>
                    <div>
                      <div className="">
                        <span className="md:text-lg font-semibold mx-2">
                          Date of joining:
                        </span>
                        <span className="md:text-lg">
                          {edata.profileCreationDate}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="">
                        <span className="md:text-lg font-semibold mx-2">
                          Last Month Sales:
                        </span>
                        {/* <span className='md:text-lg'>₹{edata.sale}</span> */}
                        <span className="md:text-lg">
                          ₹{edata.lastMonthSale}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="">
                        <span className="md:text-lg font-semibold mx-2">
                          Total Sales:
                        </span>
                        {/* <span className='md:text-lg'>₹{edata.sale}</span> */}
                        <span className="md:text-lg">₹{totalSales}</span>
                      </div>
                    </div>
                    <div>
                      {admin ? (
                        ""
                      ) : (
                        <button
                          type="button"
                          className="bg-blue-600 px-2 md:px-4 text-white mx-2"
                          data-bs-toggle="modal"
                          data-bs-target="#exampleModal"
                        >
                          <span>Edit</span>
                        </button>
                      )}
                    </div>
                    <div className="text-end ">
                      <button
                        onClick={handleLogout}
                        className="bg-blue-600 p-2  rounded-md
                         text-slate-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-12 md:col-span-6   h-[20rem]  bg-slate-50 p-2 flex justify-center rounded-xl shadow-lg ">
              <Chart />
            </div>

            <div className="col-span-12  py-6 md:py-4  ">
              <div className="col-span-12  py-6 md:py-4  ">
                {custError ? (
                  <p className="text-center font-bold p-6 bg-white rounded-lg m-2">
                    {custError}
                  </p>
                ) : (
                  <div className="bg-white shadow-md rounded p-4">
                    <div className="flex justify-between items-center ">
                      <h2 className="text-xl font-semibold mb-2">
                        Customer List
                      </h2>
                    </div>

                    <div className="flex justify-start items-center gap-3">
                      <div className="mb-4">
                        <label
                          htmlFor="filter"
                          className="block font-medium text-gray-700"
                        >
                          Month:
                        </label>
                        <select
                          id="filter"
                          name="filter"
                          className="mt-1 p-2 border rounded-md focus:ring focus:ring-indigo-200"
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                        >
                          {month.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="filter"
                          className="block font-medium text-gray-700"
                        >
                          Product:
                        </label>
                        <select
                          id="filter"
                          name="filter"
                          className="mt-1 p-2 border rounded-md focus:ring focus:ring-indigo-200"
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                        >
                          {product.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* customer table ---------------------------------------------------------------- */}
                    <div className="overflow-x-auto">
                      {/* <CustomerTable params={params} /> */}
                      <table className="w-full border border-collapse">
                        <thead>
                          <tr>
                            <th className="border px-4 py-2 sm:px-6 md:px-8">
                              Date
                            </th>
                            <th className="border px-4 py-2 sm:px-6 md:px-8">
                              Customer ID
                            </th>
                            <th className="border px-4 py-2 sm:px-6 md:px-8">
                              Customer Name
                            </th>
                            <th className="border px-4 py-2 sm:px-6 md:px-8">
                              Customer Email ID
                            </th>
                            <th className="border px-4 py-2 sm:px-6 md:px-8">
                              Customer Phone No
                            </th>
                            {filter === "all" && (
                              <th className="border px-4 py-2 sm:px-6 md:px-8">
                                Product
                              </th>
                            )}
                            <th className="border px-4 py-2 sm:px-6 md:px-8">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((customer) => (
                            <tr key={customer.id}>
                              <td className="border px-4 py-2 sm:px-6 md:px-8">
                                {formatDate(customer.createdAt)}
                              </td>
                              <td className="border px-4 py-2 sm:px-6 md:px-8">
                                {customer._id}
                              </td>
                              <td className="border px-4 py-2 sm:px-6 md:px-8">
                                {customer.firstName} {customer.lastName}
                              </td>
                              <td className="border px-4 py-2 sm:px-6 md:px-8">
                                {customer.email}
                              </td>
                              <td className="border px-4 py-2 sm:px-6 md:px-8">
                                {customer.phone}
                              </td>
                              {filter === "all" && (
                                <td className="border px-4 py-2 sm:px-6 md:px-8">
                                  <ul>
                                    {customer.products.map((product, index) => (
                                      <li key={index}>
                                        <p> {product.name}</p>
                                      </li>
                                    ))}
                                  </ul>
                                </td>
                              )}
                              <td className="border px-4 py-2 sm:px-6 md:px-8">
                                ₹{customer.totalAmount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="text-center p-2 my-2">
                      <button
                        className={`${
                          currentPage === 1 ? "bg-blue-400" : "bg-blue-600"
                        } text-slate-50  px-2 `}
                        onClick={handlePreviousBtn}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      <span className="font-medium mx-2">
                        Page {currentPage}/{totalPages}
                      </span>
                      <button
                        className={`${
                          currentPage >= totalPages
                            ? "bg-blue-400"
                            : "bg-blue-600"
                        } text-slate-50  px-2 `}
                        onClick={handleNextBtn}
                        disabled={currentPage >= totalPages}
                      >
                        Next
                      </button>
                    </div>

                    <div className="text-end">
                      <form
                        onSubmit={handleGoToPage}
                        style={{ display: "inline" }}
                      >
                        <input
                          type="number"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-sm py-1 focus:ring-blue-500 focus:border-blue-500"
                          value={goToPage}
                          onChange={handleInputChange}
                          min={1}
                          max={totalPages}
                          placeholder={`${currentPage}/${totalPages}`}
                        />
                        <button
                          className="px-4 py-1 bg-blue-600 text-slate-50 rounded-md mx-2"
                          type="submit"
                        >
                          Go
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>

              {/* Monthly sales */}
              <h1 className="text-2xl font-semibold mb-4 ">Monthly Sales</h1>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 p-2">Month</th>
                    <th className="border border-gray-300 p-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((item, index) => (
                    <tr
                      className="bg-slate-100 hover:bg-gray-300 hover:text-black cursor-pointer"
                      key={index}
                    >
                      {/* <td>{`${item._id.month}`}</td> */}
                      <td className="p-2 border  ">
                        {months[item._id.month - 1]}
                      </td>
                      <td className="p-2 border    ">₹{item.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* summary */}
            <div className="col-span-12 px-4 md:px-10 py-6 md:py-4 ">
              <div className="bg-white shadow-md rounded-xl p-4 mb-4">
                <h2 className="text-xl font-semibold mb-2">Summary</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-blue-200 p-4 rounded">
                    <p className="text-lg font-semibold mb-1">
                      Total Customers
                    </p>
                    <p>{customers.length}</p>
                  </div>
                  <div className="bg-green-200 p-4 rounded">
                    <p className="text-lg font-semibold mb-1">
                      Customers Onboarded This Month
                    </p>
                    <p>{thisMonthCustomers.length}</p>
                  </div>
                  <div className="bg-purple-200 p-4 rounded">
                    <p className="text-lg font-semibold mb-1">
                      Earnings Next Month
                    </p>
                    <p>₹{edata.lastMonthSale * 1.1}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal-------------------------------------------------- */}

      <div
        className="modal fade"
        id="exampleModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              {/* <pre>{JSON.stringify(edit, null, 2)}</pre> */}
              <h5 className="modal-title" id="exampleModalLabel">
                Edit your data
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="flex gap-2">
                <button
                  className={`${
                    active == "Email"
                      ? "bg-blue-600 text-slate-100 p-2"
                      : "p-2 bg-slate-200"
                  }`}
                  onClick={() => setActive("Email")}
                >
                  Email
                </button>

                <button
                  className={`${
                    active == "Password"
                      ? "bg-blue-600 text-slate-100 p-2"
                      : "p-2 bg-slate-200"
                  }`}
                  onClick={() => setActive("Password")}
                >
                  Password
                </button>
              </div>

              <div>
                {active == "Email" ? (
                  <EditEmail params={params} socket={socket} />
                ) : (
                  <EditPassword params={params} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
