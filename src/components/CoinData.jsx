import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

export const CoinData = () => {
  const [transactions, setTransactions] = useState({});
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNetwork, setExpandedNetwork] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('https://seashell-app-liamq.ondigitalocean.app/api/transactions/history/f04267c9-dca6-4f6b-89e9-027053ec4405',
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      
      if (data?.history) {
        setTransactions(data.history);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (dateString.includes(',')) {
        // Handle TRC timestamp format
        return dateString;
      }
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      return dateString;
    }
  };

  const getNetworkColor = (network) => {
    switch (network) {
      case 'BSC':
        return 'bg-yellow-100 text-yellow-800';
      case 'BTC':
        return 'bg-orange-100 text-orange-800';
      case 'ERC':
        return 'bg-blue-100 text-blue-800';
      case 'TRC':
        return 'bg-green-100 text-green-800';
      case 'XRP':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderTransaction = (tx, network) => {
    if (network === 'TRC') {
      return (
        <div className="flex items-center justify-between">
          <div className="flex-grow">
            <div className="font-medium text-gray-900">
              {tx.type}
              <span className={`ml-2 text-sm ${getStatusColor(tx.status)}`}>
                • {tx.status}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(tx.timestamp)}
            </div>
          </div>
          <div className="text-right">
            {tx.amount !== null && (
              <div className="font-bold text-gray-900">
                {tx.amount} TRX
              </div>
            )}
          </div>
        </div>
      );
    }

    // Default rendering for other networks
    return (
      <div className="flex items-center justify-between">
        <div className="flex-grow">
          <div className="font-medium text-gray-900">
            {tx.Transfer?.Currency?.Symbol || network}
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(tx.Block?.Date)}
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-gray-900">
            {tx.Transfer?.Amount} {tx.Transfer?.Currency?.Symbol || network}
          </div>
          {tx.Transfer?.AmountInUSD && parseFloat(tx.Transfer.AmountInUSD) > 0 && (
            <div className="text-sm text-gray-500">
              ≈ ${parseFloat(tx.Transfer.AmountInUSD).toFixed(2)}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTransactionModal = (tx, network) => {
    if (network === 'TRC') {
      return (
        <div className="space-y-4">
          {/* Network Badge */}
          <div className={`inline-block px-3 py-1 rounded-full ${getNetworkColor(network)}`}>
            {network}
          </div>

          {/* Transaction Amount */}
          {tx.amount !== null && (
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-center">
                {tx.amount} TRX
              </div>
            </div>
          )}

          {/* Transaction Details */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">{tx.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${getStatusColor(tx.status)}`}>{tx.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{tx.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">TxID:</span>
              <span className="font-mono text-sm font-medium">
                {tx.txID.slice(0, 10)}...{tx.txID.slice(-8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">From:</span>
              <span className="font-mono text-sm font-medium">
                {tx.sender.slice(0, 6)}...{tx.sender.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To:</span>
              <span className="font-mono text-sm font-medium">
                {tx.receiver.slice(0, 6)}...{tx.receiver.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Default modal content for other networks
    return (
      <div className="space-y-4">
        {/* Network Badge */}
        <div className={`inline-block px-3 py-1 rounded-full ${getNetworkColor(network)}`}>
          {network}
        </div>

        {/* Transaction Amount */}
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold text-center">
            {tx.Transfer?.Amount} {tx.Transfer?.Currency?.Symbol || network}
          </div>
          {tx.Transfer?.AmountInUSD && parseFloat(tx.Transfer.AmountInUSD) > 0 && (
            <div className="text-center text-gray-500">
              ≈ ${parseFloat(tx.Transfer.AmountInUSD).toFixed(2)}
            </div>
          )}
        </div>

        {/* Transaction Details */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{formatDate(tx.Block?.Date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Hash:</span>
            <span className="font-mono text-sm font-medium">
              {tx.Transaction?.Hash?.slice(0, 10)}...
              {tx.Transaction?.Hash?.slice(-8)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">From:</span>
            <span className="font-mono text-sm font-medium">
              {tx.Transfer?.Sender?.slice(0, 6)}...
              {tx.Transfer?.Sender?.slice(-4)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">To:</span>
            <span className="font-mono text-sm font-medium">
              {tx.Transfer?.Receiver?.slice(0, 6)}...
              {tx.Transfer?.Receiver?.slice(-4)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-4 text-center">Loading transactions...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="mb-6 text-2xl font-bold">Transaction History</h1>
      
      <div className="space-y-4">
        {Object.entries(transactions).map(([network, networkTransactions]) => (
          <div key={network} className="overflow-hidden border rounded-lg">
            {/* Network Header */}
            {/* <div 
              className={`flex items-center justify-between p-4 cursor-pointer ${getNetworkColor(network)}`}
              onClick={() => setExpandedNetwork(expandedNetwork === network ? null : network)}
            >
              <div className="flex items-center space-x-2">
                <span className="font-bold">{network}</span>
                <span className="text-sm">({networkTransactions.length} transactions)</span>
              </div>
              {expandedNetwork === network ? <ChevronUp /> : <ChevronDown />}
            </div> */}

            {/* Network Transactions */}
            {(
              <div className="divide-y">
                {networkTransactions.map((tx, index) => (
                  <div 
                    key={tx.txID || tx.Transaction?.Hash || index}
                    className="p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedTransaction({ ...tx, network })}
                  >
                    {renderTransaction(tx, network)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Transaction Details</h2>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {renderTransactionModal(selectedTransaction, selectedTransaction.network)}

            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                onClick={() => setSelectedTransaction(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// export default TransactionHistory;