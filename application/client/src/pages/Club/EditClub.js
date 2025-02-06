import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getClubById } from '../../service/clubService';

const Club = ({ token }) => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    // Get the current user ID from the location state
    const userId = location.state?.userId;

    const [club, setClub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMember, setIsMember] = useState(false);

    useEffect(() => {
        if (!userId) {
            console.warn('No userId provided in location state');
            return;
        }

        const fetchClub = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getClubById(id, token);
                if (data) {
                    setClub(data);
                    console.log('Club Admin ID:', data.AdminID);
                    console.log('Current User ID:', userId);

                    if (data.AdminID === userId) {
                        setIsAdmin(true);
                        setIsMember(true);
                    } else if (data.members && data.members.includes(userId)) {
                        setIsMember(true);
                    }
                } else {
                    setError('Failed to fetch club.');
                }
            } catch (err) {
                console.error('Error fetching club:', err);
                setError('Something went wrong while fetching the club.');
            } finally {
                setLoading(false);
            }
        };

        fetchClub();
    }, [id, token, userId]);

    const handleEdit = () => {
        console.log('Editing club...');
        // Redirect to the edit club page, passing club data and userId via state
        navigate(`/editClub/${id}`, { state: { club, userId } });
    };

    const handleLike = () => {
        console.log('Liked!');
    };

    const handleComment = () => {
        console.log('Commenting...');
    };

    if (loading) return <p>Loading club...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!club) return <p>No club found.</p>;

    return (
        <div>
            <h1>{club.Name}</h1>
            {/* For non-admins, show the club description here */}
            {!isAdmin && <p>{club.Description}</p>}
            <p>Admin ID: {club.AdminID}</p>
            <p>Current User ID: {userId}</p>

            {isAdmin && (
                <div>
                    <h3>Club Description:</h3>
                    <p>{club.Description}</p>
                    <button onClick={handleEdit}>Edit Club Details</button>
                </div>
            )}

            {isMember && !isAdmin && (
                <div>
                    <h3>Member Actions:</h3>
                    <button onClick={handleLike}>Like</button>
                    <button onClick={handleComment}>Comment</button>
                </div>
            )}

            {!isMember && (
                <p>You are not a member of this club. You can only view the club details.</p>
            )}
        </div>
    );
};

export default Club;