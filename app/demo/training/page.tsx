'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, GraduationCap, Users, Award, BookOpen, CheckCircle2, 
  Clock, Play, Pause, RotateCcw, ChevronRight, Star, Trophy,
  Target, TrendingUp, Calendar, FileText, Video, Headphones,
  AlertCircle, XCircle, Lock, Unlock, Download, Upload, Search,
  Filter, MoreHorizontal, Plus, Edit, Trash2, Eye, BarChart3,
  MessageSquare, ThumbsUp, Share2, Bookmark, Settings, Bell,
  Loader2, CheckCircle, Circle, PlayCircle, PauseCircle, Shield
} from 'lucide-react'

const coursesData = [
  { 
    id: 1, 
    title: 'Warehouse Safety Fundamentals', 
    category: 'Safety',
    duration: '2h 30m',
    modules: 8,
    enrolled: 47,
    completed: 42,
    required: true,
    dueDate: '2026-03-01',
    thumbnail: '🛡️',
  },
  { 
    id: 2, 
    title: 'Forklift Certification Course', 
    category: 'Equipment',
    duration: '4h 00m',
    modules: 12,
    enrolled: 15,
    completed: 12,
    required: true,
    dueDate: '2026-02-28',
    thumbnail: '🚜',
  },
  { 
    id: 3, 
    title: 'WMS System Training', 
    category: 'Technology',
    duration: '3h 15m',
    modules: 10,
    enrolled: 32,
    completed: 28,
    required: true,
    dueDate: '2026-03-15',
    thumbnail: '💻',
  },
  { 
    id: 4, 
    title: 'Customer Service Excellence', 
    category: 'Soft Skills',
    duration: '1h 45m',
    modules: 6,
    enrolled: 24,
    completed: 20,
    required: false,
    thumbnail: '🤝',
  },
  { 
    id: 5, 
    title: 'Hazmat Handling Procedures', 
    category: 'Safety',
    duration: '3h 00m',
    modules: 9,
    enrolled: 8,
    completed: 5,
    required: true,
    dueDate: '2026-02-20',
    thumbnail: '⚠️',
  },
  { 
    id: 6, 
    title: 'Leadership Fundamentals', 
    category: 'Management',
    duration: '2h 00m',
    modules: 7,
    enrolled: 6,
    completed: 3,
    required: false,
    thumbnail: '👔',
  },
]

const employeesData = [
  { id: 1, name: 'Marcus Johnson', role: 'Warehouse Associate', department: 'Operations', coursesCompleted: 8, coursesInProgress: 2, certifications: 3, lastActive: '2 hours ago', avatar: 'MJ' },
  { id: 2, name: 'Sarah Williams', role: 'Forklift Operator', department: 'Operations', coursesCompleted: 12, coursesInProgress: 1, certifications: 5, lastActive: '1 day ago', avatar: 'SW' },
  { id: 3, name: 'David Chen', role: 'Team Lead', department: 'Operations', coursesCompleted: 15, coursesInProgress: 0, certifications: 7, lastActive: '3 hours ago', avatar: 'DC' },
  { id: 4, name: 'Emily Rodriguez', role: 'Shipping Clerk', department: 'Logistics', coursesCompleted: 6, coursesInProgress: 3, certifications: 2, lastActive: '5 hours ago', avatar: 'ER' },
  { id: 5, name: 'James Thompson', role: 'Receiving Specialist', department: 'Operations', coursesCompleted: 9, coursesInProgress: 1, certifications: 4, lastActive: '1 hour ago', avatar: 'JT' },
]

const certificationsData = [
  { id: 1, name: 'OSHA Safety Certified', holders: 42, expires: '2027-01-15', status: 'active', icon: '🛡️' },
  { id: 2, name: 'Forklift Operator License', holders: 15, expires: '2026-12-31', status: 'active', icon: '🚜' },
  { id: 3, name: 'Hazmat Handler', holders: 8, expires: '2026-06-30', status: 'expiring', icon: '⚠️' },
  { id: 4, name: 'WMS Power User', holders: 28, expires: null, status: 'active', icon: '💻' },
  { id: 5, name: 'First Aid/CPR', holders: 12, expires: '2026-08-15', status: 'active', icon: '🏥' },
]

