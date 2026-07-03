import api from './axios'
import type { WordPressApiError } from './axios'
import type { CreatePostPayload } from '@/types/wordpress.types'

export type { WordPressApiError }

/**
 * Creates a new WordPress post via the REST API.
 * Credentials and site URL are sourced from the application settings
 * (stored in the editor store / localStorage) and passed in via the payload.
 */
export const createPost = async ({
    wordpressUrl,
    username,
    appPassword,
    title,
    content,
    status,
}: CreatePostPayload) => {
    if (!wordpressUrl || !username || !appPassword) {
        throw {
            message: 'WordPress URL, username, and application password are required.',
            code: 'MISSING_CREDENTIALS',
            status: null,
        } satisfies WordPressApiError
    }

    const credentials = btoa(`${username}:${appPassword}`)

    // Throws a normalized WordPressApiError on failure (handled by the response interceptor)
    return api.post(
        `${wordpressUrl}/wp-json/wp/v2/posts`,
        { title, content, status },
        {
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        }
    )
}