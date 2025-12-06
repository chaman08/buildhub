
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  FolderOpen,
  Globe2,
  MessageSquare,
  RefreshCcw,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users
} from 'lucide-react';
import AdminUserManagement from './AdminUserManagement';
import AdminProjectManagement from './AdminProjectManagement';
import AdminContractorManagement from './AdminContractorManagement';
import AdminAnalytics from './AdminAnalytics';
import AdminContentModeration from './AdminContentModeration';
import AdminSystemSettings from './AdminSystemSettings';
import AdminContactMessages from './AdminContactMessages';
import AdminKycCenter from './AdminKycCenter';

type AdminMetrics = {
  totalUsers: number;
  contractors: number;
  verifiedContractors: number;
  openProjects: number;
  draftProjects: number;
  pendingKyc: number;
  unreadMessages: number;
  totalMessages: number;
  contractorServices: number;
};

const formatNumber = (value: number) => new Intl.NumberFormat('en-IN').format(value);

const shortcuts = [
  {
    label: 'Manage users',
    description: 'Segment by type and activity',
    icon: Users,
    tab: 'users'
  },
  {
    label: 'Approve contractors',
    description: 'Verify docs and references',
    icon: UserCheck,
    tab: 'contractors'
  },
  {
    label: 'Content moderation',
    description: 'Review flags and reports',
    icon: Shield,
    tab: 'moderation'
  },
  {
    label: 'System settings',
    description: 'Update policies and limits',
    icon: Settings,
    tab: 'settings'
  }
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalUsers: 0,
    contractors: 0,
    verifiedContractors: 0,
    openProjects: 0,
    draftProjects: 0,
    pendingKyc: 0,
    unreadMessages: 0,
    totalMessages: 0,
    contractorServices: 0
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const loadMetrics = useCallback(async () => {
    setMetricsLoading(true);
    try {
      const [
        usersSnap,
        contractorsSnap,
        verifiedContractorsSnap,
        openProjectsSnap,
        draftProjectsSnap,
        pendingKycSnap,
        unreadMessagesSnap,
        totalMessagesSnap,
        contractorServicesSnap
      ] = await Promise.all([
        getCountFromServer(collection(db, 'users')),
        getCountFromServer(query(collection(db, 'users'), where('userType', '==', 'contractor'))),
        getCountFromServer(
          query(collection(db, 'users'), where('userType', '==', 'contractor'), where('verified', '==', true))
        ),
        getCountFromServer(query(collection(db, 'projects'), where('status', '==', 'open'))),
        getCountFromServer(query(collection(db, 'projects'), where('status', '==', 'draft'))),
        getCountFromServer(query(collection(db, 'kycRequests'), where('status', 'in', ['pending', 'under_review']))),
        getCountFromServer(query(collection(db, 'contactMessages'), where('status', '==', 'unread'))),
        getCountFromServer(collection(db, 'contactMessages')),
        getCountFromServer(query(collection(db, 'contractor_projects'), where('status', '==', 'active')))
      ]);

      setMetrics({
        totalUsers: usersSnap.data().count,
        contractors: contractorsSnap.data().count,
        verifiedContractors: verifiedContractorsSnap.data().count,
        openProjects: openProjectsSnap.data().count,
        draftProjects: draftProjectsSnap.data().count,
        pendingKyc: pendingKycSnap.data().count,
        unreadMessages: unreadMessagesSnap.data().count,
        totalMessages: totalMessagesSnap.data().count,
        contractorServices: contractorServicesSnap.data().count
      });
      setMetricsError(null);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Failed to load admin metrics', error);
      setMetricsError('Unable to fetch live metrics.');
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const toneClasses: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    warning: 'bg-amber-50 text-amber-800 border border-amber-100',
    info: 'bg-blue-50 text-blue-700 border border-blue-100'
  };

  const handledMessages = Math.max(metrics.totalMessages - metrics.unreadMessages, 0);

  const overviewMetrics = useMemo(
    () => [
      {
        label: 'Users',
        value: metricsLoading ? '...' : formatNumber(metrics.totalUsers),
        change: metricsLoading ? 'Loading users' : `${formatNumber(metrics.contractors)} contractors`,
        icon: Users,
        accent: 'bg-emerald-500/15 text-emerald-100'
      },
      {
        label: 'Live projects',
        value: metricsLoading ? '...' : formatNumber(metrics.openProjects),
        change: metricsLoading ? 'Syncing projects' : `${formatNumber(metrics.draftProjects)} drafts`,
        icon: FolderOpen,
        accent: 'bg-blue-500/15 text-blue-100'
      },
      {
        label: 'Verified contractors',
        value: metricsLoading ? '...' : formatNumber(metrics.verifiedContractors),
        change: metricsLoading ? 'Syncing verifications' : `${formatNumber(metrics.contractorServices)} listings`,
        icon: ShieldCheck,
        accent: 'bg-indigo-500/15 text-indigo-100'
      },
      {
        label: 'Inbox',
        value: metricsLoading ? '...' : formatNumber(metrics.unreadMessages),
        change: metricsLoading ? 'Syncing messages' : `${formatNumber(handledMessages)} handled`,
        icon: MessageSquare,
        accent: 'bg-amber-500/20 text-amber-100'
      }
    ],
    [handledMessages, metrics.contractorServices, metrics.contractors, metrics.draftProjects, metrics.openProjects, metrics.totalMessages, metrics.unreadMessages, metrics.verifiedContractors, metricsLoading, metrics.totalUsers]
  );

  const actionQueue = useMemo(
    () => [
      {
        title: 'KYC reviews',
        value: metrics.pendingKyc,
        description: metricsLoading
          ? 'Syncing queue...'
          : metrics.pendingKyc
            ? 'Identity checks waiting'
            : 'Queue is clear',
        icon: Shield,
        tab: 'kyc',
        tone: 'bg-blue-50 text-blue-800 border-blue-100'
      },
      {
        title: 'Draft projects',
        value: metrics.draftProjects,
        description: metricsLoading
          ? 'Syncing drafts...'
          : metrics.draftProjects
            ? 'Awaiting approval/publish'
            : 'No drafts waiting',
        icon: FolderOpen,
        tab: 'moderation',
        tone: 'bg-emerald-50 text-emerald-800 border-emerald-100'
      },
      {
        title: 'Unread messages',
        value: metrics.unreadMessages,
        description: metricsLoading
          ? 'Syncing inbox...'
          : metrics.unreadMessages
            ? 'Replies needed today'
            : 'Inbox is clear',
        icon: MessageSquare,
        tab: 'messages',
        tone: 'bg-purple-50 text-purple-800 border-purple-100'
      },
      {
        title: 'Verified contractors',
        value: metrics.verifiedContractors,
        description: metricsLoading ? 'Syncing verification...' : 'Total verified providers',
        icon: UserCheck,
        tab: 'contractors',
        tone: 'bg-slate-50 text-slate-800 border-slate-100'
      }
    ],
    [metrics.draftProjects, metrics.pendingKyc, metrics.unreadMessages, metrics.verifiedContractors, metricsLoading]
  );

  const systemHealth = useMemo(
    () => [
      {
        name: 'Marketplace',
        status: metricsLoading ? 'Syncing' : metrics.openProjects ? 'Operational' : 'Quiet',
        detail: metricsLoading
          ? 'Fetching live project counts'
          : `${formatNumber(metrics.openProjects)} live projects`,
        tone: metrics.openProjects ? 'success' : 'info'
      },
      {
        name: 'Verification',
        status: metricsLoading ? 'Syncing' : metrics.pendingKyc ? 'Action needed' : 'Clear',
        detail: metricsLoading
          ? 'Loading KYC queue'
          : `${formatNumber(metrics.pendingKyc)} KYC in queue`,
        tone: metrics.pendingKyc ? 'warning' : 'success'
      },
      {
        name: 'Support',
        status: metricsLoading ? 'Syncing' : metrics.unreadMessages ? 'Queued' : 'All caught up',
        detail: metricsLoading
          ? 'Loading inbox stats'
          : `${formatNumber(metrics.unreadMessages)} unread messages`,
        tone: metrics.unreadMessages ? 'info' : 'success'
      },
      {
        name: 'Contractors',
        status: metricsLoading ? 'Syncing' : metrics.contractorServices ? 'Active' : 'Quiet',
        detail: metricsLoading
          ? 'Loading contractor metrics'
          : `${formatNumber(metrics.verifiedContractors)} verified / ${formatNumber(metrics.contractorServices)} listings`,
        tone: metrics.verifiedContractors ? 'success' : 'info'
      }
    ],
    [metrics.contractorServices, metrics.openProjects, metrics.pendingKyc, metrics.unreadMessages, metrics.verifiedContractors, metricsLoading]
  );

  const signals = useMemo(() => {
    const items: {
      title: string;
      time: string;
      icon: any;
      tab?: string;
      tone: 'warning' | 'info' | 'success';
    }[] = [];

    if (metrics.pendingKyc > 0) {
      items.push({
        title: `${formatNumber(metrics.pendingKyc)} KYC requests waiting`,
        time: 'Moments ago',
        icon: Shield,
        tab: 'kyc',
        tone: 'warning'
      });
    }

    if (metrics.draftProjects > 0) {
      items.push({
        title: `${formatNumber(metrics.draftProjects)} draft projects need review`,
        time: 'Moments ago',
        icon: FolderOpen,
        tab: 'moderation',
        tone: 'info'
      });
    }

    if (metrics.unreadMessages > 0) {
      items.push({
        title: `${formatNumber(metrics.unreadMessages)} inbox messages unread`,
        time: 'Moments ago',
        icon: MessageSquare,
        tab: 'messages',
        tone: 'info'
      });
    }

    if (!items.length) {
      items.push({
        title: 'All clear - no outstanding alerts',
        time: lastRefreshed ? lastRefreshed.toLocaleTimeString() : 'Just now',
        icon: CheckCircle2,
        tab: 'overview',
        tone: 'success'
      });
    }

    return items;
  }, [lastRefreshed, metrics.draftProjects, metrics.pendingKyc, metrics.unreadMessages]);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-sm text-slate-300">Control center</p>
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <p className="text-slate-300">
                  Monitor platform health, clear blockers, and keep the marketplace trusted.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-white/10 text-white border border-white/20">Production</Badge>
                <Badge className="bg-emerald-500/20 text-emerald-100 border border-emerald-400/40">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Stable
                </Badge>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  onClick={loadMetrics}
                  disabled={metricsLoading}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  {metricsLoading ? 'Refreshing...' : 'Refresh data'}
                </Button>
                <Button
                  variant="secondary"
                  className="bg-white text-slate-900 hover:bg-slate-100"
                  onClick={() => setActiveTab('analytics')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View analytics
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {overviewMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-white/30 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${metric.accent}`}>
                      <metric.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-slate-200">{metric.change}</span>
                  </div>
                  <div className="mt-3 text-2xl font-semibold">{metric.value}</div>
                  <p className="text-sm text-slate-300">{metric.label}</p>
                </div>
              ))}
            </div>

            {metricsError && (
              <p className="text-sm text-amber-200">{metricsError}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 -mt-10 relative">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100">
          <div className="p-4 sm:p-6 lg:p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-9 gap-2 bg-slate-50 rounded-2xl p-2">
                <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <Activity className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <Users className="h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <FolderOpen className="h-4 w-4" />
                  Projects
                </TabsTrigger>
                <TabsTrigger value="contractors" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <UserCheck className="h-4 w-4" />
                  Contractors
                </TabsTrigger>
                <TabsTrigger value="kyc" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <ShieldCheck className="h-4 w-4" />
                  KYC
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="moderation" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <Shield className="h-4 w-4" />
                  Moderation
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <div className="pt-6">
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <Card className="xl:col-span-2 border-slate-100 shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Action queue</CardTitle>
                        <p className="text-sm text-gray-600">
                          Jump into the items that keep the marketplace moving.
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {actionQueue.map((item) => (
                            <button
                              key={item.title}
                              className={`text-left rounded-2xl border p-4 transition hover:shadow-md ${item.tone}`}
                              onClick={() => setActiveTab(item.tab)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <item.icon className="h-4 w-4" />
                                  <span className="font-semibold">{item.title}</span>
                                </div>
                                <span className="text-sm font-semibold">{item.value}</span>
                              </div>
                              <p className="mt-2 text-sm opacity-80">{item.description}</p>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-slate-100 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Shortcuts</CardTitle>
                        <p className="text-sm text-gray-600">Move faster on your most common admin tasks.</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {shortcuts.map((shortcut) => (
                          <Button
                            key={shortcut.label}
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() => setActiveTab(shortcut.tab)}
                          >
                            <div className="flex items-center gap-3">
                              <shortcut.icon className="h-4 w-4" />
                              <div className="text-left">
                                <div className="font-medium">{shortcut.label}</div>
                                <div className="text-xs text-gray-600">{shortcut.description}</div>
                              </div>
                            </div>
                            <Sparkles className="h-4 w-4 text-amber-500" />
                          </Button>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-slate-100 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Health & uptime</CardTitle>
                        <p className="text-sm text-gray-600">
                          Live snapshot of platform services and SLAs.
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {systemHealth.map((service) => (
                          <div
                            key={service.name}
                            className={`flex items-center justify-between rounded-xl px-3 py-2 ${toneClasses[service.tone]}`}
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              <div>
                                <div className="font-semibold">{service.name}</div>
                                <div className="text-xs opacity-80">{service.detail}</div>
                              </div>
                            </div>
                            <span className="text-sm font-medium">{service.status}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-slate-100 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Signals & alerts</CardTitle>
                        <p className="text-sm text-gray-600">
                          Recent signals that may need your attention.
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {signals.map((signal) => (
                          <div
                            key={signal.title}
                            className="flex items-start justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-1 rounded-md p-2 ${
                                  signal.tone === 'warning'
                                    ? 'bg-amber-50 text-amber-700'
                                    : signal.tone === 'success'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-blue-50 text-blue-700'
                                }`}
                              >
                                <signal.icon className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{signal.title}</div>
                                <div className="text-xs text-gray-600">{signal.time}</div>
                              </div>
                            </div>
                            {signal.tab && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-sm text-blue-600"
                                onClick={() => setActiveTab(signal.tab)}
                              >
                                Open
                              </Button>
                            )}
                          </div>
                        ))}

                        <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-dashed border-slate-200 p-3">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <RefreshCcw className="h-4 w-4" />
                            {metricsLoading
                              ? 'Refreshing live data...'
                              : `Updated ${lastRefreshed ? lastRefreshed.toLocaleTimeString() : 'just now'}`}
                          </div>
                          <Badge variant="outline" className="flex items-center gap-1 text-gray-700">
                            <Globe2 className="h-3.5 w-3.5" />
                            Live
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="users" className="mt-6">
                  <AdminUserManagement />
                </TabsContent>

                <TabsContent value="projects" className="mt-6">
                  <AdminProjectManagement />
                </TabsContent>

                <TabsContent value="contractors" className="mt-6">
                  <AdminContractorManagement />
                </TabsContent>

                <TabsContent value="kyc" className="mt-6">
                  <AdminKycCenter />
                </TabsContent>

                <TabsContent value="messages" className="mt-6">
                  <AdminContactMessages />
                </TabsContent>

                <TabsContent value="moderation" className="mt-6">
                  <AdminContentModeration />
                </TabsContent>

                <TabsContent value="analytics" className="mt-6">
                  <AdminAnalytics />
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                  <AdminSystemSettings />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
