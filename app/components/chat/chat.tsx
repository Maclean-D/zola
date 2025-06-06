"use client"

import { ChatInput } from "@/app/components/chat-input/chat-input"
import { Conversation } from "@/app/components/chat/conversation"
import { useChatDraft } from "@/app/hooks/use-chat-draft"
import { useChatSession } from "@/app/providers/chat-session-provider"
import { useUser } from "@/app/providers/user-provider"
import { toast } from "@/components/ui/toast"
import { useAgent } from "@/lib/agent-store/provider"
import { getOrCreateGuestUserId } from "@/lib/api"
import { useChats } from "@/lib/chat-store/chats/provider"
import { useMessages } from "@/lib/chat-store/messages/provider"
import {
  MESSAGE_MAX_LENGTH,
  MODEL_DEFAULT,
  SYSTEM_PROMPT_DEFAULT,
} from "@/lib/config"
import { Attachment } from "@/lib/file-handling"
import { API_ROUTE_CHAT } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { useChat } from "@ai-sdk/react"
import { AnimatePresence, motion } from "motion/react"
import dynamic from "next/dynamic"
import { redirect, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { useChatHandlers } from "./use-chat-handlers"
import { useChatUtils } from "./use-chat-utils"
import { useFileUpload } from "./use-file-upload"
import { Calendar, Lightbulb } from "@phosphor-icons/react"

const FeedbackWidget = dynamic(
  () => import("./feedback-widget").then((mod) => mod.FeedbackWidget),
  { ssr: false }
)

const DialogAuth = dynamic(
  () => import("./dialog-auth").then((mod) => mod.DialogAuth),
  { ssr: false }
)

export function Chat() {
  const { chatId } = useChatSession()
  const {
    createNewChat,
    getChatById,
    updateChatModel,
    isLoading: isChatsLoading,
  } = useChats()
  const currentChat = chatId ? getChatById(chatId) : null
  const { messages: initialMessages, cacheAndAddMessage } = useMessages()
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasDialogAuth, setHasDialogAuth] = useState(false)
  const {
    files,
    setFiles,
    handleFileUploads,
    createOptimisticAttachments,
    cleanupOptimisticAttachments,
    handleFileUpload,
    handleFileRemove,
  } = useFileUpload()
  const [selectedModel, setSelectedModel] = useState(
    currentChat?.model || user?.preferred_model || MODEL_DEFAULT
  )
  const { currentAgent } = useAgent()
  const systemPrompt =
    currentAgent?.system_prompt || user?.system_prompt || SYSTEM_PROMPT_DEFAULT

  const [hydrated, setHydrated] = useState(false)
  const searchParams = useSearchParams()
  const hasSentFirstMessageRef = useRef(false)

  const isAuthenticated = !!user?.id

  const { draftValue, clearDraft } = useChatDraft(chatId)

  const {
    messages,
    input,
    handleSubmit,
    status,
    error,
    reload,
    stop,
    setMessages,
    setInput,
    append,
  } = useChat({
    api: API_ROUTE_CHAT,
    initialMessages,
    initialInput: draftValue,
    onFinish: async (message) => {
      // store the assistant message in the cache
      await cacheAndAddMessage(message)
    },
  })

  const { checkLimitsAndNotify, ensureChatExists } = useChatUtils({
    isAuthenticated,
    chatId,
    messages,
    input,
    selectedModel,
    systemPrompt,
    selectedAgentId: currentAgent?.id || null,
    createNewChat,
    setHasDialogAuth,
  })

  const { handleInputChange, handleModelChange, handleDelete, handleEdit } =
    useChatHandlers({
      messages,
      setMessages,
      setInput,
      setSelectedModel,
      selectedModel,
      chatId,
      updateChatModel,
      user,
    })

  // when chatId is null, set messages to an empty array
  useEffect(() => {
    if (chatId === null) {
      setMessages([])
    }
  }, [chatId])

  useEffect(() => {
    setHydrated(true)
  }, [])

  // handle errors
  useEffect(() => {
    if (error) {
      let errorMsg = "Something went wrong."
      try {
        const parsed = JSON.parse(error.message)
        errorMsg = parsed.error || errorMsg
      } catch {
        errorMsg = error.message || errorMsg
      }
      toast({
        title: errorMsg,
        status: "error",
      })
    }
  }, [error])

  useEffect(() => {
    const prompt = searchParams.get("prompt")
    if (prompt) {
      setInput(prompt)
    }
  }, [searchParams])

  const submit = async () => {
    setIsSubmitting(true)

    const uid = await getOrCreateGuestUserId(user)
    if (!uid) return

    const optimisticId = `optimistic-${Date.now().toString()}`
    const optimisticAttachments =
      files.length > 0 ? createOptimisticAttachments(files) : []

    const optimisticMessage = {
      id: optimisticId,
      content: input,
      role: "user" as const,
      createdAt: new Date(),
      experimental_attachments:
        optimisticAttachments.length > 0 ? optimisticAttachments : undefined,
    }

    setMessages((prev) => [...prev, optimisticMessage])
    setInput("")

    const submittedFiles = [...files]
    setFiles([])

    const allowed = await checkLimitsAndNotify(uid)
    if (!allowed) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      setIsSubmitting(false)
      return
    }

    const currentChatId = await ensureChatExists(uid)
    if (!currentChatId) {
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      setIsSubmitting(false)
      return
    }

    if (input.length > MESSAGE_MAX_LENGTH) {
      toast({
        title: `The message you submitted was too long, please submit something shorter. (Max ${MESSAGE_MAX_LENGTH} characters)`,
        status: "error",
      })
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      setIsSubmitting(false)
      return
    }

    let attachments: Attachment[] | null = []
    if (submittedFiles.length > 0) {
      attachments = await handleFileUploads(uid, currentChatId)
      if (attachments === null) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
        cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
        setIsSubmitting(false)
        return
      }
    }

    const options = {
      body: {
        chatId: currentChatId,
        userId: uid,
        model: selectedModel,
        isAuthenticated,
        systemPrompt: systemPrompt || SYSTEM_PROMPT_DEFAULT,
        ...(currentAgent?.id && { agentId: currentAgent.id }),
      },
      experimental_attachments: attachments || undefined,
    }

    try {
      handleSubmit(undefined, options)
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      cacheAndAddMessage(optimisticMessage)
      clearDraft()
      hasSentFirstMessageRef.current = true
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      toast({ title: "Failed to send message", status: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuggestion = useCallback(
    async (suggestion: string) => {
      setIsSubmitting(true)
      const optimisticId = `optimistic-${Date.now().toString()}`
      const optimisticMessage = {
        id: optimisticId,
        content: suggestion,
        role: "user" as const,
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, optimisticMessage])

      const uid = await getOrCreateGuestUserId(user)

      if (!uid) {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
        setIsSubmitting(false)
        return
      }

      const allowed = await checkLimitsAndNotify(uid)
      if (!allowed) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
        setIsSubmitting(false)
        return
      }

      const currentChatId = await ensureChatExists(uid)

      if (!currentChatId) {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
        setIsSubmitting(false)
        return
      }

      const options = {
        body: {
          chatId: currentChatId,
          userId: uid,
          model: selectedModel,
          isAuthenticated,
          systemPrompt: SYSTEM_PROMPT_DEFAULT,
        },
      }

      append(
        {
          role: "user",
          content: suggestion,
        },
        options
      )
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      setIsSubmitting(false)
    },
    [ensureChatExists, selectedModel, user?.id, append]
  )

  const handleReload = async () => {
    const uid = await getOrCreateGuestUserId(user)
    if (!uid) {
      return
    }

    const options = {
      body: {
        chatId,
        userId: uid,
        model: selectedModel,
        isAuthenticated,
        systemPrompt: systemPrompt || SYSTEM_PROMPT_DEFAULT,
      },
    }

    reload(options)
  }

  // not user chatId and no messages
  if (hydrated && chatId && !isChatsLoading && !currentChat) {
    return redirect("/")
  }

  return (
    <div
      className={cn(
        "@container/main relative flex h-full flex-col items-center justify-end md:justify-center"
      )}
      style={{
        backgroundImage: "linear-gradient(0deg, #fff 6.97%, #fff0 63.02%), linear-gradient(265deg, #ffffffcf 1.13%, #fff0 29.1%), linear-gradient(270deg, #e4fffc40 6.18%, #c1cfff26 62.33%, #cf26de0d 116.18%)"
      }}
    >
      <DialogAuth open={hasDialogAuth} setOpen={setHasDialogAuth} />
      <AnimatePresence initial={false} mode="popLayout">
        {!chatId && messages.length === 0 ? (
          <motion.div
            key="onboarding"
            className="flex h-full flex-col items-center justify-center px-4 pb-0 pt-20 md:relative md:bottom-auto md:h-auto md:pb-0 md:pt-0 md:max-w-[50rem] md:mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            layout="position"
            layoutId="onboarding"
            transition={{
              layout: {
                duration: 0,
              },
            }}
          >
            <h1 className="mb-6 text-3xl font-medium tracking-tight text-center">
              Ask about anything you've said or heard
            </h1>
            
            <div className="w-full flex flex-col md:flex-row md:justify-center md:space-x-4 space-y-4 md:space-y-0 md:mb-12">
              <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center md:w-60">
                <div className="flex items-center gap-3">
                  <div className="text-gray-700">
                    <Calendar size={20} weight="bold" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Yesterday's Summary</h2>
                    <p className="text-gray-500 text-sm">Tap to review your day</p>
                  </div>
                </div>
                <div className="text-xl text-gray-400">›</div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center md:w-60">
                <div className="flex items-center gap-3">
                  <div className="text-gray-700">
                    <Lightbulb size={20} weight="bold" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Ways to Improve</h2>
                    <p className="text-gray-500 text-sm">Tap for suggestions</p>
                  </div>
                </div>
                <div className="text-xl text-gray-400">›</div>
              </div>
            </div>
          </motion.div>
        ) : (
          <Conversation
            key="conversation"
            messages={messages}
            status={status}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onReload={handleReload}
          />
        )}
      </AnimatePresence>
      <motion.div
        className={cn(
          "relative inset-x-0 bottom-0 z-50 mx-auto w-full max-w-3xl"
        )}
        layout="position"
        layoutId="chat-input-container"
        transition={{
          layout: {
            duration: messages.length === 1 ? 0.3 : 0,
          },
        }}
      >
        <ChatInput
          value={input}
          onSuggestion={handleSuggestion}
          onValueChange={handleInputChange}
          onSend={submit}
          isSubmitting={isSubmitting}
          files={files}
          onFileUpload={handleFileUpload}
          onFileRemove={handleFileRemove}
          hasSuggestions={!chatId && messages.length === 0}
          onSelectModel={handleModelChange}
          selectedModel={selectedModel}
          isUserAuthenticated={isAuthenticated}
          stop={stop}
          status={status}
        />
      </motion.div>

      <FeedbackWidget authUserId={user?.id} />
    </div>
  )
}
