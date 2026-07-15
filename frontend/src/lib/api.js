let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRrefreshed(token) {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
}

/**
 * Custom fetch wrapper to handle authentication and automatic token refresh.
 * 
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Response>} - The fetch response
 */
export async function apiFetch(url, options = {}) {
  const getAccessToken = () => localStorage.getItem('access');
  const getRefreshToken = () => localStorage.getItem('refresh');

  const setTokens = (access, refresh) => {
    if (access) localStorage.setItem('access', access);
    if (refresh) localStorage.setItem('refresh', refresh);
  };

  const clearTokens = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  };

  // Ensure headers object exists
  if (!options.headers) {
    options.headers = {};
  }

  // Set Authorization header if access token exists and it's not explicitly omitted
  let accessToken = getAccessToken();
  if (accessToken && !options.headers.Authorization) {
    options.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Function to perform the actual fetch
  const performFetch = () => fetch(url, options);

  let response = await performFetch();

  // If unauthorized, attempt to refresh the token
  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    
    // Only attempt refresh if we have a refresh token
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshResponse = await fetch('http://localhost:8000/api/accounts/login/refresh/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh: refreshToken })
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            setTokens(data.access, data.refresh);
            isRefreshing = false;
            
            // Update the Authorization header for the retry
            options.headers.Authorization = `Bearer ${data.access}`;
            const retryResponse = await performFetch();
            
            // Notify subscribers
            onRrefreshed(data.access);
            return retryResponse;
          } else {
            // Refresh token failed or expired
            isRefreshing = false;
            clearTokens();
            onRrefreshed(null); // Notify failure
            window.location.href = '/auth/login';
            return response;
          }
        } catch (err) {
          // Network error during refresh
          isRefreshing = false;
          clearTokens();
          onRrefreshed(null); // Notify failure
          window.location.href = '/auth/login';
          return response;
        }
      } else {
        // Wait for the token refresh to complete (for queued requests)
        return new Promise((resolve) => {
          subscribeTokenRefresh(async (newToken) => {
            if (newToken) {
              // Update the Authorization header for the retry
              options.headers.Authorization = `Bearer ${newToken}`;
              resolve(await performFetch());
            } else {
              resolve(response); // resolve with original 401 on failure
            }
          });
        });
      }
    } else {
      // No refresh token available, must log in
      clearTokens();
      window.location.href = '/auth/login';
    }
  }

  return response;
}
