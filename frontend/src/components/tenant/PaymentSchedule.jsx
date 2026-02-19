import React from 'react';
import { CheckCircle, Clock, CreditCard } from 'lucide-react';

const PaymentSchedule = ({ cheques }) => {
  // Map backend status to UI colors
  const getStatusStyle = (status) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-blue-100 text-blue-700';
      case 'BOUNCED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50">
        <h3 className="text-lg font-bold text-gray-800">Payment Schedule</h3>
        <p className="text-sm text-gray-500">Post-dated cheques for current lease</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 font-semibold">Cheque #</th>
              <th className="px-6 py-3 font-semibold">Due Date</th>
              <th className="px-6 py-3 font-semibold">Amount</th>
              <th className="px-6 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cheques?.length > 0 ? cheques.map((cheque, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-700">
                  {cheque.cheque_number}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(cheque.cheque_date).toLocaleDateString('en-AE', { 
                    year: 'numeric', month: 'short', day: 'numeric' 
                  })}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                  AED {parseFloat(cheque.amount).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(cheque.status)}`}>
                    {cheque.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">
                  No payment records found for this lease.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentSchedule;