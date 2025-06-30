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
import { analyticsAPI } from '@/api/analytics';
import { useAuth } from '@/contexts/AuthContext';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getAll();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  const dashboardStats = [
    { 
      title: 'Total Events', 
      value: analytics?.overview?.totalEvents || 0, 
      icon: Calendar, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      title: 'Active Students', 
      value: analytics?.overview?.activeStudents || 0, 
      icon: Trophy, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      title: 'Total Submissions', 
      value: analytics?.overview?.totalSubmissions || 0, 
      icon: FileText, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      title: 'Completion Rate', 
      value: `${analytics?.overview?.participationRate || 0}%`, 
      icon: Target, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Overview</h1>
          <p className="text-gray-600 mt-2">
            Real-time insights into student performance.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-black">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Weekly Activity</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Submission activity over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.dailyParticipation && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.dailyParticipation}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="submissions" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Brigade Performance */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-black">
              <Award className="h-5 w-5 text-green-600" />
              <span>Brigade Performance</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Top performing brigades
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.brigadePerformance && (
              <div className="space-y-4">
                {analytics.brigadePerformance.slice(0, 5).map((brigade: any, index: number) => (
                  <div key={brigade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-black">{brigade.name}</h3>
                        <p className="text-sm text-gray-600">
                          {brigade.students} students
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-black">{brigade.participationRate}%</div>
                      <div className="text-xs text-gray-600">Participation</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submission Status */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-black">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Submission Status</span>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Current submission breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.statusBreakdown && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.statusBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {analytics.statusBreakdown.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-black">{item.name}</span>
                    </div>
                    <span className="font-medium text-black">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};