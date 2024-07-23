// pages/Dashboard.tsx
import React, { useState } from 'react';
import './globals.css'

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    product: string;
    amount: number;
    date: string;
}

const customers: Customer[] = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        product: 'Product A',
        amount: 1000,
        date: '2023-08-01',
    },
    {
        id: 2,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        product: 'Product B',
        amount: 100,
        date: '2023-07-01',
    },
    {
        id: 3,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        product: 'Product A',
        amount: 200,
        date: '2023-07-01',
    },
    {
        id: 4,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        product: 'Product C',
        amount: 5000,
        date: '2023-08-01',
    },
    {
        id: 5,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        product: 'Product A',
        amount: 1000,
        date: '2023-06-01',
    }
    // ...add more customers as needed
];

const Dashboard: React.FC = () => {
    const [filter, setFilter] = useState('all');
    const filterOptions = [
        { value: 'all', label: 'All' },
        { value: 'thisMonth', label: 'This Month' },
        { value: 'Product A', label: 'Product A' },
        { value: 'Product B', label: 'Product B' },
        { value: 'Product C', label: 'Product C' },
    ];

    const filteredCustomers = filter === 'all'
        ? customers
        : filter === 'thisMonth'
            ? customers.filter(
                (customer) => new Date(customer.date).getMonth() === new Date().getMonth()
            )
            : customers.filter((customer) => customer.product === filter);

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="bg-white shadow-md rounded p-4 mb-4">
                <h2 className="text-xl font-semibold mb-2">Summary</h2>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-200 p-4 rounded">
                        <p className="text-lg font-semibold mb-1">Total Customers</p>
                        <p>{customers.length}</p>
                    </div>
                    <div className="bg-green-200 p-4 rounded">
                        <p className="text-lg font-semibold mb-1">Customers Onboarded This Month</p>
                        <p>{filteredCustomers.length}</p>
                    </div>
                    <div className="bg-purple-200 p-4 rounded">
                        <p className="text-lg font-semibold mb-1">Earnings Next Month</p>
                        <p>${customers.reduce((total, customer) => total + customer.amount, 0)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-md rounded p-4">
                <h2 className="text-xl font-semibold mb-2">Customer List</h2>
                <div className="mb-4">
                    <label htmlFor="filter" className="block font-medium text-gray-700">
                        Filter:
                    </label>
                    <select
                        id="filter"
                        name="filter"
                        className="mt-1 p-2 border rounded-md focus:ring focus:ring-indigo-200"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        {filterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <table className="w-full border border-collapse">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">Date</th>
                            <th className="border px-4 py-2">Customer ID</th>
                            <th className="border px-4 py-2">Customer Name</th>
                            <th className="border px-4 py-2">Customer Email ID</th>
                            <th className="border px-4 py-2">Customer Phone No</th>
                            {filter === 'all' && <th className="border px-4 py-2">Product</th>}
                            <th className="border px-4 py-2">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map((customer) => (
                            <tr key={customer.id}>
                                <td className="border px-4 py-2">{customer.date}</td>
                                <td className="border px-4 py-2">{customer.id}</td>
                                <td className="border px-4 py-2">{customer.name}</td>
                                <td className="border px-4 py-2">{customer.email}</td>
                                <td className="border px-4 py-2">{customer.phone}</td>
                                {filter === 'all' && <td className="border px-4 py-2">{customer.product}</td>}
                                <td className="border px-4 py-2">${customer.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
