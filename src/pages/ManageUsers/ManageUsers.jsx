import React, { useState, useEffect } from 'react';
import API_URL from '../../config';
import { useNavigate } from 'react-router-dom';
import MaterialDropdown from '../../components/reusable/TypeAheadDrop';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const USERS_PER_PAGE = 10;
  const navigate = useNavigate()
  const [selectedMaterial, setSelectedMaterial] = useState(null)


  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users?page=${page}&limit=${USERS_PER_PAGE}&search=${searchTerm}`);

      const data = await res.json();
      if (page === 1) {
        setUsers(data.users);
      } else {
        setUsers(prev => [...prev, ...data.users]);
      }
      setHasMore(data.users.length === USERS_PER_PAGE);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleCreate = ()=>{
    navigate('/create-user')
  }

    const handleDeactivate = async (userId) => {
    try {
        const res = await fetch(`${API_URL}/api/users/${userId}/deactivate`, {
        method: 'PATCH',
        });
        const data = await res.json();
        if (res.ok) {
        // Update UI locally by changing user's status to inactive
        setUsers(prevUsers =>
            prevUsers.map(user =>
            user._id === userId ? { ...user, status: 'Inactive' } : user
            )
        );
        } else {
        alert(data.message || 'Failed to deactivate user');
        }
    } catch (err) {
        console.error('Deactivate user error:', err);
    }
    };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Manage Users</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleCreate}>
          Create User
        </button>
      </div>

      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full md:w-1/3 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
        {users.length === 0 ? (
            <tr>
            <td colSpan="3" className="text-center py-4 text-gray-500">No users found</td>
            </tr>
        ) : (
            users.map((user, index) => (
            <tr key={index} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{user.username}</td>
                <td className="px-4 py-2">{user.role}</td>
                <td className="px-4 py-2">
                {user.status === 'Active' ? (
                    <button
                    onClick={() => handleDeactivate(user._id)}
                    className="bg-red-500  text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                    Deactivate ?
                    </button>
                ) : (
                    <span className="text-gray-500 italic">Inactive</span>
                )}
                </td>
            </tr>
            ))
        )}
        </tbody>

        </table>
      </div>

      {hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-700"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
