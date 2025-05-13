import { useState, useEffect } from 'react';
import axios from 'axios';
import { useBugReports } from '../../context/BugReportContext';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AssignUserFormProps {
  bugReportId: string;
  currentAssignedUser: string | null;
  onUpdate: () => void;
}

const AssignUserForm = ({
  bugReportId,
  currentAssignedUser,
  onUpdate
}: AssignUserFormProps) => {
  const { updateBugReport } = useBugReports();
  
  const [users, setUsers] = useState<User[]>([]);
  const [assignedUser, setAssignedUser] = useState(currentAssignedUser || '');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    setAssignedUser(currentAssignedUser || '');
  }, [currentAssignedUser]);
  
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get('http://localhost:5000/api/auth/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
    setLoadingUsers(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    await updateBugReport(bugReportId, { 
      assignedUser: assignedUser || null 
    });
    setLoading(false);
    onUpdate();
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Assign User</h3>
      
      {loadingUsers ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="assignedUser" className="block text-sm font-medium text-gray-700 mb-1">
              Assign to
            </label>
            <select
              id="assignedUser"
              value={assignedUser}
              onChange={(e) => setAssignedUser(e.target.value)}
              className="form-input"
            >
              <option value="">-- Unassigned --</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || assignedUser === currentAssignedUser}
              className="btn btn-primary"
            >
              {loading ? 'Updating...' : 'Assign User'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AssignUserForm;