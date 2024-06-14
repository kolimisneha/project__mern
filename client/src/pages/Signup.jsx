import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';



export default function Signup() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all fields are entered
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please enter all details');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log(data);
      if (data.success === false) {
        setLoading(false);
        setError(data.message || 'An error occurred');
        return;
      }

      // Reset error and loading states
      setError(null);
      setLoading(false);

      // Navigate to the sign-in page
      navigate('/signin');
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className='p-30 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign up</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input type="text" placeholder='Username' className='border p-3 rounded-lg' id='username' onChange={handleChange} />
        <input type="email" placeholder='Email' className='border p-3 rounded-lg' id='email' onChange={handleChange} />
        <input type="password" placeholder='Password' className='border p-3 rounded-lg' id='password' onChange={handleChange} />
        <button disabled={loading} className={`bg-slate-700 text-white p-3 rounded-lg uppercase ${loading ? 'opacity-80 cursor-not-allowed' : 'opacity-95 hover:opacity-100'}`}>
          {loading ? 'Loading...' : 'Sign Up'}
        </button>

        <OAuth/>
      </form>

      <div className='flex gap-2 mt-5'>
        <p>Have an account?</p>
        <Link to="/signin" className='text-blue-700'>
          Sign in
        </Link>
      </div>

      {error && <p className='text-red-500 mt-5'>{error}</p>}
    </div>
  );
}