const recentActivity = [
  { user: 'Marcus Johnson', action: 'completed', item: 'Warehouse Safety Fundamentals', time: '2 hours ago' },
  { user: 'Emily Rodriguez', action: 'started', item: 'WMS System Training', time: '3 hours ago' },
  { user: 'Sarah Williams', action: 'earned', item: 'Forklift Operator License', time: '1 day ago' },
  { user: 'James Thompson', action: 'completed', item: 'Customer Service Excellence', time: '1 day ago' },
  { user: 'David Chen', action: 'assigned', item: 'Leadership Fundamentals to team', time: '2 days ago' },
]

const moduleContent = [
  { id: 1, title: 'Introduction to Warehouse Safety', type: 'video', duration: '15:00', completed: true },
  { id: 2, title: 'Personal Protective Equipment (PPE)', type: 'video', duration: '20:00', completed: true },
  { id: 3, title: 'Hazard Identification', type: 'video', duration: '25:00', completed: true },
  { id: 4, title: 'Emergency Procedures', type: 'video', duration: '18:00', completed: false, current: true },
  { id: 5, title: 'Ergonomics & Lifting Techniques', type: 'video', duration: '22:00', completed: false },
  { id: 6, title: 'Fire Safety', type: 'video', duration: '15:00', completed: false },
  { id: 7, title: 'Chemical Safety', type: 'video', duration: '20:00', completed: false },
  { id: 8, title: 'Final Assessment', type: 'quiz', duration: '30:00', completed: false, locked: true },
]

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedCourse, setSelectedCourse] = useState<typeof coursesData[0] | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewCourseModal, setShowNewCourseModal] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const stats = [
    { label: 'Active Learners', value: '47', change: '+5 this week', icon: Users, color: 'blue' },
    { label: 'Courses Available', value: '12', change: '2 new', icon: BookOpen, color: 'purple' },
    { label: 'Certifications Issued', value: '156', change: '+12 this month', icon: Award, color: 'amber' },
    { label: 'Completion Rate', value: '94%', change: '+3%', icon: Target, color: 'emerald' },
  ]

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-5 h-5" />
          {notification}
        </div>
      )}
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/demo" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-lg">Training Agent</h1>
                    <img src="/images/woulf-logo.png" alt="Woulf" className="w-5 h-5 rounded" title="Powered by Woulf" />
                  </div>
                  <p className="text-xs text-gray-400">Staff Certification & Onboarding</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => showNotification('3 new training updates')} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">3</span>
              </button>
              <button 
                onClick={() => setShowNewCourseModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Course
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'bg-orange-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      stat.color === 'blue' ? 'bg-blue-500/20' :
                      stat.color === 'purple' ? 'bg-purple-500/20' :
                      stat.color === 'amber' ? 'bg-amber-500/20' : 'bg-emerald-500/20'
                    }`}>
                      <stat.icon className={`w-6 h-6 ${
                        stat.color === 'blue' ? 'text-blue-400' :
                        stat.color === 'purple' ? 'text-purple-400' :
                        stat.color === 'amber' ? 'text-amber-400' : 'text-emerald-400'
                      }`} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                  <div className="text-xs text-emerald-400 mt-2">{stat.change}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2 p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-white/[0.02] rounded-lg">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-sm font-medium">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div>
                          <span className="font-medium">{activity.user}</span>
                          <span className="text-gray-400"> {activity.action} </span>
                          <span className="text-orange-400">{activity.item}</span>
                        </div>
                        <div className="text-sm text-gray-500">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expiring Certifications */}
              <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  Expiring Soon
                </h3>
                <div className="space-y-3">
                  {certificationsData.filter(c => c.status === 'expiring').map((cert, i) => (
                    <div key={i} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{cert.icon}</span>
                        <span className="font-medium">{cert.name}</span>
                      </div>
                      <div className="text-sm text-amber-400">Expires: {cert.expires}</div>
                      <div className="text-sm text-gray-400">{cert.holders} employees affected</div>
                    </div>
                  ))}
                  <button onClick={() => setActiveTab('certifications')} className="w-full py-2 text-sm text-orange-400 hover:text-orange-300 transition-colors">
                    View All Certifications →
                  </button>
                </div>
              </div>
            </div>

            {/* Popular Courses */}
            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Popular Courses</h3>
                <button onClick={() => setActiveTab('courses')} className="text-sm text-orange-400 hover:text-orange-300">View All</button>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {coursesData.slice(0, 3).map((course) => (
                  <div 
                    key={course.id} 
                    onClick={() => setSelectedCourse(course)}
                    className="p-4 bg-white/[0.02] border border-white/10 rounded-lg hover:border-orange-500/50 transition-all cursor-pointer"
                  >
                    <div className="text-3xl mb-3">{course.thumbnail}</div>
                    <h4 className="font-medium mb-1">{course.title}</h4>
                    <div className="text-sm text-gray-400 mb-3">{course.duration} • {course.modules} modules</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">{course.enrolled} enrolled</div>
                      <div className="text-sm text-emerald-400">{Math.round(course.completed / course.enrolled * 100)}% complete</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && !selectedCourse && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses..."
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>
              <button onClick={() => showNotification('Course filters opened')} className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10">
                <Filter className="w-5 h-5" />
                Filter
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursesData.map((course) => (
                <div 
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className="p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:border-orange-500/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{course.thumbnail}</div>
                    {course.required && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Required</span>
                    )}
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-orange-400 transition-colors">{course.title}</h3>
                  <div className="text-sm text-gray-400 mb-4">{course.category} • {course.duration}</div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-400">Completion</span>
                      <span className="text-emerald-400">{Math.round(course.completed / course.enrolled * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(course.completed / course.enrolled) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{course.enrolled} enrolled</span>
                    <span>{course.modules} modules</span>
                  </div>
                  
                  {course.dueDate && (
                    <div className="mt-3 pt-3 border-t border-white/10 text-sm text-amber-400">
                      Due: {course.dueDate}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course Detail View */}
        {selectedCourse && (
          <div className="space-y-6">
            <button 
              onClick={() => setSelectedCourse(null)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Courses
            </button>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Video Player / Content */}
              <div className="lg:col-span-2 space-y-6">
                <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl">{selectedCourse.thumbnail}</div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-20 h-20 bg-orange-600 hover:bg-orange-700 rounded-full flex items-center justify-center transition-colors"
                    >
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </button>
                  </div>
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black">
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-orange-500 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span>5:23 / 15:00</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => showNotification('Restarting from beginning')} className="p-1 hover:bg-white/10 rounded">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button onClick={() => showNotification('Video settings opened')} className="p-1 hover:bg-white/10 rounded">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                  <h2 className="text-2xl font-bold mb-2">{selectedCourse.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span>{selectedCourse.category}</span>
                    <span>•</span>
                    <span>{selectedCourse.duration}</span>
                    <span>•</span>
                    <span>{selectedCourse.modules} modules</span>
                  </div>
                  <p className="text-gray-300 mb-6">
                    This comprehensive course covers all essential aspects of {selectedCourse.title.toLowerCase()}. 
                    Learn from industry experts and gain practical skills you can apply immediately.
                  </p>
                  <div className="flex items-center gap-4">
                    <button onClick={() => showNotification('Resuming course...')} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-colors">
                      <Play className="w-4 h-4" />
                      Continue Learning
                    </button>
                    <button onClick={() => showNotification('Downloading course materials...')} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                      <Download className="w-4 h-4" />
                      Download Materials
                    </button>
                    <button onClick={() => showNotification('Share link copied to clipboard')} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
              </div>

              {/* Module List */}
              <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                <h3 className="font-semibold mb-4">Course Modules</h3>
                <div className="space-y-2">
                  {moduleContent.map((module, i) => (
                    <div 
                      key={module.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        module.current ? 'bg-orange-500/20 border border-orange-500/30' :
                        module.completed ? 'bg-white/[0.02]' : 
                        module.locked ? 'opacity-50' : 'bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {module.completed ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : module.current ? (
                          <PlayCircle className="w-5 h-5 text-orange-400" />
                        ) : module.locked ? (
                          <Lock className="w-5 h-5 text-gray-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${module.locked ? 'text-gray-500' : ''}`}>
                          {module.title}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          {module.type === 'video' ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                          {module.duration}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>
              <button onClick={() => showNotification('Employee filters opened')} className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10">
                <Filter className="w-5 h-5" />
                Filter
              </button>
              <button onClick={() => showNotification('Add employee form opened')} className="flex items-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-xl font-medium transition-colors">
                <Plus className="w-5 h-5" />
                Add Employee
              </button>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 font-medium text-gray-400">Employee</th>
                    <th className="text-left p-4 font-medium text-gray-400">Role</th>
                    <th className="text-left p-4 font-medium text-gray-400">Progress</th>
                    <th className="text-left p-4 font-medium text-gray-400">Certifications</th>
                    <th className="text-left p-4 font-medium text-gray-400">Last Active</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {employeesData.map((employee) => (
                    <tr key={employee.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center font-medium">
                            {employee.avatar}
                          </div>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-gray-400">{employee.department}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-300">{employee.role}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400">{employee.coursesCompleted}</span>
                          <span className="text-gray-500">/</span>
                          <span className="text-gray-400">{employee.coursesCompleted + employee.coursesInProgress}</span>
                          <span className="text-sm text-gray-500">courses</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span>{employee.certifications}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-400">{employee.lastActive}</td>
                      <td className="p-4">
                        <button onClick={() => showNotification(`Employee options for ${employee.name}`)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Certifications Tab */}
        {activeTab === 'certifications' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificationsData.map((cert) => (
                <div key={cert.id} className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{cert.icon}</div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      cert.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {cert.status}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2">{cert.name}</h3>
                  <div className="text-sm text-gray-400 mb-4">{cert.holders} employees certified</div>
                  {cert.expires && (
                    <div className="text-sm text-gray-500">
                      Expires: {cert.expires}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-4">
                    <button onClick={() => showNotification(`Viewing ${cert.holders} certified employees`)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors">
                      View Holders
                    </button>
                    <button onClick={() => showNotification('Certification form opened')} className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm transition-colors">
                      Issue New
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Training Completion Report', desc: 'Overview of all course completions', icon: CheckCircle2 },
                { title: 'Certification Status', desc: 'Active and expiring certifications', icon: Award },
                { title: 'Employee Progress', desc: 'Individual learning progress', icon: TrendingUp },
                { title: 'Compliance Report', desc: 'Required training status', icon: Shield },
                { title: 'Time Spent Learning', desc: 'Hours by department/employee', icon: Clock },
                { title: 'Assessment Results', desc: 'Quiz and test scores', icon: Target },
              ].map((report, i) => (
                <div key={i} className="p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:border-orange-500/50 transition-all cursor-pointer group">
                  <report.icon className="w-10 h-10 text-orange-400 mb-4" />
                  <h3 className="font-semibold mb-2 group-hover:text-orange-400 transition-colors">{report.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{report.desc}</p>
                  <button onClick={() => showNotification(`Generating ${report.title}...`)} className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors">
                    Generate Report <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Training Agent Settings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                <h3 className="font-bold mb-4">LMS Integrations</h3>
                <div className="space-y-3">
                  {[
                    { name: 'SCORM Cloud', connected: true },
                    { name: 'Cornerstone', connected: false },
                    { name: 'Workday Learning', connected: false },
                    { name: 'Google Classroom', connected: true },
                  ].map((integration, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span>{integration.name}</span>
                      <button onClick={() => showNotification(integration.connected ? `Disconnected ${integration.name}` : `Connected ${integration.name}`)} className={`px-3 py-1 rounded-lg text-sm font-medium ${integration.connected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
                        {integration.connected ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                <h3 className="font-bold mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Certification Reminder</label>
                    <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                      <option>30 days before expiry</option>
                      <option>60 days before expiry</option>
                      <option>90 days before expiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Course Deadline Reminder</label>
                    <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                      <option>1 week before</option>
                      <option>3 days before</option>
                      <option>1 day before</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Email managers on completion</span>
                    </label>
                  </div>
                  <button onClick={() => showNotification('Settings saved')} className="w-full py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">Save Settings</button>
                </div>
              </div>
            </div>
            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
              <h3 className="font-bold mb-4">AI Course Generation</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Default Course Length</label>
                  <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Content Style</label>
                  <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                    <option>Interactive</option>
                    <option>Video-based</option>
                    <option>Reading-based</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Quiz Difficulty</label>
                  <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Course Modal */}
      {showNewCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 bg-[#1a1a24] border border-white/10 rounded-xl">
            <h2 className="text-xl font-bold mb-6">Create New Course</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Course Title</label>
                <input type="text" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-orange-500 focus:outline-none" placeholder="Enter course title" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-orange-500 focus:outline-none">
                  <option>Safety</option>
                  <option>Equipment</option>
                  <option>Technology</option>
                  <option>Soft Skills</option>
                  <option>Management</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-orange-500 focus:outline-none h-24" placeholder="Course description..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="required" className="rounded" />
                <label htmlFor="required" className="text-sm">Required for all employees</label>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setShowNewCourseModal(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={() => { showNotification('Course created successfully'); setShowNewCourseModal(false); }} className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-colors">
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
