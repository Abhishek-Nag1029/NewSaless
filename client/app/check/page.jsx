"use client"; // Add this line at the top

import axios from 'axios';
import React, { useState, useEffect } from 'react';

const Page = () => {
    const [data, setData] = useState([]);
    const [value, setValue] = useState(0);

    const totalSalesDataOfEmployee = async (id) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/customer/employee/total-amount-per-month/${id}`);
            setData(response.data);
            const sales = response.data.reduce((acc, cur) => acc + cur.totalAmount, 0);
            setValue(sales);
        } catch (error) {
            console.error('Error fetching sales data:', error);
        }
    };

    useEffect(() => {
        totalSalesDataOfEmployee(2);
    }, []);

    return (
        <>
            <div>{value}</div>
            <div>
                {data.map((item) => (
                    <div key={item.id}>
                        {/* Assuming item has an id field */}
                        {/* <p>total value  {totalSalesDataOfEmployee(item.id)}</p> */}
                    </div>
                ))}
            </div>
        </>
    );
};

export default Page;
