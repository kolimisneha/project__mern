import React from 'react';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import {useNavigate} from 'react-router-dom';

export default function OAuth() {
    const dispatch = useDispatch();
    const navigate=useNavigate();
    
    const handleGoogleClick = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const auth = getAuth(app);
            const result = await signInWithPopup(auth, provider);

            // Extract user data
            const { displayName, email, photoURL } = result.user;

            // Send user data to the backend
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ displayName, email, photoURL }),
            });

            // Parse the JSON response from the backend
            const data = await res.json();

            // Dispatch the signInSuccess action with the received data
            dispatch(signInSuccess(data));
            navigate('/');
        } catch (error) {
            console.error("Could not sign in with Google", error);
        }
    };

    return (
        <button onClick={handleGoogleClick} type='button' className='bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95'>
            Continue with Google
        </button>
    );
}
