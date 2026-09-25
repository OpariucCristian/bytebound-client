import type { ClerkProviderProps } from '@clerk/react';

// Matches the arcade palette in index.css
export const clerkAppearance: ClerkProviderProps['appearance'] = {
  variables: {
    colorPrimary: 'hsl(25 95% 53%)',
    colorPrimaryForeground: 'hsl(0 0% 98%)',
    colorBackground: 'hsl(0 0% 18%)',
    colorForeground: 'hsl(0 0% 98%)',
    colorMutedForeground: 'hsl(0 0% 70%)',
    colorInput: 'hsl(0 0% 22%)',
    colorInputForeground: 'hsl(0 0% 98%)',
    colorBorder: 'hsl(0 0% 35%)',
    colorDanger: 'hsl(0 85% 60%)',
    colorNeutral: 'hsl(0 0% 98%)',
    borderRadius: '0',
    fontFamily: '"Press Start 2P", cursive',
    fontSize: '0.75rem',
  },
};
