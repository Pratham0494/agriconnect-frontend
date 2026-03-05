import axios from 'axios';


const setCookie = (name, value, days) => {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }


    document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax; Secure`;
};

const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

const eraseCookie = (name) => {
    document.cookie = name + '=; Max-Age=-99999999; path=/;';
};



const axiosInstance = axios.create({
    baseURL: 'http://16.16.201.131/',
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        if (config.url && config.url.includes('s3.amazonaws.com')) {
            // Strip the Authorization header so AWS doesn't throw a 400 error
            delete config.headers['Authorization'];
            if (config.headers.common) {
                delete config.headers.common['Authorization'];
            }
        } else {
            const token = getCookie('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;


            const refreshToken = getCookie('refresh_token');

            if (refreshToken) {
                try {

                    const response = await axios.post('http://16.16.201.131/admin-api/token/refresh/', {
                        refresh: refreshToken,
                    });

                    const { access } = response.data;


                    setCookie('access_token', access, 1);

                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${access}`;

                    return axiosInstance(originalRequest);
                } catch (refreshError) {
                    console.error("Session expired.");
                    eraseCookie('access_token');
                    eraseCookie('refresh_token');
                    window.location.href = '/login';
                }
            } else {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
export { setCookie, getCookie, eraseCookie };