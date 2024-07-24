"use client"
import axios from 'axios';
import React, { useState } from 'react'

const Page = () => {
    const [data, setData] = useState([])
    const [value, setValue] = useState()
    const totalSalesDataOfEmployee = async (id) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/customer/employee/total-amount-per-month/${id}`);
            setData(response.data);
            const sales = data.reduce((acc, cur) => acc + cur.totalAmount, 0)
            return setValue(sales)

        } catch (error) {
            console.error('Error fetching sales data:', error);
        }
    };
    totalSalesDataOfEmployee(2)

    return <>
        <div>
            {value}
        </div>

        <div>
            {
                data.map(item => <div>
                    {/* <p>total value  {totalSalesDataOfEmployee(item.id)}</p> */}
                </div>)
            }
        </div>

    </>
}

export default Page