import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { 
  Trophy, 
  Target, 
  Calendar, 
  FileText,
  TrendingUp,
  Award,
  Clock,
  CheckCircle
} from 'lucide-react';
import { submissionsAPI, eventPlansAPI } from '@/api';
import { useAuth } from '@/contexts/AuthContext';

export const StudentDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [eventPlans, setEventPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    if (userProfile?.id) {
      fetchData();
    }
  }, [userProfile]);

  const fetchData = async () => {
    try {
      const [submissionsResponse, eventPlansResponse] = await Promise.all([
        submissionsAPI.getAll({ studentId: userProfile?.id }),
        eventPlansAPI.getAll()
      ]);

      setSubmissions(submissionsResponse.data);
      setEventPlans(eventPlansResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalSubmissions = submissions.length;
  const submittedCount = submissions.filter(s => s.status === 'submitted').length;
  const submissionRequiredPlans = eventPlans.filter(plan => plan.planType === 'withSubmission').length;
  const completionRate = submissionRequiredPlans > 0 ? (submittedCount / submissionRequiredPlans) * 100 : 0;

  // Generate weekly chart data
  const getWeeklyData = () => {
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySubmissions = submissions.filter(s => 
        new Date(s.submittedAt).toISOString().split('T')[0] === dateStr
      );
      
      weekData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        submissions: daySubmissions.length
      });
    }
    return weekData;
  };

  // Submission status data for pie chart
  const statusData = [
    { name: 'Completed', value: submittedCount, color: '#10B981' },
    { name: 'Pending', value: submissions.filter(s => s.status === 'pending').length, color: '#F59E0B' },
  ].filter(item => item.value > 0);

  const weeklyData = getWeeklyData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">My Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userProfile?.name}!</p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1 bg-blue-100 text-blue-800">
          {userProfile?.brigadeName}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{Math.round(completionRate)}%</div>
            <Progress value={completionRate} className="mt-2" />
            <p className="text-xs text-gray-600 mt-1">
              {submittedCount} of {submissionRequiredPlans} completed
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{totalSubmissions}</div>
            <p className="text-xs text-green-600 font-medium">
              {submittedCount} successful
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Brigade Rank</CardTitle>
            <Trophy className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">#1</div>
            <p className="text-xs text-gray-600">
              in your brigade
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {weeklyData.reduce((sum, day) => sum + day.submissions, 0)}
            </div>
            <p className="text-xs text-gray-600">submissions made</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-black">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Weekly Activity</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your submission activity over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="submissions" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Submission Status */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-black">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Submission Status</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Breakdown of your submission statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {statusData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }} />
                        <span className="text-black">{item.name}</span>
                      </div>
                      <span className="font-medium text-black">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No submissions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-black">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Your latest submissions and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length > 0 ? (
            <div className="space-y-3">
              {submissions.slice(0, 5).map((submission, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className={`p-2 rounded-full ${
                    submission.status === 'submitted' ? 'bg-green-100 text-green-600' :
                    submission.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black">{submission.eventPlan?.title}</p>
                    <p className="text-xs text-gray-600">
                      {submission.eventPlan?.associatedEvent?.name} • {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant={submission.status === 'submitted' ? 'default' : 'secondary'}
                    className={`text-xs ${submission.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                  >
                    {submission.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};