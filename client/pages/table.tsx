import React from 'react';
import './globals.css'

interface MonthlySales {
  month: string;
  sales: number;
}

interface MonthlySalesTableProps {
  data: MonthlySales[];
}

const MonthlySalesTable: React.FC<MonthlySalesTableProps> = ({ data }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-2">Month vs Sales Table</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-2">Month</th>
              <th className="px-4 py-2">Sales</th>
            </tr>
          </thead>
          <tbody>
            {data && data.map((entry, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="px-4 py-2">{entry.month}</td>
                <td className="px-4 py-2">{entry.sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  

export default MonthlySalesTable;
