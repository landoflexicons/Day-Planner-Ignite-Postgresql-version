import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Calendar,
  Award,
  Target,
  Activity,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { analyticsAPI } from '@/api/analytics';

export const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<string>('ALL');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('7');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [selectedEvent, selectedTimeRange]);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = {
        ...(selectedEvent !== 'ALL' && { eventId: selectedEvent }),
        timeRange: selectedTimeRange as '7' | '14' | '30'
      };
      
      const response = await analyticsAPI.getAll(params);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-black mb-2">Error Loading Analytics</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Analytics Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-48 border-gray-300">
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="ALL" className="text-black">All Events</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32 border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="7" className="text-black">7 Days</SelectItem>
              <SelectItem value="14" className="text-black">14 Days</SelectItem>
              <SelectItem value="30" className="text-black">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{analytics?.overview?.totalStudents || 0}</div>
            <p className="text-xs text-green-600 font-medium">
              {analytics?.overview?.activeStudents || 0} active
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{analytics?.overview?.totalSubmissions || 0}</div>
            <p className="text-xs text-green-600 font-medium">
              {analytics?.overview?.submittedCount || 0} completed
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Participation Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{analytics?.overview?.participationRate || 0}%</div>
            <p className="text-xs text-gray-600">
              Overall engagement
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{analytics?.overview?.totalEvents || 0}</div>
            <p className="text-xs text-gray-600">
              events running
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Participation Trend */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-black">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Daily Participation Trend</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Submission activity over the past {selectedTimeRange} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.dailyParticipation?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.dailyParticipation}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 'auto']} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="submissions" 
                    stackId="1"
                    stroke="#3B82F6" 
                    fill="#3B82F6"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No data available for the selected period
              </div>
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
              Participation rates by brigade
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.brigadePerformance?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.brigadePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="participationRate" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No brigade data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Status */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-black">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Submission Status</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Current submission breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.statusBreakdown?.length > 0 ? (
              <>
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
                <div className="mt-4 space-y-2">
                  {analytics.statusBreakdown.map((item: any, index: number) => (
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
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                No submission data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Completion */}
        <Card className="lg:col-span-2 bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-black">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <span>Activity Completion Rates</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Completion percentage for recent activities requiring submission
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.activityCompletion?.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.activityCompletion} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="completion" fill="#F97316" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>No activities with submission requirements found</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Brigade Stats */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-black">Detailed Brigade Statistics</CardTitle>
          <CardDescription className="text-gray-600">
            Comprehensive performance metrics by brigade
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.brigadePerformance?.length > 0 ? (
            <div className="grid gap-4">
              {analytics.brigadePerformance.map((brigade: any, index: number) => (
                <div key={brigade.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-black">{brigade.name}</h3>
                      <p className="text-sm text-gray-600">
                        {brigade.students} students • {brigade.submissions} submissions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-black">{brigade.participationRate}%</div>
                      <div className="text-xs text-gray-600">Participation</div>
                    </div>
                    <Badge 
                      variant={brigade.participationRate >= 80 ? 'default' : 
                              brigade.participationRate >= 60 ? 'secondary' : 'destructive'}
                      className={
                        brigade.participationRate >= 80 ? 'bg-green-100 text-green-800' :
                        brigade.participationRate >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }
                    >
                      {brigade.participationRate >= 80 ? 'Excellent' : 
                       brigade.participationRate >= 60 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No brigade data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};