// src/websocket/navigationService.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Navigation service for WebSocket handlers.
 * Allows navigation from non-React contexts (e.g., WebSocket event handlers).
 */

type NavigateFunction = (path: string, options?: any) => void;

let navigateRef: NavigateFunction | null = null;

export const navigationService = {
  /**
   * Register the navigate function from React Router.
   * Should be called once when the WebSocketLayout mounts.
   */
  setNavigate: (navigate: NavigateFunction | null) => {
    navigateRef = navigate;
  },

  /**
   * Navigate to a path using the registered navigate function.
   * @param path - The path to navigate to (relative or absolute)
   * @param options - Optional navigation options (state, replace, etc.)
   */
  navigate: (path: string, options?: any) => {
    if (!navigateRef) {
      console.error(
        '[NavigationService] Navigate function not set. Cannot navigate to:',
        path,
      );
      return;
    }
    navigateRef(path, options);
  },

  /**
   * Navigate to the game screen based on game type.
   * Used by the pre_start WebSocket handler.
   * @param gameType - The game type (e.g., 'Black_Jokes', 'fuflomicin')
   */
  navigateToGame: (gameType?: string) => {
    // Map game names to routes
    const gameRouteMap: Record<string, string> = {
      Black_Jokes: 'evil-cards',
      fuflomicin: 'fuflomicin',
      'Trade for hire': 'hire-for-fun',
    };

    const gamePath = gameType
      ? gameRouteMap[gameType] || gameType
      : 'evil-cards'; // Default to evil-cards if not specified

    navigationService.navigate(gamePath, {
      state: { fromPreStart: true },
    });
  },
};
