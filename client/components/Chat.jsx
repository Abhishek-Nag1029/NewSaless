import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { useParams } from 'next/navigation';

const LineChart = () => {
  const [monthlyData, setMonthlyData] = useState({});
  const params = useParams()
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace this URL with the actual URL to your API endpoint
        const response = await axios.get(`http://localhost:3000/api/customer/employee/total-amount-per-month/${params.id}`);

        // Transform the array into an object with months as keys
        const dataMap = response.data.reduce((acc, current) => {
          const monthIndex = current._id.month; // Month coming from the API
          acc[monthIndex] = current.totalAmount;
          return acc;
        }, {});

        setMonthlyData(dataMap);
      } catch (error) {
        // Handle errors here
        console.error('Error fetching data:', error);
        // Optionally set the error state to display the error message to the user
      }
    };

    // Make sure we have the id before fetching
    if (params.id) {
      fetchData();
    }
  }, [params.id]); // Dependency array ensures that the effect runs when `id` changes

  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Map the months to their respective totalAmount, defaulting to 0
  const amounts = labels.map((label, index) => {
    // Keep in mind the API provides months in 1-indexed format, JavaScript's Date object is 0-indexed
    const monthIndex = index + 1;
    return monthlyData[monthIndex] || 0;
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Total Sales per Month',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: amounts,
      },
    ],
  };



  // Return the Line component with data and options passed as props
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Line data={data} options={{ maintainAspectRatio: false }} />
    </div>
  );
};

export default LineChart;