import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Contact({ listing }) {
    const [landlord, setLandlord] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const onChange = (e) => {
        setMessage(e.target.value);
    };

    useEffect(() => {
        if (!listing?.userRef) {
            console.error('No userRef found in listing:', listing);
            setError('No user reference found for this listing');
            setLoading(false);
            return;
        }

        const fetchLandlord = async () => {
            try {
                const res = await fetch(`/api/user/${listing.userRef}`);
                if (!res.ok) throw new Error('Failed to fetch landlord');
                const data = await res.json();
                setLandlord(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setError('Failed to load landlord information');
                setLoading(false);
            }
        };

        fetchLandlord();
    }, [listing]);

    const sanitizeInput = (input) => {
        return encodeURIComponent(input);
    };

    return (
        <div className='flex flex-col gap-2'>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {landlord && (
                <>
                    <p>
                        Contact <span className='font-semibold'>{landlord.username}</span>{' '}
                        for{' '}
                        <span className='font-semibold'>{listing.name.toLowerCase()}</span>
                    </p>
                    <textarea
                        name='message'
                        id='message'
                        rows='2'
                        value={message}
                        onChange={onChange}
                        placeholder='Enter your message here...'
                        className='w-full border p-3 rounded-lg'
                    ></textarea>

                    <Link
                        to={`mailto:${landlord.email}?subject=Regarding ${sanitizeInput(listing.name)}&body=${sanitizeInput(message)}`}
                        className='bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95'
                    >
                        Send Message
                    </Link>
                </>
            )}
  </div>
    );
}
