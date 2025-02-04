import React, { useEffect, useState } from 'react';
import { getAllGroups } from '../../service/groupService'; 

const ViewClubs = ({ token }) => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchGroups = async () => {
            setLoading(true);
            setError('');

            try {
                const data = await getAllGroups(token);
                if (data.success) {
                    setGroups(data.groups || []);
                } else {
                    setError(data.message || 'Failed to fetch clubs.');
                }
            } catch (error) {
                console.error('Error fetching clubs:', error);
                setError('Something went wrong while fetching clubs.');
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, [token]);

    return (
        <div>
            <h1>View Clubs</h1>
            {loading && <p>Loading clubs...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && groups.length === 0 && <p>No clubs available.</p>}
            <ul>
                {groups.map((group) => (
                    <li key={group.ID}>
                        <strong>{group.Name}</strong> - Admin ID: {group.AdminID}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ViewClubs;