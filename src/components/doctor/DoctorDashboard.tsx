import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  Users, Key, FileText, Activity, Clock, ShieldCheck, ShieldAlert, Sparkles, UserCheck
} from 'lucide-react';

interface RequestCard {
  id: string;
  name: string;
  age: number;
  reason: string;
  requested: string;
  status: 'pending' | 'approved' | 'declined';
}

export const DoctorDashboard: React.FC = () => {
  // Sample Patients for Access Requests
  const [requests, setRequests] = useState<RequestCard[]>([
    {
      id: 'req-1',
      name: 'Nandeni Tiwari',
      age: 20,
      reason: 'Follow-up Consultation',
      requested: '2 minutes ago',
      status: 'pending'
    },
    {
      id: 'req-2',
      name: 'Aarav Sharma',
      age: 34,
      reason: 'Annual Health Screen',
      requested: '15 minutes ago',
      status: 'pending'
    },
    {
      id: 'req-3',
      name: 'Priya Patel',
      age: 28,
      reason: 'Diagnostic Scan Review',
      requested: '1 hour ago',
      status: 'pending'
    }
  ]);

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'approved' } : req));
  };

  const handleDecline = (id: string) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'declined' } : req));
  };

  const stats = [
    { title: 'Patients Today', value: '12', icon: <Users size={20} className="text-violet" /> },
    { title: 'Pending Requests', value: '5', icon: <Key size={20} className="text-mint" /> },
    { title: 'Reports Reviewed', value: '31', icon: <FileText size={20} className="text-lavender" /> },
    { title: 'Active Patients', value: '84', icon: <Activity size={20} className="text-violet" /> }
  ];

  const activities = [
    { text: '7 Reports Reviewed', time: '10 mins ago', type: 'report' },
    { text: '3 Access Requests Approved', time: '1 hour ago', type: 'access' },
    { text: '2 New Patients', time: '3 hours ago', type: 'patient' },
    { text: 'AI generated 5 summaries today', time: '4 hours ago', type: 'ai' }
  ];

  return (
    <div className="doctor-dashboard-container">
      
      {/* Overview Cards Row */}
      <div className="doctor-stats-row">
        {stats.map((stat, index) => (
          <Card key={index} className="doctor-stat-card" padding="md" hoverable>
            <div className="stat-card-glow"></div>
            <div className="stat-card-header">
              <span className="stat-label">{stat.title}</span>
              <div className="stat-icon-wrapper">{stat.icon}</div>
            </div>
            <h2 className="stat-value">{stat.value}</h2>
          </Card>
        ))}
      </div>

      {/* Main Split Grid (Recent Access Requests + Today's Activity) */}
      <div className="doctor-dashboard-grid">
        
        {/* Left Column: Recent Access Requests */}
        <div className="doctor-main-column">
          <div className="section-title-row">
            <h3 className="section-title">Recent Access Requests</h3>
            <Badge variant="warning">{requests.filter(r => r.status === 'pending').length} Pending</Badge>
          </div>

          <div className="requests-grid">
            {requests.map((req) => (
              <Card key={req.id} className={`request-notion-card ${req.status}`} padding="md">
                <div className="request-card-glow"></div>
                <div className="request-card-header">
                  <div>
                    <h4 className="patient-name">{req.name}</h4>
                    <span className="patient-age">Age: {req.age}</span>
                  </div>
                  {req.status === 'pending' ? (
                    <span className="time-badge">
                      <Clock size={12} />
                      {req.requested}
                    </span>
                  ) : req.status === 'approved' ? (
                    <Badge variant="success">Approved</Badge>
                  ) : (
                    <Badge variant="danger">Declined</Badge>
                  )}
                </div>

                <div className="request-card-reason">
                  <span className="label">Reason</span>
                  <p className="value">{req.reason}</p>
                </div>

                {req.status === 'pending' && (
                  <div className="request-card-actions">
                    <Button 
                      variant="mint" 
                      size="sm"
                      onClick={() => handleApprove(req.id)}
                      icon={<ShieldCheck size={14} />}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDecline(req.id)}
                      icon={<ShieldAlert size={14} className="text-danger" />}
                      className="decline-btn"
                    >
                      Decline
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => alert(`Redirecting to profile of ${req.name}...`)}
                    >
                      View Profile
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Today's Activity */}
        <div className="doctor-right-panel">
          <h3 className="section-title">Today's Activity</h3>
          
          <Card className="activity-timeline-card" padding="md">
            <div className="activity-spine"></div>
            <div className="activity-list">
              {activities.map((act, index) => (
                <div key={index} className="activity-item">
                  <div className={`activity-dot ${act.type}`}>
                    {act.type === 'ai' ? <Sparkles size={12} /> : 
                     act.type === 'access' ? <UserCheck size={12} /> : <FileText size={12} />}
                  </div>
                  <div className="activity-details">
                    <p className="activity-text">{act.text}</p>
                    <span className="activity-time">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};
