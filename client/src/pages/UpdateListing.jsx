import React, { useEffect,useState } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import {useNavigate,useParams} from 'react-router-dom';

export default function CreateListing() {
    const { currentUser } = useSelector(state => state.user);
    const navigate=useNavigate();
    const params=useParams();
    const [files, setFiles] = useState([]);
    const [fileCount, setFileCount] = useState(0);
    const [formData, setFormData] = useState({
        imageUrls: [],
        name: '',
        description: '',
        address: '',
        type: 'rent',
        bedrooms: 1,
        bathrooms: 1,
        regularPrice: 50,
        discountPrice: 0,
        offer: false,
        parking: false,
        furnished: false,
    });
    const [imageUploadError, setImageUploadError] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            const listingId = params.listingId;
            const res=await fetch(`/api/listing/get/${listingId}`);
            const data=await res.json();
            if(data.success===false){
                console.log(data.message);
                return;
            }
            setFormData(data);
        }
        fetchListing();
        }, []);
        
    const handleImageSubmit = () => {
        if (files.length > 0 && files.length + formData.imageUrls.length <= 6) {
            setUploading(true);
            setImageUploadError(false);
            const promises = files.map(file => storeImage(file));

            Promise.all(promises)
                .then((urls) => {
                    setFormData((prevData) => ({
                        ...prevData,
                        imageUrls: prevData.imageUrls.concat(urls),
                    }));
                    setImageUploadError(false);
                    setUploading(false);
                })
                .catch(() => {
                    setImageUploadError('Image upload failed (2MB max per image)');
                    setUploading(false);
                });
        } else {
            setImageUploadError('You can only upload up to 6 images per listing');
            setUploading(false);
        }
    };

    const storeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage(app);
            const fileName = `${new Date().getTime()}_${file.name}`;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                    });
                }
            );
        });
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
        setFileCount(selectedFiles.length);
    };

    const handleRemoveImage = (index) => {
        setFormData((prevData) => ({
            ...prevData,
            imageUrls: prevData.imageUrls.filter((_, i) => i !== index),
        }));
    };

    const handleChange = (e) => {
        const { id, value, checked, type } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(false);

        try {
            if(formData.imageUrls.length<1)
                return setError('you must upload at least one image')
                if(+formData.regularPrice< +formData.discountPrice)
return setError('Discounted Price must be less than regular price')
            const res = await fetch(`/api/listing/update/${params.listingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    userRef: currentUser._id,
                }),
            });

            if (!res.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await res.json();
            if (data.success === false) {
                throw new Error(data.message);
            }

            setLoading(false);
            navigate(`/listing/${data._id}`)
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    }

    return (
        <main className="p-3 max-w-4xl mx-auto">
            <h1 className="text-3xl font-semibold text-center my-7">Update a Listing</h1>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-4 flex-1">
                    <input
                        type="text"
                        placeholder="Name"
                        className="border p-3 rounded-lg"
                        id="name"
                        maxLength="10"
                        required
                        onChange={handleChange}
                        value={formData.name}
                    />
                    <textarea
                        placeholder="Description"
                        className="border p-3 rounded-lg"
                        id="description"
                        required
                        onChange={handleChange}
                        value={formData.description}
                    />
                    <input
                        type="text"
                        placeholder="Address"
                        className="border p-3 rounded-lg"
                        id="address"
                        required
                        onChange={handleChange}
                        value={formData.address}
                    />
                    <div className="flex gap-6 flex-wrap">
                        <div className="flex gap-2">
                            <input
                                type="radio"
                                id="sale"
                                className="w-5"
                                onChange={handleChange}
                                checked={formData.type === 'sale'}
                            />
                            <span>Sell</span>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="radio"
                                id="rent"
                                className="w-5"
                                onChange={handleChange}
                                checked={formData.type === 'rent'}
                            />
                            <span>Rent</span>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="checkbox"
                                id="parking"
                                className="w-5"
                                onChange={handleChange}
                                checked={formData.parking}
                            />
                            <span>Parking spot</span>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="checkbox"
                                id="furnished"
                                className="w-5"
                                onChange={handleChange}
                                checked={formData.furnished}
                            />
                            <span>Furnished</span>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="checkbox"
                                id="offer"
                                className="w-5"
                                onChange={handleChange}
                                checked={formData.offer}
                            />
                            <span>Offer</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                id="bedrooms"
                                min="1"
                                max="10"
                                required
                                className="p-3 border-gray-300 rounded-lg"
                                onChange={handleChange}
                                value={formData.bedrooms}
                            />
                            <p>Beds</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                id="bathrooms"
                                min="1"
                                max="10"
                                required
                                className="p-3 border-gray-300 rounded-lg"
                                onChange={handleChange}
                                value={formData.bathrooms}
                            />
                            <p>Baths</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                id="regularPrice"
                                min="50"
                                max="1000000"
                                required
                                className="p-3 border-gray-300 rounded-lg"
                                onChange={handleChange}
                                value={formData.regularPrice}
                            />
                            <div className="flex flex-col items-center">
                                <p>Regular Price</p>
                                <span className="text-xs">$/month</span>
                            </div>
                        </div>
                        {formData.offer && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    id="discountPrice"
                                    min="0"
                                    max="1000000"
                                    required
                                    className="p-3 border-gray-300 rounded-lg"
                                    onChange={handleChange}
                                    value={formData.discountPrice}
                                />
                                <div className="flex flex-col items-center">
                                    <p>Discounted Price</p>
                                    <span className="text-xs">$/month</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col flex-1">
                    <p className="font-semibold">
                        Images:
                        <span className="font-normal text-gray-600 ml-2">The first image will be the cover (max 6)</span>
                    </p>
                    <div className="flex gap-4">
                        <input
                            onChange={handleFileChange}
                            className="p-3 border border-opacity-gray-300 rounded w-full"
                            type="file"
                            id="images"
                            accept="image/*"
                            multiple
                        />
                        <button
                            type="button"
                            disabled={uploading}
                            onClick={handleImageSubmit}
                            className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                    <p className="text-red-700 text-sm">{imageUploadError && imageUploadError}</p>
                    {formData.imageUrls.length > 0 && formData.imageUrls.map((url, index) => (
                        <div key={url} className="flex justify-between p-3 border items-center">
                            <img src={url} alt="listing image" className="w-20 h-20 object-contain rounded-lg" />
                            <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                    <button
                        type="submit"
                        className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
                        disabled={loading || uploading}
                    >
                        {loading ? 'Updating...' : 'Update listing'}
                    </button>
                    {error && <p className="text-red-700 text-sm">{error}</p>}
                </div>
            </form>
        </main>
    );
}
