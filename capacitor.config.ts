import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zalovealways',
  appName: 'figmacricket',
  webDir: 'www',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '283947795791-ccg73rtcieliv8urtvhvsljqruunj7g7.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
