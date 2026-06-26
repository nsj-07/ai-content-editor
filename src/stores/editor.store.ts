import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { EditorDocument } from '@/types/editor.types'
import { createEmptyDocument } from '@/types/editor.types'
import axios from 'axios'


export interface AiSuggestion {
  id: string
  timestamp: string
  prompt: string
  contextText: string
  response: string
  status: 'completed' | 'error'
}

export const useEditorStore = defineStore('editor', () => {
  // State
  const document = ref<EditorDocument>(createEmptyDocument())
  const isDirty = ref(false)
  const lastSavedAt = ref<string | null>(null)

  // We keep editorInstance typed as any to prevent TipTap core vs vue-3 version type issues
  let editorInstance = ref<any>(null)
  const selectionText = ref('')

  // Settings state (hydrated from localStorage)
  const settings = ref({
    geminiApiKey: localStorage.getItem('editor_gemini_key') || 'AIzaSyCrltrY_kkh9TY9K0KA-Wrm9XJJTV-pHaE',
    wordpressUrl: 'http://ai-content-editor.local',
    wordpressUsername: localStorage.getItem('editor_wp_username') || '',
    wordpressPassword: localStorage.getItem('editor_wp_password') || '',
    useMockAi: localStorage.getItem('editor_use_mock_ai') !== 'false', // Default true
    useMockWp: localStorage.getItem('editor_use_mock_wp') !== 'false' // Default true
  })

  // AI Suggestion State
  const aiHistory = ref<AiSuggestion[]>([])
  const activePrompt = ref('')
  const activeResponse = ref('')
  const aiStreamingStatus = ref<'idle' | 'streaming' | 'completed' | 'error'>('idle')
  const aiActiveCommand = ref<'improve' | 'headings' | 'shorten' | 'custom' | null>(null)

  // WordPress publishing logs
  const publishLog = ref<string>('')
  const publishedPostUrl = ref<string>('')

  // Getters
  const wordCount = computed(() => document.value.wordCount)
  const hasTitle = computed(() => document.value.title.trim().length > 0)

  // Actions
  function setEditorInstance(editor: any) {
    editorInstance.value = editor
  }

  function getEditorInstance() {
    return editorInstance.value
  }

  function updateTitle(title: string) {
    document.value.title = title
    document.value.slug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
    isDirty.value = true
  }

  function updateContent(words: number) {
    document.value.wordCount = words
    document.value.updatedAt = new Date().toISOString()
    isDirty.value = true
  }

  function updateSelection(text: string) {
    selectionText.value = text
  }

  function saveSettings(newSettings: typeof settings.value) {
    settings.value = { ...newSettings }
    localStorage.setItem('editor_gemini_key', settings.value.geminiApiKey)
    localStorage.setItem('editor_wp_url', settings.value.wordpressUrl)
    localStorage.setItem('editor_wp_username', settings.value.wordpressUsername)
    localStorage.setItem('editor_wp_password', settings.value.wordpressPassword)
    localStorage.setItem('editor_use_mock_ai', String(settings.value.useMockAi))
    localStorage.setItem('editor_use_mock_wp', String(settings.value.useMockWp))
  }

  // AI Suggestion Streaming

  async function streamAiSuggestion(prompt: string, command: 'improve' | 'headings' | 'shorten' | 'custom') {
    if (aiStreamingStatus.value === 'streaming') return

    activePrompt.value = prompt
    activeResponse.value = ''
    aiStreamingStatus.value = 'streaming'
    aiActiveCommand.value = command

    const context = selectionText.value.trim()

    if (settings.value.geminiApiKey) {
      try {
        const fullPrompt = `You are a professional blogging and WordPress expert assistant.
Context Selected Text: "${context}"
User instruction: "${prompt}"

Provide direct, actionable suggestions. Do not include markdown meta wrappers like \`\`\`html. Keep your formatting clean and standard.`

        // console.log('fullPrompt: ', fullPrompt)
        // return
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${settings.value.geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: fullPrompt }] }]
            })
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP API error! Status: ${response.status}`)
        }

        // ✅ Parse complete JSON response directly (Gemini returns full JSON, not a stream)
        const data = await response.json()
        const fullText = data?.candidates?.[0]?.content?.parts?.[0]?.text

        if (!fullText) {
          throw new Error('No response text returned from Gemini API.')
        }

        // ✅ Simulate word-by-word streaming for visual effect (same as mock mode)
        const words = fullText.split(' ')
        let wordIndex = 0

        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (wordIndex < words.length) {
              activeResponse.value += (wordIndex === 0 ? '' : ' ') + words[wordIndex]
              wordIndex++
            } else {
              clearInterval(interval)
              resolve()
            }
          }, 50)
        })

        aiStreamingStatus.value = 'completed'
        aiHistory.value.unshift({
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString(),
          prompt,
          contextText: context,
          response: activeResponse.value,
          status: 'completed'
        })

      } catch (err: any) {
        activeResponse.value = `Error generating suggestion: ${err.message || err}. Please check your API Key and Network connection.`
        aiStreamingStatus.value = 'error'
      }
    }
    // 2. High-fidelity Context-Aware Mock Streaming Mode
    else {
      let responseText = ''

      if (command === 'headings') {
        const docTitle = document.value.title || 'Your Blog Post'
        responseText = `Here are 5 SEO-optimized headings for your post about **"${docTitle}"**:

