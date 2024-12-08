(function() {
    const routeMappings = {
        '/': '/dashboard',
        '/dashboard': '/',
        '/exercises': '/exercises/dashboard',
        '/exercises/dashboard': '/exercises'
    };

    // Execute route check immediately
    let currentPath = window.location.pathname;
    
    // Remove trailing slash if present (except for root '/')
    if (currentPath !== '/' && currentPath.endsWith('/')) {
        currentPath = currentPath.slice(0, -1);
    }

    const token = localStorage.getItem('login-token');
    const hasTokenHere = !!token;

    // If the current path is in routeMappings, check if we need to redirect
    if (currentPath in routeMappings) {
        // If it's a protected route (value in routeMappings is guest route)
        const isProtectedRoute = Object.values(routeMappings).includes(currentPath);
        
        if (isProtectedRoute && !hasTokenHere) {
            window.location.href = routeMappings[currentPath];
            return;
        }
        
        // If it's a guest route (key in routeMappings)
        const isGuestRoute = Object.keys(routeMappings).includes(currentPath);
        
        if (isGuestRoute && hasTokenHere) {
            window.location.href = routeMappings[currentPath];
            return;
        }
    }
})();