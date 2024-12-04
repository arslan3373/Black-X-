import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

import profile from '../img/unnamed.webp';

import { Notification } from './Notification';

import { useNavigate } from 'react-router-dom'; // For navigation
import { signOut } from 'firebase/auth'; // Firebase signOut method
import { auth } from '../firebase';
import { UserStats } from './UserStats';

import Stats from './Stats';
import { PaymentLikns } from './PaymentLikns';
// import { PaymentHistory } from './PaymentHistory';

export const AdminDashboard = () => {
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Toggle for sidebar

    const navigate = useNavigate();
  
    const handleLogout = async () => {
      try {
        await signOut(auth);
        console.log('User logged out');
        navigate('/'); 
      } catch (error) {
        console.error('Logout error:', error);
      }}
  
  const menuItems = [
    { name: 'dashboard', label: 'Dashboard', ico:'fas fa-tachometer-alt' },
    { name: 'users', label: 'Users',  ico:'fas fa-users' },
    // { name: 'ideas', label: 'Ideas', icon: product, ico: 'fas fa-lightbulb' },
    // { name: 'packages', label: 'Investor Information', icon: product, ico: 'fas fa-piggy-bank' },
    // { name: 'posts', label: 'Posts', icon: product, ico: 'fas fa-clipboard' },
    // { name: 'coupons', label: 'Coupons', icon: product, ico: 'fas fa-tags' },
    // { name: 'bookings', label: 'Bookings', icon: product, ico: 'fas fa-book' },
    { name: 'notification', label: 'Notification', ico: 'fas fa-bell' }, 
    { name: 'paymentlinks', label: 'Payment Links', ico: 'fas fa-credit-card' }, 
  ];
  

  return (
    <div className="flex h-[100vh]">
    {/* Sidebar */}
    <div
      className={`fixed inset-0 z-30 w-64 bg-white shadow-lg transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
      style={{ height: '100vh', overflow: 'hidden' }} // Fixed sidebar height
    >
      {/* Close Button for Mobile View */}
      <button
        className="absolute text-headings top-4 right-4 lg:hidden"
        onClick={() => setSidebarOpen(false)}
      >
        <FaTimes className="w-6 h-6" />
      </button>
  
      <div className="pt-5 pb-5 pl-5 text-2xl font-bold text-headings font-krona">
                  <img src={profile} className="rounded-sm w-14 h-14" alt="Profile" />
      {/* smart X */}
      </div>
      <hr />
      <div className="flex flex-col justify-between h-[85%]">
        <nav className="flex-1 py-5 overflow-y-auto">
          <ul className="space-y-4">
            {menuItems.map((item) => (
              <li
                key={item.name}
                className={`flex items-center space-x-4 cursor-pointer p-3 ${
                  activeComponent === item.name
                    ? 'text-black border-l-4 font-bold border-headings bg-gray-100'
                    : 'text-gray-700'
                } hover:text-black`}
                onClick={() => {
                  setActiveComponent(item.name);
                  setSidebarOpen(false); // Close sidebar on mobile after selection
                }}
              >
                <i
                  className={` ${item.ico} ${
                    activeComponent === item.name ? 'text-headings' : ''
                  }`}
                ></i>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex gap-2 pb-5 pl-3 font-medium cursor-pointer text-headings font-krona hover:text-red-700">
        <i className="text-lg fas fa-sign-out-alt"></i> 
                  <button className="" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  
    {/* Main content */}
    <div className="flex-1 w-full overflow-auto">
      <header className="flex justify-between p-6 pb-2 bg-[#F8F8F8] shadow-md lg:shadow-none">
        <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <FaBars className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="font-bold text-md sm:text-2xl font-krona">Welcome Admin!</h1>
          <p className="ml-2 text-sm text-gray-600">
  {new Date().toLocaleDateString('en-US', {
    weekday: 'long', 
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}{' '}
  {new Date().toLocaleTimeString('en-US', {
    hour: 'numeric', 
    minute: 'numeric',
    hour12: true, 
  })}
</p>

        </div>
        {/* <div className="flex items-center space-x-6"> */}
          <div className="flex items-center space-x-2 md:pr-8">
            {/* <img src={profile} className="w-10 h-14 " alt="Profile" /> */}
            {/* <div>
              <p className="font-semibold leading-4 text-headings font-krona">Star X</p>
              <span>Admin</span>
            </div> */}
          </div>
        {/* </div> */}
      </header>
  
      <main className="h-[85%] p-6 bg-[#F8F8F8] overflow-auto">
        {activeComponent === 'dashboard' && <Stats />}
        {activeComponent === 'users' && <UserStats />}
        {/* {activeComponent === 'packages' && <Packages />}
        {activeComponent === 'ideas' && <Ideas />}
        {activeComponent === 'posts' && <Posts />}
        {activeComponent === 'coupons' && <Coupons />}
        {activeComponent === 'bookings' && <BookingPage />} */}
        {activeComponent === 'notification' && <Notification />}
        {activeComponent === 'paymentlinks' && <PaymentLikns />}
        {/* Add components for products and categories as needed */}
      </main>
    </div>
  </div>
  
  );
};
  