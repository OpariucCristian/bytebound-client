import type { ClerkProviderProps } from '@clerk/react';

// Matches the RPG world tokens in index.css (plum, bone, torch)
export const clerkAppearance: ClerkProviderProps['appearance'] = {
  variables: {
    colorPrimary: 'hsl(42 95% 58%)',
    colorPrimaryForeground: 'hsl(322 45% 6%)',
    colorBackground: 'hsl(322 38% 11%)',
    colorForeground: 'hsl(38 35% 90%)',
    colorMutedForeground: 'hsl(30 16% 70%)',
    colorInput: 'hsl(322 32% 16%)',
    colorInputForeground: 'hsl(38 35% 90%)',
    colorBorder: 'hsl(320 24% 40%)',
    colorDanger: 'hsl(352 85% 66%)',
    colorNeutral: 'hsl(38 35% 90%)',
    borderRadius: '0',
    fontFamily: '"Press Start 2P", cursive',
    fontSize: '0.75rem',
  },
};
