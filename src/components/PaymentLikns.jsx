import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { TailSpin } from "react-loader-spinner";

export const PaymentLikns = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
//   const [selectedNotification, setSelectedNotification] = useState(null);

  // Robust date formatting function
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';

    try {
      // Handle different timestamp formats
      let dateObj;
      
      // If it's already a Date object
      if (timestamp instanceof Date) {
        dateObj = timestamp;
      } 
      // If it's a Firestore Timestamp
      else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        dateObj = timestamp.toDate();
      } 
      // If it's a string with specific format
      else if (typeof timestamp === 'string') {
        // Try parsing the specific format you mentioned
        const match = timestamp.match(/(\w+ \d+, \d{4}) at (\d{1,2}:\d{2}:\d{2} [AP]M) (UTC[+-]\d+)/);
        if (match) {
          dateObj = new Date(`${match[1]} ${match[2]} ${match[3]}`);
        } else {
          // Fallback to standard date parsing
          dateObj = new Date(timestamp);
        }
      } 
      // If it's a number (timestamp)
      else if (typeof timestamp === 'number') {
        dateObj = new Date(timestamp);
      } 
      else {
        return 'Invalid Date';
      }

      // Format the date
      return dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const notificationsSnapshot = await getDocs(
          collection(db, "paymentLinkCollection")
        );
        const notificationsData = notificationsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt || null
          };
        });
        setNotifications(notificationsData);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredNotifications = notifications.filter((notification) =>
    `${notification.senderName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container p-4 mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Payment Links</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search Payment Links"
            className="w-full py-2 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg 
            className="absolute w-5 h-5 text-gray-400 left-3 top-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <TailSpin height="80" width="80" color="blue" ariaLabel="loading" />
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="w-full text-left table-auto text-custom-gray">
        <thead>
          <tr className='text-lg text-customGray'>
            <td className="pl-2">Sender</td>
            <td className="pl-3">Date</td>
            <td className="pl-4">Description</td>
      
          </tr>
        </thead>
            <tbody >
              {filteredNotifications.map((notification) => (
                <tr key={notification.id} className="px-2 bg-white border-b-[12px] text-gray-900 border-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {notification.senderName || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="">
                      {formatDate(notification.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm ">
                      {notification.description || 'N/A'}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notification Details Modal */}
      {/* {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
          <div className="relative w-auto max-w-3xl mx-auto my-6">
            <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
              <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
                <h3 className="text-xl font-semibold">Payment Link Details</h3>
                <button
                  className="float-right p-1 ml-auto text-3xl font-semibold leading-none text-black bg-transparent border-0 outline-none opacity-5 focus:outline-none"
                  onClick={() => setSelectedNotification(null)}
                >
                  ×
                </button>
              </div>
              <div className="relative flex-auto p-6">
                <p className="my-4 text-lg leading-relaxed text-blueGray-500">
                  <strong>Sender:</strong> {selectedNotification.senderName}
                  <br />
                  <strong>Date:</strong> {formatDate(selectedNotification.createdAt)}
                  <br />
                  <strong>Description:</strong> {selectedNotification.description}
                </p>
              </div>
              <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200">
                <button
                  className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-white uppercase transition-all duration-150 ease-linear bg-blue-500 rounded shadow hover:shadow-lg focus:outline-none"
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};