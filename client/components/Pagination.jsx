import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useParams } from 'next/navigation';

const EmployeesList = () => {
    const [employees, setEmployees] = useState([]);
    const [empData, setEmpData] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [customer, setCustomer] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    const limit = 10; // Number of items you want per page
    const [gotoPageValue, setGotoPageValue] = useState('');
    const [salesData, setSalesData] = useState([]);

    const params = useParams()

    useEffect(() => {
        setLoading(true);
        const fetchEmployees = async () => {
            const { key, direction } = sortConfig;
            const sortField = key === 'id' ? '_id' : (key === 'totalSale' ? 'totalSale' : key); // Assume 'id' refers to '_id' in MongoDB
            try {
                const response = await axios.get(`http://localhost:3000/api/employee/fetchemployees`, {
                    params: {
                        page: currentPage,
                        limit: 10,
                        sortField,
                        sortOrder: direction
                    }
                });
                setEmployees(response.data.employees);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
            setLoading(false);
        };

        fetchEmployees();
    }, [currentPage, sortConfig]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const response = await fetch(`http://localhost:3000/api/customer/`);
                const data = await response.json();
                setCustomer(data);
            } catch (error) {
                console.error('Error fetching Customer data:', error);
            }
            setLoading(false);
        };

        fetchData();
    }, []);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get(`http://localhost:3000/api/employee/totalemp`, {
                    withCredentials: true
                });
                setEmpData(data);
            } catch (error) {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                } else {
                    console.error('Error fetching employee data:', error);
                }
            }
        };

        fetchData();
    }, [params.id]);


    // console.log(empData.length);                                                  
    // console.log(empData.reduce((acc, curr) => acc + curr.totalSale, 0));
    const totalEmployeesData = empData.length
    const totalSalesAmount = empData.reduce((acc, curr) => acc + curr.totalSale, 0)


    const handleGotoPageSubmit = (event) => {
        event.preventDefault(); // Prevents the default form submit action
        const page = parseInt(gotoPageValue, 10);
        if (page && page >= 1 && page <= totalPages && page !== currentPage) {
            setCurrentPage(page);
        }
        // Optionally clear the input or provide feedback
        setGotoPageValue('');
    };

    const handleGotoPageInputChange = (event) => {
        setGotoPageValue(event.target.value);
    };


    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };


    const handleSort = (key) => {
        setSortConfig((prevSortConfig) => ({
            key,
            direction: prevSortConfig.direction === 'asc' && prevSortConfig.key === key ? 'desc' : 'asc'
        }));
    };

    const totalEmployees = employees.length;
    const totalSaleAmount = employees.reduce((sale, employee) => sale + employee.totalSale, 0);
    const totalCustomers = employees.reduce((total, employee) => total + employee.totalCustomers, 0);
    // console.log(totalSaleAmount);


    if (loading) {
        return <div>Loading...</div>; // You can replace this with any loading spinner or animation you prefer
    }
    return (
        <>
            <div className="bg-slate-100 shadow-md  p-4 mb-4 mt-2 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Summary</h2>
                <div className="grid grid-cols-12 gap-4 ">
                    <div className="col-span-12 md:col-span-4 bg-blue-200 p-4 rounded">
                        <p className="text-lg font-semibold mb-1">Total Sale</p>
                        <p>₹{totalSalesAmount}</p>
                    </div>
                    <div className="col-span-12 md:col-span-4  bg-green-200 p-4 rounded">
                        <p className="text-lg font-semibold mb-1">Total Employees</p>
                        <p>{totalEmployeesData}</p>
                    </div>
                    <div className="col-span-12 md:col-span-4  bg-purple-200 p-4 rounded">
                        <p className="text-lg font-semibold mb-1">Total Customers</p>
                        <p>{customer.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-md rounded p-4">
                <h2 className="text-xl font-semibold mb-2">Employee List</h2>
                <div className="mb-4 flex justify-end gap-1">
                    <button
                        className="px-4 py-1 md:py-2 border rounded-md focus:ring focus:ring-indigo-200"
                        onClick={() => handleSort('id')}
                    >
                        <span className='text-sm md:text-lg'>Sort by Employee ID</span>
                    </button>
                    <button
                        className="px-4 py-1 md:py-2 border rounded-md focus:ring focus:ring-indigo-200"
                        onClick={() => handleSort('totalSale')}
                    >
                        <span className='text-sm md:text-lg'>Sort by Total Sale</span>
                    </button>
                </div>



                <div className="overflow-x-auto">
                    {/*Employee  Table  */}
                    <table className="w-full table-auto border border-collapse">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2 cursor-pointer">Employee ID</th>
                                <th className="border px-4 py-2 cursor-pointer">Employee Name</th>
                                <th className="border px-4 py-2 cursor-pointer">Employee Email</th>
                                <th className="border px-4 py-2 cursor-pointer">Total Sale</th>
                                <th className="border px-4 py-2 cursor-pointer">Total Customers</th>
                                <th className="border px-4 py-2 cursor-pointer">Salary</th>
                                <th className="border px-4 py-2 cursor-pointer">Profile</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees && employees.map((employee) => (
                                <tr key={employee.id}>
                                    <td className="border px-4 py-2">{employee._id}</td>
                                    <td className="border px-4 py-2">{employee.firstName} {employee.lastName}</td>
                                    <td className="border px-4 py-2">{employee.email}</td>
                                    <td className="border px-4 py-2">
                                        {employee.totalSale}
                                    </td>
                                    <td className="border px-4 py-2">{employee.totalCustomers}</td>
                                    <td className="border px-4 py-2">₹{employee.lastMonthSale * 0.1}</td>
                                    <td className="border px-4 py-2">
                                        <Link href={{
                                            pathname: `/view-emp/${employee._id}`,

                                        }}>
                                            <button
                                                className='py-2 px-5 rounded-lg bg-blue-600 text-slate-50'>View
                                            </button>
                                        </Link>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className='text-center mt-10 mb-2 shadow-gray-300'>
                        <button className={`${currentPage === 1 ? "bg-blue-400" : 'bg-blue-600'}  text-slate-50 px-2 py-1 rounded-md mx-3`}
                            onClick={handlePrevious} disabled={currentPage === 1 || loading}>
                            Previous
                        </button>
                        <span className='font-medium'> Page {currentPage} / {totalPages} </span>
                        <button className={`${currentPage === totalPages ? "bg-blue-400" : 'bg-blue-600 '} text-slate-50 px-2 py-1 rounded-md mx-3`}
                            onClick={handleNext} disabled={currentPage === totalPages || loading}>
                            Next
                        </button>
                    </div>

                    {/* Pagination Input */}
                    <div className='text-end'>
                        <form onSubmit={handleGotoPageSubmit} style={{ display: 'inline' }}>
                            <input
                                type="number"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-sm py-1 focus:ring-blue-500 focus:border-blue-500"
                                value={gotoPageValue}
                                onChange={handleGotoPageInputChange}
                                min={1}
                                max={totalPages}
                                placeholder={`${currentPage}/${totalPages}`}
                            />
                            <button
                                type="submit"
                                className="px-4 py-1 bg-blue-600 text-slate-50 rounded-md mx-2"
                                disabled={loading}>
                                Go
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>


    )
}

export default EmployeesList