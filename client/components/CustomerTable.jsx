"use client"
import axios from 'axios';
import React, { useState, useEffect } from 'react';

const CustomerTable = ({ params }) => {
    const [productFilter, setProductFilter] = useState('All');
    const [timeFrameFilter, setTimeFrameFilter] = useState('current month');
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 3;
    const [customers, setCustomers] = useState([]);
    const [range, setRange] = useState('');
    const [totalRecords, setTotalRecords] = useState(0);


    useEffect(() => {
        fetchSalesData(currentPage);
    }, [currentPage, productFilter, timeFrameFilter, params.id]); // Ensure to include params.id if you want to refetch when it changes

    const fetchSalesData = async (page) => {
        setLoading(true);
        setError('');

        // Check the timeFrameFilter value before constructing the query
        let timeFrameForQuery = timeFrameFilter.toLowerCase();
        // If the value is supposed to be a number within 0-11,
        // ensure to check its validity and convert to string accordingly
        if (!isNaN(timeFrameForQuery) && timeFrameForQuery >= 0 && timeFrameForQuery < 12) {
            timeFrameForQuery = timeFrameForQuery.toString();
        } else if (timeFrameForQuery !== "current" && timeFrameForQuery !== "last") {
            // If the value is not a number and not one of the acceptable strings, set it to a default
            timeFrameForQuery = "current"; // Or whatever default your application should use
        }

        const queryParameters = new URLSearchParams({
            page: page.toString(),
            limit: itemsPerPage.toString(),
            product: productFilter !== 'All' ? productFilter : '',
            timeFrame: timeFrameForQuery
        });

        try {
            const response = await axios.get(`http://localhost:3000/api/customer/${params.id}?${queryParameters.toString()}`, {
                withCredentials: true,
            });
            console.log(response);
            setSalesData(response.data.data);
            setTotalPages(Math.ceil(response.data.totalCount / itemsPerPage));
            setCurrentPage(page);
        } catch (error) {
            console.error('Fetch error:', error);
            setError('Failed to fetch data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Pagination functions
    const nextPage = () => {
        setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev));
    };

    const prevPage = () => {
        setCurrentPage(prev => (prev > 1 ? prev - 1 : prev));
    };


    // Helper function for formatting date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };




    return <>
        <div>
            <pre>{JSON.stringify(productFilter, null, 2)}</pre>
            <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
                <option value="All">All Products</option>
                <option value="Product A">Product A</option>
                <option value="Product B">Product B</option>
                <option value="Product C">Product C</option>
                <option value="Product D">Product D</option>
            </select>

            <select value={timeFrameFilter} onChange={(e) => setTimeFrameFilter(e.target.value)}>
                <option value="current month">Current Month</option>
                <option value="last month">Last Month</option>
                <option value="quarterly">Quarterly</option>
                <option value="semi-annually">Semi-Annually</option>
                <option value="annually">Annually</option>
            </select>
            {/* <pre>{JSON.stringify(salesData, null, 2)}</pre> */}
            {salesData && (
                <div>
                    <table className="w-full border border-collapse">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2 sm:px-6 md:px-8">Date</th>
                                <th className="border px-4 py-2 sm:px-6 md:px-8">Customer ID</th>
                                <th className="border px-4 py-2 sm:px-6 md:px-8">Customer Name</th>
                                <th className="border px-4 py-2 sm:px-6 md:px-8">Customer Email ID</th>
                                <th className="border px-4 py-2 sm:px-6 md:px-8">Customer Phone No</th>
                                <th className="border px-4 py-2 sm:px-6 md:px-8">Product</th>
                                <th className="border px-4 py-2 sm:px-6 md:px-8">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesData.map((customer) => (
                                <tr key={customer.id}>
                                    <td className="border px-4 py-2 sm:px-6 md:px-8">{formatDate(customer.createdAt)}</td>
                                    <td className="border px-4 py-2 sm:px-6 md:px-8">{customer._id}</td>
                                    <td className="border px-4 py-2 sm:px-6 md:px-8">{customer.firstName} {customer.lastName}</td>
                                    <td className="border px-4 py-2 sm:px-6 md:px-8">{customer.email}</td>
                                    <td className="border px-4 py-2 sm:px-6 md:px-8">{customer.phone}</td>
                                    <td className="border px-4 py-2 sm:px-6 md:px-8">
                                        <ul>
                                            {customer.products.map((product, index) => (
                                                <li key={index}>
                                                    <p> {product.name}</p>
                                                </li>
                                            ))}
                                        </ul>

                                    </td>
                                    <td className="border px-4 py-2 sm:px-6 md:px-8">₹{customer.totalAmount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div>
                <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
                <span>{`Page ${currentPage} of ${totalPages}`}</span>
                <button onClick={nextPage} disabled={currentPage >= totalPages}>Next</button>
            </div>
        </div>
    </>
}

export default CustomerTable