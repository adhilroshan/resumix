import { createTheme } from '@mantine/core';

// Define a custom primary color array with 10 values
const primary: [string, string, string, string, string, string, string, string, string, string] = [
  '#e0f2ff',
  '#b3d9ff',
  '#85bfff',
  '#54a6ff',
  '#2e8eff',
  '#1579ff',
  '#0066ff',
  '#0057dd',
  '#004bc2',
  '#003ea6'
];

// Export theme
export const theme = createTheme({
  primaryColor: 'primary',
  colors: {
    primary,
  },
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: {
        fw: 500,
      },
    },
    Paper: {
      defaultProps: {
        shadow: 'xs',
        p: 'md',
        withBorder: true,
      },
    },
  },
});