1. 🚀 **The Ultimate Guide to ${docTitle || 'Modern Blogging'}**
   *Why this works:* Connects with readers seeking actionable advice and full coverage.
   
2. 💡 **5 Proven Strategies for ${docTitle || 'Creating AI Content'}**
   *Why this works:* Visualizing lists creates curiosity and drives high click-through rates.
   
3. ⚡ **Boost Your Productivity: How to Scale ${docTitle || 'Content Development'}**
   *Why this works:* Solves a high-priority pain-point (speed and scaling) for developers and writers.
   
4. 🧠 **Behind the Scenes: The Future of ${docTitle || 'WordPress Publishing'} in 2026**
   *Why this works:* Establishes professional thought leadership and provides future-proofed advice.
   
5. 🔑 **Why You're Writing ${docTitle || 'Articles'} Wrong (And How to Fix It)**
   *Why this works:* Uses negative urgency to trigger instantaneous click triggers.`
      }
      else if (command === 'shorten') {
        responseText = `Here is a shortened, high-impact version (exactly 2 sentences):

"Leveraging advanced AI assistance directly within the editor enables content creators to compose, refine, and polish articles with peak productivity. Seamlessly publishing these drafts to WordPress REST API endpoints removes context switching, establishing a fully cohesive publishing workflow."`
      }
      else if (command === 'improve') {
        const base = context || 'this section'
        responseText = `Here is an enhanced, highly-engaging version of your paragraph:

<blockquote>"Drafting compelling articles requires a strategic blend of deep research, structured prose, and engaging delivery. By integrating real-time AI suggestions directly inside your TipTap editor panel, writers can immediately break through writer's block, refine complex arguments, and publish SEO-optimized posts without ever leaving their workspace."</blockquote>

*Style improvements applied:*
* **Elevated Vocabulary:** Swapped basic verbs for active, powerful replacements ('strategic blend', 'integrating', 'refine').
* **Pacing & Readability:** Improved sentence balance and split overly dense sections.
* **Semantic Callouts:** Added clean blockquote nesting to emphasize the core takeaways.`
      }
      else {
        responseText = `### 🪄 AI Assistant Response
I've analyzed your request: *"${prompt}"*

Based on your active draft: **"${document.value.title || 'Untitled Post'}"**, here is the recommended content:

Writing high-quality content is as much about structure as it is about syntax. Ensure your sub-headers use active, engaging verbs and that key paragraphs are punctuated with **bold callouts** or custom bullet lists. 

