import { DEFAULT_PAGE } from '@/constants'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'


const useAgentsFilters = () => {
  return useQueryStates({
    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
  })
}

export default useAgentsFilters