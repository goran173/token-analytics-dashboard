'use client';

import * as React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  ExternalLink, 
  Download, 
  Search,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { explorers } from '@/lib/chain';
import { type Address } from 'viem';

interface Transfer {
  from: Address;
  to: Address;
  value: bigint;
  blockNumber: bigint;
  txHash: string;
  timestamp: number;
}

interface TransfersTableProps {
  transfers: Transfer[];
  symbol: string;
  decimals: number;
  chainId: number;
}

export function TransfersTable({ transfers, symbol, decimals, chainId }: TransfersTableProps) {
  const [page, setPage] = React.useState(1);
  const [filter, setFilter] = React.useState('');
  const [copied, setCopied] = React.useState<string | null>(null);
  const itemsPerPage = 10;

  const filteredTransfers = React.useMemo(() => {
    return transfers.filter(tx => 
      tx.from.toLowerCase().includes(filter.toLowerCase()) || 
      tx.to.toLowerCase().includes(filter.toLowerCase()) ||
      tx.txHash.toLowerCase().includes(filter.toLowerCase())
    );
  }, [transfers, filter]);

  const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage);
  const currentItems = filteredTransfers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'From', 'To', 'Value', 'TxHash'];
    const rows = filteredTransfers.map(tx => [
      format(tx.timestamp * 1000, 'yyyy-MM-dd HH:mm:ss'),
      tx.from,
      tx.to,
      Number(tx.value).toString(),
      tx.txHash
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transfers_${symbol}_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatAmount = (val: bigint) => {
    const num = Number(val) / (10 ** decimals);
    return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  if (transfers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-xl border-2 border-dashed">
        <ArrowUpDown className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-bold">No Transfers Found</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          There are no recent transfers for this token in the analyzed block window.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by address or tx hash..."
            className="pl-9"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Button variant="outline" size="sm" onClick={exportToCSV} className="w-full sm:w-auto">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Time</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((tx) => (
              <TableRow key={tx.txHash} className="group">
                <TableCell>
                  <span className="text-xs font-medium cursor-help" title={format(tx.timestamp * 1000, 'PPP p')}>
                    {formatDistanceToNow(tx.timestamp * 1000, { addSuffix: true })}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs truncate max-w-[120px]">{tx.from}</span>
                    <button onClick={() => copyToClipboard(tx.from)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy className={`h-3 w-3 ${copied === tx.from ? 'text-green-500' : 'text-muted-foreground'}`} />
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs truncate max-w-[120px]">{tx.to}</span>
                    <button onClick={() => copyToClipboard(tx.to)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy className={`h-3 w-3 ${copied === tx.to ? 'text-green-500' : 'text-muted-foreground'}`} />
                    </button>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatAmount(tx.value)} <span className="text-[10px] text-muted-foreground uppercase">{symbol}</span>
                </TableCell>
                <TableCell>
                  <a 
                    href={`${explorers[chainId]}/tx/${tx.txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {currentItems.map((tx) => (
          <div key={tx.txHash} className="p-4 border rounded-lg bg-card space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                {formatDistanceToNow(tx.timestamp * 1000, { addSuffix: true })}
              </span>
              <a href={`${explorers[chainId]}/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase">From</p>
                <p className="text-xs font-mono truncate">{tx.from}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase">To</p>
                <p className="text-xs font-mono truncate">{tx.to}</p>
              </div>
            </div>
            <div className="pt-2 border-t flex justify-between items-center">
              <p className="text-xs text-muted-foreground font-medium">Amount</p>
              <p className="font-bold text-sm">
                {formatAmount(tx.value)} {symbol}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} ({filteredTransfers.length} results)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
