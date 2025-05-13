import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBugReports } from '../context/BugReportContext';
import { BugReportProvider } from '../context/BugReportContext';
import BugReportCard from '../components/bug-report/BugReportCard';
import FilterTabs from '../components/FilterTabs';
import { Plus, AlertCircle, Search } from 'lucide-react';

const Dashboard = () => {
  const { 
    bugReports, 
    assignedBugReports, 
    openAssignedReports, 
    closedAssignedReports, 
    getBugReports, 
    loading 
  } = useBugReports();
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReports, setFilteredReports] = useState(bugReports);
  
  useEffect(() => {
    getBugReports();
  }, []);
  
  useEffect(() => {
    let reports;
    
    switch (activeTab) {
      case 'assigned':
        reports = assignedBugReports;
        break;
      case 'open':
        reports = openAssignedReports;
        break;
      case 'closed':
        reports = closedAssignedReports;
        break;
      default:
        reports = bugReports;
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      reports = reports.filter(report => 
        report.title.toLowerCase().includes(term) || 
        report.description?.toLowerCase().includes(term)
      );
    }
    
    setFilteredReports(reports);
  }, [activeTab, bugReports, assignedBugReports, openAssignedReports, closedAssignedReports, searchTerm]);
  
  const tabs = [
    { id: 'all', label: 'All Reports', count: bugReports.length },
    { id: 'assigned', label: 'Assigned to Me', count: assignedBugReports.length },
    { id: 'open', label: 'My Open Reports', count: openAssignedReports.length },
    { id: 'closed', label: 'My Closed Reports', count: closedAssignedReports.length }
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bug Reports</h1>
        <Link to="/create-report" className="btn btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-1" /> New Report
        </Link>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bug reports..."
            className="form-input pl-10"
          />
        </div>
      </div>
      
      <FilterTabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bug reports found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'No results match your search criteria. Try different keywords.'
              : activeTab === 'all' 
                ? 'There are no bug reports yet. Create your first one!'
                : 'You don\'t have any reports in this category.'}
          </p>
          {activeTab === 'all' && !searchTerm && (
            <Link to="/create-report" className="btn btn-primary inline-flex items-center">
              <Plus className="h-4 w-4 mr-1" /> Create Bug Report
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map(report => (
            <BugReportCard key={report._id} bugReport={report} />
          ))}
        </div>
      )}
    </div>
  );
};

const DashboardWithContext = () => (
  <BugReportProvider>
    <Dashboard />
  </BugReportProvider>
);

export default DashboardWithContext;