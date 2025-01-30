(function() {
    const protectedRouteMappings = {
        '/dashboard': '/',
        '/exercises/dashboard': '/exercises',
        '/nutrition/dashboard': '/nutrition',
        '/prizes/dashboard': '/prizes'
    };

    const guestRouteMappings = {
        '/': '/dashboard',
        '/exercises': '/exercises/dashboard',
        '/nutrition': '/nutrition/dashboard',
        '/prizes': '/prizes/dashboard'
    };

    // Execute route check immediately
    let currentPath = window.location.pathname;
    
    // Remove trailing slash if present (except for root '/')
    if (currentPath !== '/' && currentPath.endsWith('/')) {
        currentPath = currentPath.slice(0, -1);
    }

    const token = localStorage.getItem('login-token');
    const hasTokenHere = !!token;

    // Handle protected routes (logged-in users only)
    if (currentPath in protectedRouteMappings && !hasTokenHere) {
        window.location.href = protectedRouteMappings[currentPath];
        return;
    }

    // Handle guest routes (non-logged-in users only)
    if (currentPath in guestRouteMappings && hasTokenHere) {
        window.location.href = guestRouteMappings[currentPath];
        return;
    }
})();