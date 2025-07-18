# BuildHub Loading Screen System

This document describes the comprehensive loading screen system implemented for the BuildHub webapp.

## Components

### 1. LoadingScreen
A flexible loading component with multiple variants and configurations.

**Props:**
- `variant`: 'fullscreen' | 'overlay' | 'inline' - Controls the display type
- `size`: 'sm' | 'md' | 'lg' - Controls the size of the spinner and logo
- `message`: string - Optional loading message
- `showLogo`: boolean - Whether to show the BuildHub logo
- `className`: string - Additional CSS classes

**Usage:**
```tsx
import { LoadingScreen } from '@/components/ui/loading-screen';

// Fullscreen loading (covers entire viewport)
<LoadingScreen
  variant="fullscreen"
  message="Loading data..."
  showLogo={true}
/>

// Overlay loading (covers content with backdrop)
<LoadingScreen
  variant="overlay"
  message="Processing..."
  showLogo={false}
/>

// Inline loading (within content flow)
<LoadingScreen
  variant="inline"
  message="Fetching results..."
  size="sm"
/>
```

### 2. SplashScreen
Animated splash screen for initial app load with the BuildHub logo.

**Props:**
- `onComplete`: () => void - Callback when animation completes
- `duration`: number - Animation duration in milliseconds (default: 2000)
- `className`: string - Additional CSS classes

**Usage:**
```tsx
import { SplashScreen } from '@/components/ui/splash-screen';

<SplashScreen
  onComplete={() => setShowSplash(false)}
  duration={2500}
/>
```

### 3. RouteLoading
Specialized loading component for route transitions.

**Props:**
- `message`: string - Loading message (default: "Loading page...")

**Usage:**
```tsx
import { RouteLoading } from '@/components/ui/route-loading';

<RouteLoading message="Loading dashboard..." />
```

### 4. RouteTransition
Wrapper component that shows loading during route navigation.

**Usage:**
```tsx
import { RouteTransition } from '@/components/ui/route-transition';

<BrowserRouter>
  <RouteTransition>
    <Routes>
      {/* Your routes */}
    </Routes>
  </RouteTransition>
</BrowserRouter>
```

## Hook

### useLoading
Custom hook for managing loading states with delay and message support.

**Options:**
- `initialLoading`: boolean - Initial loading state
- `delay`: number - Delay before showing loading (useful for quick operations)

**Returns:**
- `loading`: boolean - Current loading state
- `loadingMessage`: string - Current loading message
- `startLoading`: (message?: string) => void - Start loading with optional message
- `stopLoading`: () => void - Stop loading
- `withLoading`: <T>(asyncFn: () => Promise<T>, message?: string) => Promise<T> - Wrapper for async operations

**Usage:**
```tsx
import { useLoading } from '@/hooks/use-loading';

const MyComponent = () => {
  const { loading, loadingMessage, withLoading } = useLoading({ delay: 300 });

  const fetchData = async () => {
    return await withLoading(
      async () => {
        // Your async operation
        const data = await api.getData();
        return data;
      },
      "Loading data..."
    );
  };

  if (loading) {
    return <LoadingScreen variant="inline" message={loadingMessage} />;
  }

  return <div>Your content</div>;
};
```

## Implementation Examples

### 1. Authentication Loading
The AuthContext uses the LoadingScreen for authentication state checking:

```tsx
// In AuthContext.tsx
return (
  <AuthContext.Provider value={value}>
    {loading ? (
      <LoadingScreen
        variant="fullscreen"
        message="Checking authentication..."
        showLogo={true}
      />
    ) : (
      children
    )}
  </AuthContext.Provider>
);
```

### 2. Data Fetching Loading
Components use the LoadingScreen for data fetching:

```tsx
// In Projects.tsx
if (loading) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <LoadingScreen
        variant="inline"
        message="Loading projects..."
        showLogo={true}
      />
    </div>
  );
}
```

### 3. Form Submission Loading
Forms use the LoadingScreen for submission states:

```tsx
// In forms
<Button type="submit" disabled={loading}>
  {loading ? (
    <LoadingScreen variant="inline" size="sm" message="Submitting..." />
  ) : (
    'Submit'
  )}
</Button>
```

## Best Practices

1. **Use appropriate variants:**
   - `fullscreen` for app initialization and authentication
   - `overlay` for modal operations and route transitions
   - `inline` for component-level loading

2. **Provide meaningful messages:**
   - Be specific about what's loading
   - Use action-oriented language ("Loading projects..." vs "Please wait...")

3. **Consider loading delays:**
   - Use the `delay` option in `useLoading` for quick operations
   - This prevents flickering for operations that complete quickly

4. **Consistent branding:**
   - Use the BuildHub logo (`showLogo={true}`) for app-level operations
   - Hide the logo for component-level operations

5. **Accessibility:**
   - Loading messages provide context for screen readers
   - Spinner animations are smooth and not distracting

## File Structure

```
src/
├── components/
│   └── ui/
│       ├── loading-screen.tsx      # Main loading component
│       ├── splash-screen.tsx       # Initial app splash
│       ├── route-loading.tsx       # Route transition loading
│       └── route-transition.tsx    # Route transition wrapper
├── hooks/
│   └── use-loading.tsx            # Loading state management
└── contexts/
    └── AuthContext.tsx            # Uses LoadingScreen for auth
```

This loading system provides a consistent, branded, and user-friendly experience throughout the BuildHub application. 