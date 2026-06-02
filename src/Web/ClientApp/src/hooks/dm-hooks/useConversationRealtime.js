import { useEffect, useRef } from "react";
import { useSignalR } from "../common/useSignalR";
import queryClient from "../../configs/reactQuery";

/**
 * Handles all SignalR logic for DM:
 *
 * 1. Join conversation groups on mount / when conversations change.
 *    Uses joinedGroupsRef to skip already-joined groups, preventing
 *    redundant hub calls on every conversation-list refetch.
 *
 * 2. On automatic reconnect the server discards all group memberships.
 *    We listen for the `onreconnected` event, clear the ref, and rejoin
 *    every group that was tracked before the disconnect.
 *
 * 3. Listen to "ReceiveMessage" and update the React Query cache in real-time.
 */
const useConversationRealtime = (conversationIds, activeConversationId) => {
  const { on, invoke, onReconnected } = useSignalR();

  // Track already-joined group IDs so we only call JoinConversation once
  // per ID (not on every conversation-list refetch).
  const joinedGroupsRef = useRef(new Set());

  // Join any groups not yet joined
  useEffect(() => {
    const targetIds = new Set(conversationIds || []);
    if (activeConversationId) {
      targetIds.add(activeConversationId);
    }

    targetIds.forEach((id) => {
      if (!joinedGroupsRef.current.has(id)) {
        invoke("JoinConversation", id);
        joinedGroupsRef.current.add(id);
      }
    });
  }, [conversationIds, activeConversationId, invoke]);

  // After automatic reconnect the server clears all group memberships.
  // Clear our ref and rejoin every previously-tracked group.
  useEffect(() => {
    onReconnected(() => {
      const idsToRejoin = new Set(joinedGroupsRef.current);
      joinedGroupsRef.current.clear();

      idsToRejoin.forEach((id) => {
        invoke("JoinConversation", id);
        joinedGroupsRef.current.add(id);
      });
    });
  }, [onReconnected, invoke]);

  // Listen to incoming messages in real-time
  useEffect(() => {
    const unsubscribe = on("ReceiveMessage", (message) => {
      // Prepend to active conversation's cache immediately
      if (activeConversationId && activeConversationId === message.conversationId) {
        queryClient.setQueryData(["messages", activeConversationId], (old) => {
          if (!old) return old;

          const messageExists = old.pages.some((page) =>
            page.items?.some((item) => item.id === message.id)
          );
          if (messageExists) return old;

          const newPages = [...old.pages];
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              items: [message, ...(newPages[0].items || [])],
            };
          }
          return { ...old, pages: newPages };
        });
      }

      // Refresh conversation list (last message preview, unread count)
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });

    return () => {
      unsubscribe();
    };
  }, [on, activeConversationId]);
};

export default useConversationRealtime;
