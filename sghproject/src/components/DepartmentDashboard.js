import React, { useState, useEffect } from 'react';
import supabase from '../services/supabase';
import CCTVViewer from './CCTVViewer';

const DepartmentDashboard = ({ department }) => {
  const [issues, setIssues] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [entries, setEntries] = useState(5);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    const { data: deptData } = await supabase
      .from('departments')
      .select('id, contact')
      .eq('name', department)
      .single();

    const { data, error } = await supabase
      .from('reported_issues')
      .select('*, issues(screenshots(image_url), area))')
      .eq('dept_contact', deptData.contact)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching issues:', error);
      return;
    }
    setIssues(data);
  };

  const handleResolve = async (issueId) => {
    await supabase
      .from('reported_issues')
      .update({ status: 'Resolved' })
      .eq('issue_id', issueId);
    fetchIssues();
  };

  return (
    <div className="department-dashboard">
      <h2>{department} Dashboard</h2>
      <div className="table-section">
        <div className="table-header">
          <p>Last Updated: 2025-03-10 13:00</p>
          <div className="table-controls">
            <label>
              Show{' '}
              <select value={entries} onChange={(e) => setEntries(Number(e.target.value))}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>{' '}
              entries
            </label>
            <label>
              Filter by:{' '}
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="ALL">ALL</option>
                <option value="Resolved">Resolved</option>
                <option value="Re-check">Re-check</option>
              </select>
            </label>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Camera ID</th>
              <th>Timestamp</th>
              <th>Area</th>
              <th>View Details</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {issues.slice(0, entries).map((issue, index) => (
              <tr key={issue.id}>
                <td>{index + 1}</td>
                <td>{issue.camera_id}</td>
                <td>{new Date(issue.timestamp).toLocaleString()}</td>
                <td>{issue.issues.area}</td>
                <td>
                  <button className="view-details" onClick={() => setSelectedCamera(issue.camera_id)}>
                    View Details
                  </button>
                </td>
                <td>
                  <a href={issue.location} target="_blank" rel="noopener noreferrer">
                    View on Map
                  </a>
                </td>
                <td>
                  <span className={`status ${issue.status.toLowerCase()}`}>
                    {issue.status}
                  </span>
                  {issue.status === 'Re-check' && (
                    <button className="resolve" onClick={() => handleResolve(issue.issue_id)}>
                      Mark as Resolved
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCamera && <CCTVViewer cameraId={selectedCamera} />}
    </div>
  );
};

export default DepartmentDashboard;