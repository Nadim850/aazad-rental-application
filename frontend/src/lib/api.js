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
          
          // Update the Authorization header for the retry
          options.headers.Authorization = `Bearer ${data.access}`;
          
          // Retry the original request
          response = await performFetch();
        } else {
          // Refresh token failed or expired
          clearTokens();
          window.location.href = '/auth/login';
        }
      } catch (err) {
        // Network error during refresh
        clearTokens();
        window.location.href = '/auth/login';
      }
    } else {
      // No refresh token available, must log in
      clearTokens();
      window.location.href = '/auth/login';
    }
  }

  return response;
}
