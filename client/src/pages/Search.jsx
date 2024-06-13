import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListingItem from '../components/ListingItem';

export default function Search() {
    const navigate = useNavigate();
    const [sidebardata, setSidebardata] = useState({
        searchTerm: '',
        types: { all: false, rent: false, sale: false },
        parking: false,
        furnished: false,
        offer: false,
        sort: 'created_at',
        order: 'desc',
    });

    const [loading, setLoading] = useState(false);
    const [listings, setListings] = useState([]);
    const [showMore, setShowMore] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const initialState = {
            searchTerm: urlParams.get('searchTerm') || '',
            types: {
                all: urlParams.get('type') === 'all',
                rent: urlParams.get('type') === 'rent',
                sale: urlParams.get('type') === 'sale'
            },
            parking: urlParams.get('parking') === 'true',
            furnished: urlParams.get('furnished') === 'true',
            offer: urlParams.get('offer') === 'true',
            sort: urlParams.get('sort') || 'created_at',
            order: urlParams.get('order') || 'desc',
        };
        setSidebardata(initialState);

        const fetchListings = async () => {
            setLoading(true);
            setError(null);
            setShowMore(false);
            const searchQuery = urlParams.toString();
            try {
                const res = await fetch(`/api/listing/get?${searchQuery}`);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                if (Array.isArray(data)) {
                    setShowMore(data.length > 8);
                    setListings(data);
                } else {
                    setListings([]);
                    setError('Unexpected data format');
                }
            } catch (err) {
                setError('Failed to fetch listings. Please try again later.');
                setListings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [window.location.search]);

    const handleChange = (e) => {
        const { id, value, checked, type } = e.target;
        if (id === 'all' || id === 'rent' || id === 'sale') {
            setSidebardata((prev) => ({
                ...prev,
                types: { ...prev.types, [id]: checked }
            }));
        } else {
            setSidebardata((prev) => ({
                ...prev,
                [id]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams(sidebardata);
        const selectedTypes = Object.keys(sidebardata.types)
            .filter(key => sidebardata.types[key])
            .join(',');
        urlParams.set('type', selectedTypes);
        navigate(`/search?${urlParams.toString()}`);
    };

    const onShowMoreClick = async () => {
        const numberOfListings = listings.length;
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('startIndex', numberOfListings);
        const searchQuery = urlParams.toString();
        setLoading(true);
        try {
            const res = await fetch(`/api/listing/get?${searchQuery}`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                setShowMore(data.length >= 9);
                setListings((prev) => [...prev, ...data]);
            } else {
                setError('Unexpected data format');
            }
        } catch (err) {
            setError('Failed to load more listings. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex flex-col md:flex-row'>
            <div className='p-7 border-b-2 md:border-r-2 md:min-h-screen'>
                <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
                    <div className='flex items-center gap-2'>
                        <label className='whitespace-nowrap font-semibold'>
                            Search Term:
                        </label>
                        <input
                            type='text'
                            id='searchTerm'
                            placeholder='Search...'
                            className='border rounded-lg p-3 w-full'
                            value={sidebardata.searchTerm}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='flex gap-2 flex-wrap items-center'>
                        <label className='font-semibold'>Type:</label>
                        {['all', 'rent', 'sale'].map((type) => (
                            <div key={type} className='flex gap-2'>
                                <input
                                    type='checkbox'
                                    id={type}
                                    className='w-5'
                                    onChange={handleChange}
                                    checked={sidebardata.types[type]}
                                />
                                <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                            </div>
                        ))}
                        <div className='flex gap-2'>
                            <input
                                type='checkbox'
                                id='offer'
                                className='w-5'
                                onChange={handleChange}
                                checked={sidebardata.offer}
                            />
                            <span>Offer</span>
                        </div>
                    </div>
                    <div className='flex gap-2 flex-wrap items-center'>
                        <label className='font-semibold'>Amenities:</label>
                        <div className='flex gap-2'>
                            <input
                                type='checkbox'
                                id='parking'
                                className='w-5'
                                onChange={handleChange}
                                checked={sidebardata.parking}
                            />
                            <span>Parking</span>
                        </div>
                        <div className='flex gap-2'>
                            <input
                                type='checkbox'
                                id='furnished'
                                className='w-5'
                                onChange={handleChange}
                                checked={sidebardata.furnished}
                            />
                            <span>Furnished</span>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <label className='font-semibold'>Sort:</label>
                        <select
                            onChange={handleChange}
                            value={`${sidebardata.sort}_${sidebardata.order}`}
                            id='sort_order'
                            className='border rounded-lg p-3'
                        >
                            <option value='regularPrice_desc'>Price high to low</option>
                            <option value='regularPrice_asc'>Price low to high</option>
                            <option value='created_at_desc'>Latest</option>
                            <option value='created_at_asc'>Oldest</option>
                        </select>
                    </div>
                    <button className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95'>
                        Search
                    </button>
                </form>
            </div>
            <div className='flex-1'>
                <h1 className='text-3xl font-semibold border-b p-3 text-slate-700 mt-5'>
                    Listing results:
                </h1>
                <div className='p-7 flex flex-wrap gap-4'>
                    {error && (
                        <p className='text-xl text-red-700 text-center w-full'>{error}</p>
                    )}
                    {!loading && listings.length === 0 && (
                        <p className='text-xl text-slate-700'>No listing found!</p>
                    )}
                    {loading && (
                        <p className='text-xl text-slate-700 text-center w-full'>
                            Loading...
                        </p>
                    )}
                    {!loading &&
                        Array.isArray(listings) &&
                        listings.map((listing) => (
                            <ListingItem key={listing._id} listing={listing} />
                        ))}
                    {showMore && (
                        <button
                            onClick={onShowMoreClick}
                            className='text-green-700 hover:underline p-7 text-center w-full'
                        >
                            Show more
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
