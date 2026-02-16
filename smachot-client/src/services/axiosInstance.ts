import axios from 'axios';

const DEFAULT_API_BASE_URL = 'https://localhost:7168';
const ENV_API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

const resolveApiBaseUrl = () => {
    let baseUrl = (ENV_API_BASE_URL || DEFAULT_API_BASE_URL).trim();

    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        const isEmulatorHost = host === '10.0.2.2';

        if (isEmulatorHost) {
            try {
                const url = new URL(baseUrl);

                if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
                    url.hostname = '10.0.2.2';

                    if (url.protocol === 'https:' && url.port === '7168') {
                        url.protocol = 'http:';
                        url.port = '5226';
                    }

                    baseUrl = url.toString();
                }
            } catch {
                // If the URL is invalid, keep the original value.
            }
        }
    }

    return baseUrl.replace(/\/$/, '');
};

const axiosInstance = axios.create({
    baseURL: resolveApiBaseUrl(),
    withCredentials: true
});

export default axiosInstance;
