'use client';

import { motion } from 'motion/react';
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { formatDistance } from 'date-fns';

interface HealthStatus {
  status: string;
  timestamp_utc: string;
  version: string;
  dependencies: {
    ollama: string;
    mongodb: string;
    neo4j: string;
    rl_model: string;
  };
  rl_info: {
    num_topics: number | string;
    num_strategies: number;
    model_path: string;
  };
}

export default function SystemStatus() {
  const [statusData, setStatusData] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchedRef = useRef(false);

  const fetchStatus = async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/adaptive/health');
      if (!response.ok) throw new Error(`Failed to fetch status: ${response.statusText}`);
      const data = await response.json();
      setStatusData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Use a ref to ensure we only fetch once
  useEffect(() => {
    // This ensures the effect only runs once during the component's lifecycle
    if (fetchedRef.current) return;
    
    fetchedRef.current = true;
    fetchStatus();
    
    // No dependency array needed since we're using the ref as a control
  });

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'healthy':
      case 'loaded':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'unhealthy':
      case 'unavailable':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
        return 'Operational';
      case 'loaded':
        return 'Loaded';
      case 'unhealthy':
      case 'unavailable':
        return 'Unavailable';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const handleManualRefresh = () => {
    fetchStatus();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 bg-muted/40">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-red-500 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Error Loading System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleManualRefresh} 
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-muted/40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-bold">System Status</CardTitle>
              <CardDescription>
                {lastUpdated && (
                  <span className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" />
                    Updated {formatDistance(lastUpdated, new Date(), { addSuffix: true })}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {statusData && (
                <Badge
                  variant={statusData.status === 'healthy' ? 'default' : 'destructive'}
                  className="text-sm px-3 py-1 gap-1.5"
                >
                  {getStatusIcon(statusData.status)}
                  {statusData.status.toUpperCase()}
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualRefresh} 
                disabled={isRefreshing}
                className="ml-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="ml-2 hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-xl" />
                ))}
              </div>
            ) : statusData ? (
              <>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {Object.entries(statusData.dependencies).map(([service, status]) => (
                    <Card key={service} className="overflow-hidden border-t-4" style={{ borderTopColor: status.toLowerCase() === 'ok' || status.toLowerCase() === 'loaded' ? '#10b981' : '#ef4444' }}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium capitalize text-base mb-1">{service}</h3>
                            <p className="text-lg font-semibold">{getStatusText(status)}</p>
                          </div>
                          {getStatusIcon(status)}
                        </div>
                        {service === 'rl_model' && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {status !== 'loaded' ? 'Model status: ' + status : 'Model loaded successfully'}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {statusData.rl_info && (
                  <Card className="border-t-4 border-t-blue-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        Reinforcement Learning Model
                        <Badge variant="outline" className="ml-2">v{statusData.version}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Topics</TableHead>
                            <TableHead>Strategies</TableHead>
                            <TableHead>Model Path</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">{statusData.rl_info.num_topics}</TableCell>
                            <TableCell className="font-medium">{statusData.rl_info.num_strategies}</TableCell>
                            <TableCell className="font-mono text-xs sm:text-sm truncate max-w-[200px] sm:max-w-none">
                              {statusData.rl_info.model_path}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}