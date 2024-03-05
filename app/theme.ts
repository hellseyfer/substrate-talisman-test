// theme.js or theme.ts
'use client';
import { extendTheme } from '@chakra-ui/react';

const brand = {
  100: '#f7fafc',
  // ...
  900: '#1a202c',
};
const overrides = {
  fonts: {
    heading: 'var(--font-rubik)',
    body: 'var(--font-rubik)',
  },
  useSystemColorMode: false,
  initialColorMode: 'dark',
  cssVarPrefix: 'chakra',
  components: {
    Button: {
      baseStyle: {
        borderRadius: '4px',
      },
      sizes: {
        small: {
          px: 5,
          h: '50px',
          fontSize: '20px',
        },
        medium: {
          px: 7,
          h: '60px',
          fontSize: '25px',
        },
        large: {
          px: 8,
          h: '70px',
          fontSize: '30px',
          borderRadius: '10px',
        },
      },
      variants: {
        primary: {
          bg: brand[900],
          color: brand[100],
          _hover: {
            color: brand[900],
            bg: brand[100],
            borderColor: brand[900],
          },
        },
      },
    },

    Heading: {
      baseStyle: {
        //fontFamily: 'Inter',
        fontWeight: '600',
      },
      sizes: {
        small: {
          fontSize: '20px',
        },
        medium: { fontSize: '25px' },
        large: { fontSize: '50px' },
      },
    },
  },
};

const customTheme = extendTheme(overrides);

export default customTheme;
