import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CustomRoute from './Router.jsx'

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <CustomRoute />
    </QueryClientProvider>
  </StrictMode>,
)
