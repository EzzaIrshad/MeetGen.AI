import React from 'react'
import useAgentsFilters from '../../hooks/use-agents-filters'
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';

const AgentsSearchFilter = () => {
  const [filters, setFilters] = useAgentsFilters();
  return (
    <div className='relative'>
        <Input
        placeholder='Filter by name'
        className='h-9 bg-white w-50 pl-8'
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
        />
        <SearchIcon className='size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground'/>
    </div>
  )
}

export default AgentsSearchFilter
