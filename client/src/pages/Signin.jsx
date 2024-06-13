import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {useSelector ,useDispatch} from 'react-redux';
import { signInStart,signInSuccess,signInFailure } from '../redux/user/userSlice';
import OAuth from '../components/OAuth';


export default function Signin() {
  const [formData, setFormData] = useState({});
  const {loading , error} =useSelector((state) => state.user);


  const navigate = useNavigate();
  const dispatch =useDispatch();
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if email and password are entered
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      dispatch(signInStart());

      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log(data);
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }

      // Reset error and loading states
      //setError(null);
      //setLoading(false);
 dispatch(signInSuccess(data));
      // Navigate to the home page
      navigate('/');
    } catch (error) {
      setLoading(false);
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className='p-30 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign In</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input type="email" placeholder='Email' className='border p-3 rounded-lg' id='email' onChange={handleChange} />
        <input type="password" placeholder='Password' className='border p-3 rounded-lg' id='password' onChange={handleChange} />
        <button disabled={loading} className={`bg-slate-700 text-white p-3 rounded-lg uppercase ${loading ? 'opacity-80 cursor-not-allowed' : 'opacity-95 hover:opacity-100'}`}>
          {loading ? 'Loading...' : 'Sign In'}
        </button>
          <OAuth/>

      </form>

      <div className='flex gap-2 mt-5'>
        <p>Don't have an account?</p>
        <Link to="/signup" className='text-blue-700'>
          Sign up
        </Link>
      </div>

      {error && <p className='text-red-500 mt-5'>{error}</p>}
    </div>
  );
}
