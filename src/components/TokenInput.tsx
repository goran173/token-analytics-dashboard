'use client';

import * as React from 'react';
import { isAddress, type Address } from 'viem';
import { Search, Clipboard, History, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chains } from '@/lib/chain';

import { useToast } from '@/hooks/use-toast';

interface TokenInputProps {
  onSearch: (address: Address, chainId: number) => void;
  initialAddress?: string;
  initialChainId?: number;
}

export function TokenInput({ onSearch, initialAddress = '', initialChainId = 1 }: TokenInputProps) {
  const [address, setAddress] = React.useState(initialAddress);
  const [chainId, setChainId] = React.useState(initialChainId.toString());
  const [recentSearches, setRecentSearches] = React.useState<{address: string, chainId: number}[]>([]);

  const { toast } = useToast();

  React.useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveSearch = (addr: string, cId: number) => {
    const newRecent = [
      { address: addr, chainId: cId },
      ...recentSearches.filter(s => s.address.toLowerCase() !== addr.toLowerCase()),
    ].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recent_searches', JSON.stringify(newRecent));
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isAddress(address)) {
      const cId = parseInt(chainId);
      onSearch(address as Address, cId);
      saveSearch(address, cId);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (isAddress(text)) {
        setAddress(text);
        toast({
          title: "Address Pasted",
          description: "Contract address loaded from clipboard.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid Address",
          description: "The clipboard content is not a valid Ethereum address.",
        });
      }
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const isValid = isAddress(address);

  return (
    <div className="flex flex-col gap-2 w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Contract Address (0x...)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={`pr-10 ${address && !isValid ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
            onClick={handlePaste}
            title="Paste from clipboard"
          >
            <Clipboard className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Select value={chainId} onValueChange={setChainId}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Chain" />
            </SelectTrigger>
            <SelectContent>
              {chains.map((chain) => (
                <SelectItem key={chain.id} value={chain.id.toString()}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-2 w-2 rounded-full" 
                      style={{ 
                        backgroundColor: 
                          chain.id === 1 ? '#627EEA' : // Ethereum
                          chain.id === 42161 ? '#28A0F0' : // Arbitrum
                          chain.id === 8453 ? '#0052FF' : // Base
                          chain.id === 137 ? '#8247E5' : '#ccc' // Polygon
                      }} 
                    />
                    {chain.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="submit" disabled={!isValid} className="px-6">
            <Search className="h-4 w-4 mr-2" />
            Analyze
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <History className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Recent Searches</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {recentSearches.length === 0 ? (
                <DropdownMenuItem disabled>No recent searches</DropdownMenuItem>
              ) : (
                recentSearches.map((s, i) => (
                  <DropdownMenuItem 
                    key={i} 
                    onClick={() => {
                      setAddress(s.address);
                      setChainId(s.chainId.toString());
                      onSearch(s.address as Address, s.chainId);
                    }}
                    className="flex flex-col items-start gap-1"
                  >
                    <span className="text-xs font-mono truncate w-full">{s.address}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {chains.find(c => c.id === s.chainId)?.name}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </form>
      {!isValid && address.length > 0 && (
        <p className="text-xs text-destructive ml-1">Please enter a valid Ethereum address</p>
      )}
    </div>
  );
}
