import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Firestore functions
import { auth, db } from '../firebase'; // Import your Firebase config and Firestore
import background from '../img/Map.png'; // Background image
import catagory from '../img/WhatsApp Image 2024-11-25 at 23.24.04.jpeg'; // Login category image
import profile from '../img/unnamed.webp';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous error

    try {
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Save the token in localStorage
   localStorage.setItem('authToken', user.accessToken);
      const adminDocRef = doc(db, "adminCollection", user.uid); // Firestore query by UID
      const adminDoc = await getDoc(adminDocRef);

      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        if (adminData.docID === user.uid) {
         
          console.log("Authorized Admin: Access granted");
          navigate('/dashboard');
        } else {
          setError('Sorry you are not an Admin....!');
        }
      } else {
        console.error("Admin document does not exist for this user.");
        setError('Sorry you are not an Admin...!');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid credentials or login failed. Please try again.');
    }
  };

  return (
    <>
      <div className="relative h-screen">
        <div className="absolute inset-0 z-0 flex flex-wrap items-center justify-center gap-0">
          <img src={background} alt="" />
          <div className="absolute inset-0 z-10 bg-gray-800 opacity-40"></div>
          <div className="relative z-20"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center py-6 md:h-full md:py-0">
          <div className="flex flex-col items-center justify-center gap-6 mx-4 bg-white rounded-[20px] shadow-md md:flex-row md:gap-0 md:mx-0">
            <div className='h-[572px] flex justify-center items-center pl-4 bg-headings rounded-l-[20px]'>
              <img src={catagory} className="md:max-w-[490px] w-full rounded-l-[17px]" alt="Category" />
            </div>
            <div className="p-10 flex h-[572px] flex-col justify-between w-full md:max-w-[416px] rounded-[17px] md:rounded-l-none">
              <div>
                <h1 className="pb-4 text-2xl font-bold font-krona text-headings">
                  <img src={profile} className="h-16 w-14" alt="Profile" />
                </h1>
                <h1 className="mt-1 text-2xl font-bold font-krona">Admin Login</h1>
                <p className="mt-4 text-gray-600 text-md">
                  Please enter the credentials associated with your account.
                </p>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 mt-4 bg-gray-100 border rounded-md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-3 mt-4 bg-gray-100 border rounded-md"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-red-600">{error}</p>}
              <button
                className="w-full py-2 mt-4 text-white rounded-md bg-headings"
                type="submit"
                onClick={handleLogin}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
