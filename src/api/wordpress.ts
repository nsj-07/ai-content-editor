import api from './axios'
import type { WordPressApiError } from './axios'
import type { CreatePostPayload } from '@/types/wordpress.types.ts'

export type { WordPressApiError }

const username = import.meta.env.VITE_WP_USERNAME
const appPassword = import.meta.env.VITE_WP_PASSWORD
const wordpressBaseURL = import.meta.env.VITE_WP_BASE_URL

export const createPost = async ({
    title,
    content,
    status,
}: CreatePostPayload) => {

    if (!wordpressBaseURL || !username || !appPassword) {
        throw {
            message: 'WordPress URL, username, and application password are required.',
            code: 'MISSING_CREDENTIALS',
            status: null,
        } satisfies WordPressApiError
    }

    const credentials = btoa(`${username}:${appPassword}`)
    console.log('credentials: ', credentials);


    // Throws a normalized WordPressApiError on failure (handled by the response interceptor)
    return api.post(
        `${wordpressBaseURL}/wp-json/wp/v2/posts`,
        { title, content, status },
        {
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        }
    )
}