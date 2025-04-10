import { lazy, Suspense } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';

/**
 * Creates a lazy-loaded route component with loading indicator
 */
export function createLazyRouteComponent(factory: () => Promise<{ default: React.ComponentType<any> }>) {
  const LazyComponent = lazy(factory);
  
  return (props: any) => (
    <Suspense 
      fallback={
        <LoadingScreen
          variant="inline"
          text="Loading content..."
          size="lg"
        />
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );
} 