# Chatroom Migration Plan (Web to Mobile)

- [x] Analyze web chatroom structure (page.tsx)
- [x] Analyze web chatroom structure ([chatroomId]/page.tsx)
- [x] Create `apps/mobile/CHATROOM_MIGRATION.md` to track progress
- [x] Identify shared components and hooks
- [x] Create mobile-specific component structure (SimpleChatHeader, TimeLeft, ChatMessages)
- [x] Migrate data fetching and realtime logic
- [x] Implement UI components using React Native (SimpleChatHeader, TimeLeft, ChatMessages, ChatInput)
- [x] Implement navigation
- [x] Migrate Chatrooms List Page
- [x] Add image and audio message support to ChatInput
- [x] Fully migrate ChatInput with hold state, bubble, discard, and UI/UX
- [x] Implement VoiceMessageBubble for mobile
- [x] Fix `VoiceMessageBubble.tsx` errors (install `@react-native-community/slider`, fix imports, fix `getFormattedTime`)
- [x] Update `ChatInput.tsx` to use `VoiceMessageBubble` and implement full voice recording UI/UX
- [ ] Verify functionality
