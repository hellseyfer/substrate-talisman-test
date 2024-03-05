// app/providers.tsx
'use client';

import { ChakraProvider } from '@chakra-ui/react';
import customTheme from './theme';
import { StoreProvider } from './StoreProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <ChakraProvider theme={customTheme}>{children}</ChakraProvider>;
    </StoreProvider>
  );
}
