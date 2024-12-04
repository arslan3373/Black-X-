import React, { useEffect, useState } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { TailSpin } from 'react-loader-spinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

export const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [user, setUser] = useState('');
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState('single');
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  // Create a mapping of user IDs to user names
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'userCollection'));
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);

        // Create user ID to name mapping
        const userMapping = {};
        usersData.forEach((user) => {
          userMapping[user.id] = user.name || 'N/A';
        });
        setUserMap(userMapping);

        // Fetch notifications
        const notificationsSnapshot = await getDocs(collection(db, 'notificationCollection'));
        const notificationsData = notificationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Ensure createdAt is properly formatted
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
        }));
        
        // Sort notifications by date
        const sortedNotifications = notificationsData.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setNotifications(sortedNotifications);
      } catch (error) {
        console.error('Error fetching data:', error);
        showToastError('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSendClick = async () => {
    if (!notificationMessage) {
      showToastError('Notification message cannot be empty');
      return;
    } 

    if (selectedOption === 'single' && !user) {
      showToastError('Please select a user');
      return;
    }

    try {
      const newNotification = {
        notification: notificationMessage,
        userID: selectedOption === 'all' ? 'all' : user,
        createdAt: serverTimestamp(),
        isRead: false
      };

      const notificationsRef = collection(db, 'notificationCollection');
      const docRef = await addDoc(notificationsRef, newNotification);

      // Update local state to reflect new notification
      const createdNotification = {
        id: docRef.id,
        ...newNotification,
        createdAt: new Date() // Use current date for immediate UI update
      };

      setNotifications((prevNotifications) => [
        createdNotification,
        ...prevNotifications
      ]);

      // Clear form and close modal
      setNotificationMessage('');
      setUser('');
      setShowNotificationForm(false);

      toast.success(`Notification Sent Successfully to ${selectedOption === 'all' ? 'All Users' : userMap[user]}`, {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      showToastError('Failed to Send notification. Please try again.');
    }
  };

  const handleSendNotification = () => {
    setShowNotificationForm(true);
  };

  const showToastError = (message) => {
    toast.error(message, {
      position: 'top-right',
      autoClose: 3000,
      theme: 'colored',
    });
  };

  const closeNotificationForm = () => {
    setShowNotificationForm(false);
  };

  const filteredNotifications = notifications.filter(notification => {
    // If it's an 'all' notification or matches a specific user
    const name = notification.userID === 'all' 
      ? 'All Users' 
      : (userMap[notification.userID] || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  // Format date helper function
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = date instanceof Date ? date : new Date(date);
    return {
      date: dateObj.toLocaleDateString(),
      time: dateObj.toLocaleTimeString()
    };
  };

  return (
    <div className="">
      <div>
        <div className='flex items-center justify-between'>
          <h1 className="text-lg font-bold sm:text-2xl font-krona">Notifications</h1>
          <div className='flex gap-4'>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Username"
                className="py-2 pl-10 pr-4 rounded-md focus:outline-none focus:ring-2 focus:ring-headings"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            <button 
              onClick={handleSendNotification}
              className='w-40 py-2 font-semibold text-white rounded-md bg-headings font-krona'
            >
              Send Notification
            </button>
          </div>
        </div>

        {/* Notification form modal */}
        {showNotificationForm && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-500 bg-opacity-75">
            <div className="p-4 bg-white rounded-md shadow-lg w-[360px] relative">
              <div className='flex items-center justify-between py-4'>
                <h2 className="text-xl font-bold font-krona">Create Notification</h2>
                <button 
                  className='px-2 font-bold text-white rounded-full bg-headings font-krona' 
                  onClick={closeNotificationForm}
                >
                  X
                </button>
              </div>

              <div className="flex flex-col space-y-4">
                <textarea 
                  placeholder="Notification Message"
                  value={notificationMessage} 
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  className="p-2 py-4 border border-gray-300 rounded-md min-h-[100px]"
                />

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      value="all" 
                      checked={selectedOption === 'all'} 
                      onChange={() => setSelectedOption('all')} 
                      className="cursor-pointer form-radio"
                    />
                    <span>Select All Users</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      value="single" 
                      checked={selectedOption === 'single'} 
                      onChange={() => setSelectedOption('single')} 
                      className="cursor-pointer form-radio"
                    />
                    <span>Individual User</span>
                  </label>
                </div>

                {selectedOption === 'single' && (
                  <select 
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    className="p-2 py-4 border border-gray-300 rounded-md cursor-pointer"
                  >
                    <option value="">Select User</option>
                    {users.sort((a, b) => a.name.localeCompare(b.name)).map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name || 'N/A'}
                      </option>
                    ))}
                  </select>
                )}

                <button 
                  className="py-4 font-bold text-white rounded-md bg-headings font-krona hover:text-white hover:bg-headings"
                  onClick={handleSendClick}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer />
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <TailSpin
            height="80"
            width="80"
            color="blue"
            ariaLabel="loading"
            visible={true}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-full rounded-md shadow">
            <div className="flex text-lg text-customGray">
              <div className="flex-1 py-3 pl-4 pr-2 text-left">#ID</div>
              <div className="flex-1 w-56 px-4 py-3 text-left">Date & Time</div>
              <div className="flex-1 py-3 pr-4 text-left">User</div>
              <div className="flex-1 py-3 pr-4 text-left">Notification</div>
            </div>

            <div className="flex flex-col">
              {filteredNotifications.map((notification) => {
                const formattedDate = formatDate(notification.createdAt);
                return (
                  <div 
                    key={notification.id} 
                    className="flex py-2 mb-2 text-black bg-white rounded-md"
                  >
                    <div className="flex-1 px-4 py-4 whitespace-nowrap">
                      <p className='font-semibold uppercase'>#{notification.id.slice(0, 8)}</p>
                    </div>
                    <div className="flex w-56 gap-2 py-4 pr-4 whitespace-nowrap">
                      <p>{formattedDate.date}</p>
                      <span className='text-custom-gray'>|</span>
                      <p className='text-customGray'>{formattedDate.time}</p>
                    </div>
                    <div className="flex-1 py-4 pl-16 whitespace-nowrap">
                      <p className='ml-3'>
                        {notification.userID === 'all' 
                          ? 'All Users' 
                          : userMap[notification.userID] || 'N/A'}
                      </p>
                    </div>
                    <div className="flex-1 px-4 py-4 whitespace-nowrap">
                    <button
                      className="px-2 py-1 text-black border rounded-md"
                      onClick={() => setSelectedNotification(notification)}
                    >
<i className="fas fa-bell"></i>
</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* Notification Popup */}
      {selectedNotification && (
        <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold">Notification Details</h2>
            <p className="mt-4">{selectedNotification.notification}</p>
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 text-white rounded-md bg-headings"
                onClick={() => setSelectedNotification(null)}
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