"use client"
import React, { useState } from 'react';

const ProductForm = () => {
    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        products: [{ name: 'anfansf', quantity: 1, price: 0 }],
        total: 0
    });

    const productOptions = [
        { id: 'abcd', name: 'ABCD', price: 100 },
        { id: 'efgh', name: 'EFGH', price: 200 },
        { id: 'ijkl', name: 'IJKL', price: 300 },
        { id: 'mnop', name: 'MNOP', price: 400 }
    ];

    const handleProductChange = (price, index) => {
        const newProducts = formData.products.map((product, idx) =>
            idx === index ? { ...product, price } : product
        );
        setFormData({ ...formData, products: newProducts });
    };

    const handleQuantityChange = (quantity, index) => {
        const newProducts = formData.products.map((product, idx) =>
            idx === index ? { ...product, quantity } : product
        );
        setFormData({ ...formData, products: newProducts });
    };

    const calculateTotal = () => {
        const total = formData.products.reduce(
            (acc, { quantity, price }) => acc + (price * quantity), 0
        );
        return total * 1.12; // GST included    (100% total percentage + 12% GST ) = 112/100 = 1.12
    };

    const addProduct = () => {
        setFormData({
            ...formData,
            products: [...formData.products, { name: 'anfansf', quantity: 1, price: 0 }]
        });
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const total = calculateTotal();
        setFormData({ ...formData, total });
        console.log('Form Data:', {
            ...formData,
            total,
        });
    };

    return (
        <div className="container mx-auto p-4">
            <form className="space-y-3" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="fname"
                    placeholder="First Name"
                    className="border p-2"
                    value={formData.fname}
                    onChange={handleFormChange}
                    required
                />
                <input
                    type="text"
                    name="lname"
                    placeholder="Last Name"
                    className="border p-2"
                    value={formData.lname}
                    onChange={handleFormChange}
                    required
                />

                <div id="products">
                    {formData.products.map((product, index) => (
                        <div key={index} className="product-line flex space-x-2 mb-2">
                            <select
                                onChange={(e) => handleProductChange(parseInt(e.target.value), index)}
                                className="border p-2"
                                required
                            >
                                <option value="">Choose a product</option>
                                {productOptions.map((option) => (
                                    option.id ? <option key={option.id} value={option.price}>
                                        {option.name} (${option.price})
                                    </option> : null
                                ))}
                            </select>

                            <input
                                type="number"
                                min="1"
                                name="quantity"
                                value={product.quantity}
                                onChange={(e) => handleQuantityChange(parseInt(e.target.value), index)}
                                className="border p-2 w-16"
                                required
                            />
                        </div>
                    ))}
                </div>

                <button type="button" onClick={addProduct} className="border p-2">
                    Add Product
                </button>

                <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-4">
                    Submit
                </button>
            </form>

            <p className="mt-4">Total Amount (incl. GST): ${formData.total.toFixed(2)}</p>

            <div className="mt-4">
                <h3 className="font-bold">Form Submission:</h3>
                <p>First Name: {formData.fname}</p>
                <p>Last Name: {formData.lname}</p>
                <p>Products and Quantities:</p>
                <ul>
                    {formData.products.map((product, index) => (
                        <li key={index}>{`Product ${index + 1}: ${product.name}, Quantity: ${product.quantity}, Price per unit: ${product.price}`}</li>
                    ))}
                </ul>
                <p>Total Amount (incl. GST): ${formData.total.toFixed(2)}</p>
            </div>
        </div>
    );
};

export default ProductForm;