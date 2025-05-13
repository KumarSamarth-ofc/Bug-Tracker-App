import { useState } from 'react';
import { useBugReports } from '../../context/BugReportContext';
import { useAuth } from '../../context/AuthContext';

interface StatusUpdateFormProps {
  bugReportId: string;
  currentStatus: string;
  currentAssignedUser: string | null;
  onUpdate: () => void;
}

const StatusUpdateForm = ({
  bugReportId,
  currentStatus,
  currentAssignedUser,
  onUpdate
}: StatusUpdateFormProps) => {
  const { updateBugReport } = useBugReports();
  const { user } = useAuth();
  
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  
  // Check if the current user is assigned to the bug report
  const isAssigned = user?.id === currentAssignedUser;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAssigned) return;
    
    setLoading(true);
    await updateBugReport(bugReportId, { status });
    setLoading(false);
    onUpdate();
  };
  
  if (!isAssigned) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Update Status</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="form-input"
            required
          >
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || status === currentStatus}
            className="btn btn-primary"
          >
            {loading ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StatusUpdateForm;