This establishes a clear hierarchy, helping your audience scan the post efficiently and retaining high search engine rankings.`
      }

      const words = responseText.split(' ')
      let wordIndex = 0

      const interval = setInterval(() => {
        if (wordIndex < words.length) {
          activeResponse.value += (wordIndex === 0 ? '' : ' ') + words[wordIndex]
          wordIndex++
        } else {
          clearInterval(interval)
          aiStreamingStatus.value = 'completed'
          aiHistory.value.unshift({
            id: crypto.randomUUID(),
            timestamp: new Date().toLocaleTimeString(),
            prompt,
            contextText: context,
            response: activeResponse.value,
            status: 'completed'
          })
        }
      }, 50)
    }
  }

  function applyAiSuggestion(suggestionText: string, mode: 'replace' | 'insert') {
    const editor = getEditorInstance()
    if (!editor) return

    // Standardize text if it has HTML markdown blocks or quote callouts
    // We clean blockquote references or custom meta lines if needed, or inject directly
    let contentToInject = suggestionText
    if (suggestionText.includes('<blockquote>') && suggestionText.includes('</blockquote>')) {
      const match = suggestionText.match(/<blockquote>"([\s\S]*?)"<\/blockquote>/)
      if (match && match[1]) {
        contentToInject = match[1]
      }
    }

    if (mode === 'replace') {
      editor.chain().focus().insertContent(contentToInject).run()
    } else {
      // Insert at current cursor
      editor.chain().focus().insertContent('\n' + contentToInject).run()
    }
    isDirty.value = true
  }

  // WordPress Publishing Pipeline
  async function publishToWordPress(status: 'draft' | 'publish') {
    document.value.status = 'publishing'
    publishLog.value = ''
    publishedPostUrl.value = ''

    const log = (line: string) => {
      publishLog.value += line + '\n'
    }

    const title = document.value.title || 'Untitled Post'
    const content = editorInstance.value?.getHTML?.() ?? ''
    const endpoint = `${settings.value.wordpressUrl}/wp-json/wp/v2/posts`

    try {
      const username = "neelj";
      const apppwd = "nbIY Olhb BRXL g1HD paW5 Bkgn";
      const credentials = btoa(`${username}:${apppwd}`)


      // --- Mock mode ---
      // if (settings.value.useMockWp) {
      //   log('> [MOCK] Simulating WordPress REST API publish...')
      //   await new Promise((r) => setTimeout(r, 600))
      //   log(`> POST ${endpoint || 'http://ai-content-editor.local/wp-json/wp/v2/posts'}`)
      //   await new Promise((r) => setTimeout(r, 400))
      //   log(`> Payload: title="${title}", status="${status}", content length=${content.length} chars`)
      //   await new Promise((r) => setTimeout(r, 700))
      //   log('> ✅ 201 Created — Post saved successfully (simulated)')
      //   await new Promise((r) => setTimeout(r, 300))

      //   const mockId = Math.floor(Math.random() * 9000) + 1000
      //   const mockUrl = `http://ai-content-editor.local/?p=${mockId}`
      //   publishedPostUrl.value = mockUrl
      //   log(`> 🔗 Post URL: ${mockUrl}`)
      //   document.value.status = 'published'
      //   return
      // }

      // // --- Real WordPress REST API ---
      // if (!settings.value.wordpressUrl || !settings.value.wordpressUsername || !settings.value.wordpressPassword) {
      //   log('> ❌ Missing WordPress credentials. Please check Settings.')
      //   document.value.status = 'error'
      //   return
      // }

      log(`> Connecting to ${endpoint}`)
      log(`> Authenticating as "${settings.value.wordpressUsername}"...`)

      const response = await axios.post(
        endpoint,
        {
          title,
          content,
          status
        },
        {
          // auth: {
          //   username: settings.value.wordpressUsername,
          //   password: settings.value.wordpressPassword
          // },
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json'
          }
        }
      )

      log(`> ✅ ${response.status} ${response.statusText} — Post saved successfully`)

      const postUrl: string = response.data?.link ?? response.data?.guid?.rendered ?? endpoint
      publishedPostUrl.value = postUrl
      log(`> 🔗 Post URL: ${postUrl}`)
      document.value.status = 'published'

    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Unknown error'
      const httpStatus = err?.response?.status ? `${err.response.status} ` : ''
      log(`> ❌ ${httpStatus}Error: ${message}`)
      document.value.status = 'error'
    }
  }

  function resetPublishState() {
    publishLog.value = ''
    publishedPostUrl.value = ''
    if (document.value.status === 'published' || document.value.status === 'error') {
      document.value.status = 'draft'
    }
  }

  return {
    document,
    isDirty,
    lastSavedAt,
    wordCount,
    hasTitle,
    selectionText,
    settings,
    aiHistory,
    activePrompt,
    activeResponse,
    aiStreamingStatus,
    aiActiveCommand,
    publishLog,
    publishedPostUrl,
    setEditorInstance,
    getEditorInstance,
    updateTitle,
    updateContent,
    updateSelection,
    saveSettings,
    streamAiSuggestion,
    applyAiSuggestion,
    publishToWordPress,
    resetPublishState
  }
})