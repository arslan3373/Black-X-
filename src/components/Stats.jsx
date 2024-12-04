import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Assuming you have already configured firebase
import { TailSpin } from 'react-loader-spinner'; // Importing the loader

const Stats = () => {
  const [dashboardData, setDashboardData] = useState([
    { label: 'Total Advisors', value: 0 },
    { label: 'Total SuperAdvisors', value: 0 },
    { label: 'Total Posts', value: 0 },
    { label: 'Total Coupons', value: 0 },
    { label: 'Total Bookings', value: 0 },
    { label: 'Total Notifications', value: 0 },
    { label: 'Total Ideas', value: 0 },
    { label: 'Total Packages', value: 0 },
  ]);
  const [loading, setLoading] = useState(true); // Set loading state

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true); // Set loading to true while fetching
      try {
        // Fetch Advisors
        const advisorsSnapshot = await getDocs(collection(db, 'userCollection'));
        const totalUsers = advisorsSnapshot.docs.length;

        // Fetch Super Advisors
        // const superAdvisorsSnapshot = await getDocs(collection(db, 'users'));
        // const totalSuperAdvisors = superAdvisorsSnapshot.docs.filter(doc => doc.data().type === 'superadvisor').length;

        // // Fetch Posts
        // const postsSnapshot = await getDocs(collection(db, 'posts'));
        // const totalPosts = postsSnapshot.size;

        // // Fetch Coupons
        // const couponsSnapshot = await getDocs(collection(db, 'coupons'));
        // const totalCoupons = couponsSnapshot.size;

        // // Fetch Bookings
        // const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
        // const totalBookings = bookingsSnapshot.docs.filter(doc => doc.data().type === 'booking').length;

        // // Fetch Notifications
        const notificationsSnapshot = await getDocs(collection(db, 'notificationCollection'));
        const totalNotifications = notificationsSnapshot.size;

        // // Fetch Ideas
        // const ideasSnapshot = await getDocs(collection(db, 'ideas'));
        // const totalIdeas = ideasSnapshot.size;

        // Fetch Packages
        // const packagesSnapshot = await getDocs(collection(db, 'packages'));
        // const totalPackages = packagesSnapshot.size;

        // Set the fetched data into dashboardData
        setDashboardData([
          { label: 'Total Users', value: totalUsers },
          { label: 'Total Notifications', value: totalNotifications },
          // { label: 'Total Posts', value: totalPosts },
          // { label: 'Total Coupons', value: totalCoupons },
          // { label: 'Total Bookings', value: totalBookings },
          // { label: 'Total Ideas', value: totalIdeas },
          // { label: 'Total Payments', value: totalNotifications },
          // { label: 'Total Packages', value: totalPackages },
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false); // Stop loading after data is fetched
      }
    };

    fetchStats(); // Call the function on component mount
  }, []);

  return (
    <>
      <h1 className="pb-6 text-3xl font-bold font-krona ">Dashboard</h1>
      {loading ? (
        // Loader while fetching data
        <div className="flex items-center justify-center h-64">
          <TailSpin
            height="80"
            width="80"
            color="black"
            ariaLabel="loading"
          />
        </div>
      ) : (
        // Display data once loaded
        <div className="grid grid-cols-1 gap-6 pr-2 md:grid-cols-2 lg:grid-cols-4">
          {dashboardData.map((items, index) => (
            // shadow-lg transform transition ease-linear duration-[1000] hover:-translate-y-2
            <div key={index} className="p-6 lg:h-[130px] h-full w-full lg:max-w-[340px] bg-white rounded-lg ">
              <h3 className="text-md ">{items.label}</h3>
              <p className="py-4 text-2xl font-bold ">{items.value}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Stats;
