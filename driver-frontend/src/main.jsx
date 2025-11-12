import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CustomRoute from './Router.jsx'
import { SocketProvider } from './context/SocketContext.jsx'

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <CustomRoute />
      </SocketProvider>
    </QueryClientProvider>
  </StrictMode>,
)
