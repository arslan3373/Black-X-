import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc,deleteDoc,query, doc,orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { TailSpin } from 'react-loader-spinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import img from '../img/image (9).png'
import Swal from 'sweetalert2';
export const UserStats = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query
  const [userBalances, setUserBalances] = useState({});
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersQuery = query(collection(db, 'userCollection'));

        const querySnapshot = await getDocs(usersQuery);
        const usersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((user)=>!user.isDeleted);
        
        setUsers(usersData);  
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUsers();
  }, []);


  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

const filteredUsers = users.filter((user) =>
    `${user.name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleViewDelete = async (user) => {
    if (!user || !user.id) return;
  
    Swal.fire({
      title: "Are you sure?",
      text: `You  want to Delete ${user.name}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "black",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const userDocRef = doc(db, "userCollection", user.id);
          await updateDoc(userDocRef, { isDeleted: true }); // Optional: mark as deleted
          toast.success("User deleted successfully!");
  
          setUsers((prevUsers) =>
            prevUsers.filter((currentUser) => currentUser.id !== user.id)
          );
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.error("Failed to delete user. Please try again.");
        }
      }
    });
  };

  // Authorization token
  const authToken = localStorage.getItem('authToken');

  const handleViewClick = async (user) => {
    setSelectedUser(user);
    setIsSidebarOpen(true);
  
    if (!user.walletAddress) {
      console.error("User has no wallet address.");
      return;
    }
  
    try {
      const response = await fetch(
        `https://seashell-app-liamq.ondigitalocean.app/api/wallet/balances/${user.walletAddress}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      // Group balances by symbol
      const grouped = data.balances.reduce((acc, item) => {
        acc[item.symbol] = acc[item.symbol]
          ? acc[item.symbol] + parseFloat(item.balance)
          : parseFloat(item.balance);
        return acc;
      }, {});
      console.log(grouped)
      // Update state with balances for the selected user
      setUserBalances({ ...userBalances, [user.id]: grouped });
    } catch (error) {
      console.error("Error fetching wallet balances:", error.message);
    }
  };

  const [selectedPaymentHistory, setSelectedPaymentHistory] = useState(null);

  
  // const handleViewClick = async (user) => {
  //   setSelectedUser(user);
  //   setIsSidebarOpen(true);
  
  //   if (!user.walletAddress) {
  //     console.error("User has no wallet address.");
  //     return;
  //   }
  
  //   try {
  //     const response = await fetch(
  //       `https://seashell-app-liamq.ondigitalocean.app/api/wallet/balances/${user.walletAddress}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${authToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }
  
  //     const data = await response.json();
  
  //     const groupedBalances = data.balances.reduce((acc, item) => {
  //       const { coinType, balance, symbol, network } = item;
  
  //       if (coinType === "ERC") {
  //         acc.ERC = acc.ERC || [];
  //         acc.ERC.push({ symbol, balance, network });
  //       } else if (coinType === "TRC") {
  //         acc.TRC = acc.TRC || [];
  //         acc.TRC.push({ symbol, balance, network });
  //       } else if (coinType === "BTC") {
  //         acc.BTC = acc.BTC || [];
  //         acc.BTC.push({ symbol, balance });
  //       } else {
  //         acc.OTHER = acc.OTHER || [];
  //         acc.OTHER.push({ symbol, balance, coinType });
  //       }
  
  //       return acc;
  //     }, {});
  
  //     setUserBalances((prev) => ({ ...prev, [user.id]: groupedBalances }));
  //   } catch (error) {
  //     console.error("Error fetching wallet balances:", error.message);
  //   }
  // };
  

 // First, update your fetchPaymentHistory function
//  dd this to your state declarations at the top of your component/ 




const [isLoadingPayments, setIsLoadingPayments] = useState(false);
 const fetchPaymentHistory = async (user) => {
  try {
    setIsLoadingPayments(true);
    const response = await fetch(
      `https://seashell-app-liamq.ondigitalocean.app/api/transactions/history/${user.walletAddress}`,
      {
        
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch payment history");
    }

    const data = await response.json();
    console.log("Raw data:", data);

    const normalizeTransactions = (data) => {
      if (!data) {
        console.error("No data received");
        return [];
      }

      let allTransactions = [];

      // Handle ERC transactions from the root level
      if (Array.isArray(data)) {
        const ercTransactions = data.map(tx => ({
          type: "ERC Transaction",
          amount: tx.Transfer?.Amount || "N/A",
          amountInUSD: tx.Transfer?.AmountInUSD || "N/A",
          timestamp: tx.Block?.Date || "N/A",
          currency: tx.Transfer?.Currency?.Symbol || "ETH",
          hash: tx.Transaction?.Hash || "Unknown",
          sender: tx.Transfer?.Sender || "Unknown",
          receiver: tx.Transfer?.Receiver || "Unknown",
          status: "Completed"
        }));
        allTransactions = [...allTransactions, ...ercTransactions];
      }

      // Handle transactions from history object if it exists
      if (data.history) {
        // Handle TRC transactions
        if (data.history.TRC) {
          const trcTransactions = data.history.TRC.map(tx => ({
            type: "TRC Transaction",
            amount: tx.amount || "N/A",
            timestamp: tx.timestamp,
            currency: "TRX",
            hash: tx.txID,
            sender: tx.sender,
            receiver: tx.receiver,
            status: tx.status || "Unknown"
          }));
          allTransactions = [...allTransactions, ...trcTransactions];
        }
      }

      return allTransactions.filter(Boolean).sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
    };

    const normalizedTransactions = normalizeTransactions(data);
    console.log("Normalized transactions:", normalizedTransactions);
    setSelectedPaymentHistory(normalizedTransactions);
    
  } catch (error) {
    console.error("Error fetching payment history:", error.message);
    toast.error("Failed to fetch payment history.");
  }
};

const TransactionHistory = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedPaymentHistory) {
      // Simulate a delay for loading (remove if real-time fetching)
      setTimeout(() => {
        setLoading(false);
      }, 500); // Adjust delay as needed
    }
  }, [selectedPaymentHistory]);

  if (!selectedPaymentHistory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-xl p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Payment History</h2>
          <button
            onClick={() => setSelectedPaymentHistory(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="text-xl fas fa-times"></i>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-black rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : selectedPaymentHistory.length > 0 ? (
          <div className="max-h-[70vh] overflow-y-auto space-y-4">
            {selectedPaymentHistory.map((transaction, index) => {
              const isERC = transaction.currency === "ETH" || transaction.type?.includes("ERC");
              const isTRC = transaction.currency === "TRX" || transaction.type?.includes("TRC");

              const bgColor = isERC ? "bg-purple-100" : isTRC ? "bg-green-100" : "bg-gray-100";
              const textColor = isERC ? "text-purple-800" : isTRC ? "text-green-900" : "text-gray-800";

              return (
                <div
                  key={`${transaction.hash}-${index}`}
                  className={`p-2 mb-4 rounded-lg flex justify-between border ${bgColor} shadow-sm`}
                >
                  <div className="flex gap-2">
                    <i className="h-10 mt-2 justify-center w-10 flex items-center text-xl text-green-600 bg-white rounded-[100px] fas fa-arrow-up"></i>
                    <div className="items-center justify-between">
                      <h3 className={`text-lg font-semibold text-gray-500`}>{transaction.type.slice(0,4)}</h3>
                      <p>{new Date(transaction.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p className="pt-3 font-semibold text-gray-800 text-md">
                      {transaction.amount} {transaction.currency} (${transaction.amountInUSD})
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-600">No payment history found.</p>
        )}
      </div>
    </div>
  );
};


  return (
    <>
      <div className="flex justify-between">
        <div className="flex items-start space-x-4 rounded-md font-krona text-headings">
        <h1 className="py-3 text-lg font-bold sm:text-2xl font-krona">Users</h1>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Name"
            className="py-2 pl-10 pr-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-800"
            value={searchQuery} // Bind input to search query state
            onChange={(e) => setSearchQuery(e.target.value)} // Update state on input change
          />
          <span className="absolute left-3 top-2.5">
            <svg
              className="w-5 h-5 text-gray-900"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 2a9 9 0 100 18 9 9 0 000-18zM21 21l-4.35-4.35"
              />
            </svg>
          </span>
        </div>
      </div>

  <>

    {loading ? (
      <div className="flex items-center justify-center h-64">
        <TailSpin height="80" width="80" color="black" ariaLabel="loading" visible={true} />
      </div>
    ) : (
      <table className="w-full text-left table-auto text-custom-gray">
        <thead>
          <tr className='text-lg'>
            <td className="py-2 ">Profile</td>
            <td className="py-2 ">Email</td>
            <td className="py-2 ">Phone Number</td>
            <td className="py-2 ">Payment History</td>
            <td className="py-2 ">Delete User</td>
            <td className="py-2">Details</td>
          </tr>
        </thead>
        <tbody>
          {filteredUsers
          //  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
            .map((user) => (
              <tr key={user.id} className="px-2 bg-white border-b-[12px] text-gray-900 border-gray-50">
                <td className="flex items-center w-48 gap-2 py-3 pl-2">
                {user.image==="null" ? 
                  <img className="w-10 h-10 rounded-full" src={img} alt='' />
                :<img className="w-10 h-10 rounded-full" src={user.image == null? img: user.image } alt='' />}
                  <div>
                    <p className="font-semibold">{user.name==="null"?"N/A":user.name}</p>
                  </div>
                </td>
                <td className="text-left">{user.email ||"N/A"}</td>

                <td className="">{user.phoneNumber==="null"?'N/A': user.phoneNumber}</td>
                <td className="">
                  <button    onClick={() =>  fetchPaymentHistory(user)}>
                    <i className="flex items-center justify-center border rounded-md w-7 h-7 fas fa-history"></i>
                  </button>
                </td>
 
                
                <td className="pl-6">
                  <i 
                    onClick={() => handleViewDelete(user)} 
                    className="pt-[5px] pl-[5px] text-red-600 border rounded-md cursor-pointer w-7 h-7 fas fa-trash"
                  ></i>
                </td>
                <td className="text-center">
                  <button onClick={() => handleViewClick(user)}>
                    <i className="flex items-center justify-center border rounded-md w-7 h-7 fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    )}
    <ToastContainer/>
  </>     
       <div
       className={`fixed top-0 right-0 w-[400px] h-full bg-white shadow-lg transform transition-transform duration-300 ${
         isSidebarOpen ? "translate-x-0" : "translate-x-full"
       }`}
      >
        <div className="flex flex-col justify-between h-full">
          <div className="h-full overflow-y-auto">
            {selectedUser && (
              <div className="mt-4">
                <h1 className="px-2 py-2 text-2xl font-bold text-gray-900 ">
                  User Details
                </h1>
                <div className="flex flex-col justify-center p-2 pt-0">
  {selectedUser.image==="null" ? 
                  <img className="object-cover h-48 p-2 rounded-[30px]" src={img} alt='' />
                :<img className="object-cover h-48 p-2 rounded-[30px]" src={selectedUser.image== null? img: selectedUser.image } alt='' />}

                </div>
                <div className="py-2 space-y-4">
                  <div className="space-y-2">
                    <p className="p-3 pb-2 leading-6 text-gray-900 border-b-2">
                      <strong className="text-xl">Name</strong> <br />
                      {selectedUser.name||"N/A"}
                    </p>
                    <p className="p-3 pb-2 leading-6 text-gray-900 border-b-2">
                      <strong>Email</strong> <br />{" "}
                      {selectedUser.email||"N/A"}
                    </p>
                    <p className="p-3 pb-2 leading-6 text-gray-900 border-b-2 ">
                      <strong>Phone Number</strong> <br />{" "}
                      {selectedUser.phoneNumber==="null" ? "N/A":selectedUser.phoneNumber}
                    </p>
             
                    <p className="p-3 pb-2 leading-6 text-gray-900 border-b-2">
                      <strong>Network Code</strong> <br />{" "}
                    <p className='mt-1 uppercase'>  {selectedUser.networkCode || 'N/A'}</p>
                    </p>
                    <div>
  {selectedUser && (
    <div>
  {userBalances[selectedUser.id] ? (
    <ul>
      {/* ETH Section */}

      {["ETH",
        "USDT",
        "USDC",
        "EURT",
        "EURC",
        "TRX",
        "BNB",
        "BTC",
        "XRP",
      ].map((symbol) => (
        <p key={symbol} className="p-3 pb-2 leading-6 text-gray-900 border-b-2">
          <strong>{symbol}</strong> <br />
          {userBalances[selectedUser.id][symbol] || 0} 
        </p>
      ))}
    </ul>
  ) : selectedUser.walletAddress ? (
    <div className="flex items-center justify-center h-64">
      <TailSpin
        height="50"
        width="50"
        color="black"
        ariaLabel="loading"
        visible={true}
      />
    </div>
  ) : null}
</div>

  )}
    <ToastContainer/>
</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            className="p-3 m-4 font-bold text-white rounded-md bg-headings hover:text-white"
            onClick={closeSidebar}
          >
            Close
          </button>
        </div>
      </div>
      {selectedPaymentHistory && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* <div className="w-full max-w-xl p-6 bg-white rounded-lg shadow-lg"> */}
        
        <TransactionHistory/>
        </div>
        // </div>

)}
    </>
  );
};
