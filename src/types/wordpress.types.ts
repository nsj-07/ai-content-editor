export interface CreatePostPayload {
    wordpressUrl: string
    username: string
    appPassword: string
    title: string
    content: string
    status: 'draft' | 'publish'
}