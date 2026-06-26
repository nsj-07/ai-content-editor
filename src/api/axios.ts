import axios, { type AxiosError } from 'axios'

export interface WordPressApiError {
    message: string
    code: string
    status: number | null
}

function normalizeError(error: AxiosError): WordPressApiError {
    if (error.response) {
        // Server responded with a non-2xx status
        const data = error.response.data as Record<string, unknown>
        return {
            message: (data?.message as string) ?? error.message,
            code: (data?.code as string) ?? 'UNKNOWN_ERROR',
            status: error.response.status,
        }
    }

    if (error.request) {
        // Request was made but no response received (network / timeout)
        return {
            message: 'No response from server. Check your network or WordPress URL.',
            code: 'NETWORK_ERROR',
            status: null,
        }
    }

    // Something went wrong setting up the request
    return {
        message: error.message,
        code: 'REQUEST_SETUP_ERROR',
        status: null,
    }
}

const api = axios.create({
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => Promise.reject(normalizeError(error))
)

export default api