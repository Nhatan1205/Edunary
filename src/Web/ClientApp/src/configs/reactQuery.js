import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5,
      refetchOnWindowFocus: true,
      refetchOnmount: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

export default queryClient;