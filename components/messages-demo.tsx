"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export function MessagesDemo() {
  const { isAuthenticated, user } = useCurrentUser();
  const [message, setMessage] = useState("");
  const messages = useQuery(api.messages.list);
  const sendMessage = useMutation(api.messages.send);

  if (!isAuthenticated) {
    return null; // Don't show if not authenticated
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage({ body: message });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="bg-card/50 p-6 rounded-lg mt-6">
      <h3 className="text-lg font-semibold mb-4">Demo: User Messages</h3>
      <p className="text-sm text-muted-foreground mb-4">
        This demonstrates how your user data from Clerk is now stored in Convex
        and can be used in your application.
      </p>

      {/* Message form */}
      <form onSubmit={handleSendMessage} className="flex gap-2 mb-4">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" disabled={!message.trim()}>
          Send
        </Button>
      </form>

      {/* Messages list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {messages?.map((msg) => (
          <div key={msg._id} className="p-2 bg-background/50 rounded">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{msg.author}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(msg._creationTime).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm mt-1">{msg.body}</p>
          </div>
        )) ?? (
          <p className="text-muted-foreground text-sm">
            No messages yet. Send one!
          </p>
        )}
      </div>
    </div>
  );
}
