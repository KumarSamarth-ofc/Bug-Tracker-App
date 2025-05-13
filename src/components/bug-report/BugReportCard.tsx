import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Clock, User, DollarSign } from 'lucide-react';

interface BugReportCardProps {
  bugReport: {
    _id: string;
    title: string;
    status: string;
    severity: string;
    bountyAmount: number;
    createdTimeStamp: string;
    assignedUser: {
      _id: string;
      name: string;
    } | null;
  };
}

const BugReportCard = ({ bugReport }: BugReportCardProps) => {
  const {
    _id,
    title,
    status,
    severity,
    bountyAmount,
    createdTimeStamp,
    assignedUser
  } = bugReport;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="badge badge-danger">Open</span>;
      case 'in-progress':
        return <span className="badge badge-warning">In Progress</span>;
      case 'resolved':
        return <span className="badge badge-success">Resolved</span>;
      case 'closed':
        return <span className="badge badge-primary">Closed</span>;
      default:
        return <span className="badge badge-primary">{status}</span>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <span className="badge bg-blue-100 text-blue-800">Low</span>;
      case 'medium':
        return <span className="badge bg-yellow-100 text-yellow-800">Medium</span>;
      case 'high':
        return <span className="badge bg-orange-100 text-orange-800">High</span>;
      case 'critical':
        return <span className="badge bg-red-100 text-red-800">Critical</span>;
      default:
        return <span className="badge badge-primary">{severity}</span>;
    }
  };

  return (
    <Link
      to={`/bug-report/${_id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-4 card-hover"
    >
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-1">{title}</h3>
          {getStatusBadge(status)}
        </div>
        
        <div className="flex items-center text-gray-500 text-sm">
          <Clock className="h-4 w-4 mr-1" />
          <span>{formatDistanceToNow(new Date(createdTimeStamp), { addSuffix: true })}</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center text-gray-500 text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {getSeverityBadge(severity)}
          </div>
          
          {bountyAmount > 0 && (
            <div className="flex items-center text-gray-500 text-sm">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>${bountyAmount}</span>
            </div>
          )}
          
          <div className="flex items-center text-gray-500 text-sm">
            <User className="h-4 w-4 mr-1" />
            <span>{assignedUser ? assignedUser.name : 'Unassigned'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BugReportCard;