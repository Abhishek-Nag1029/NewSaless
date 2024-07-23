import React from 'react';
import { Line } from 'react-chartjs-2';
import { options, data } from './linechart';
import './globals.css'

const DataPage: React.FC = () => {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center">
        <h1 className="text-2xl font-semibold mb-4">Previous Performances</h1>
  
        <div style={{ width: '1000px', height: '500px' }}>
          <Line options={options} data={data} className="w-1/8 h-1/8" />
        </div>
        <h1 className="text-2xl font-semibold mb-4 mt-12">Monthly Sales</h1>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Month</th>
              <th className="border border-gray-300 p-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {data.labels.map((label, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{label}</td>
                <td className="border border-gray-300 p-2">{data.datasets[0].data[index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default DataPage;