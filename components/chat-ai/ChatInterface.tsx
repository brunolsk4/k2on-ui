"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Share, ThumbsUp, ThumbsDown, Send, Paperclip, Mic } from "lucide-react";
import type { Message } from "./types";
import { AiMessageBubble } from "./AiMessageBubble";
import { AiTypingIndicator } from "./AiTypingIndicator";

interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function ChatInterface({ messages, input, handleInputChange, handleSubmit, isLoading }: ChatInterfaceProps) {
  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col gap-6 justify-end min-h-full w-full max-w-6xl">
          {messages.map((message) => {
            const content = message.content;
            const text = typeof content === "string" ? content : content?.text || JSON.stringify(content);
            const dataBlocks = typeof content === "object" && content?.data_blocks ? content.data_blocks : [];
            const toolsUsed = typeof content === "object" && content?.tools_used ? content.tools_used : [];
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                className={
                  "flex w-full items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 " +
                  (isUser ? "flex-row-reverse justify-end" : "flex-row justify-start")
                }
              >
                {isUser ? (
                  <>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback>EU</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 max-w-[80%] flex justify-end text-right">
                      <div className="bg-primary text-primary-foreground rounded-lg p-4 shadow-sm text-left">
                        <p className="whitespace-pre-wrap">{text}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-blue-500">AI</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 max-w-[80%] text-left">
                      <AiMessageBubble>
                        <p className="whitespace-pre-wrap mb-3">{text}</p>

                        {dataBlocks.map((block: any, idx: number) => {
                          if (block.type === "table") {
                            return (
                              <div key={idx} className="overflow-x-auto text-sm mb-2">
                                {block.title && <div className="font-medium mb-1">{block.title}</div>}
                                <table className="w-full border text-left text-xs">
                                  <thead>
                                    <tr>
                                      {(block.columns || []).map((col: string) => (
                                        <th key={col} className="border px-2 py-1 bg-muted text-muted-foreground">{col}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(block.rows || []).map((row: any, rIdx: number) => (
                                      <tr key={rIdx}>
                                        {(block.columns || []).map((col: string) => (
                                          <td key={col} className="border px-2 py-1">{row[col]}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          }
                          if (block.type === "list") {
                            return (
                              <div key={idx} className="text-sm mb-2">
                                {block.title && <div className="font-medium mb-1">{block.title}</div>}
                                <ul className="list-disc pl-4 space-y-1">
                                  {(block.items || []).map((item: any, iIdx: number) => (
                                    <li key={iIdx}>{typeof item === "string" ? item : JSON.stringify(item)}</li>
                                  ))}
                                </ul>
                              </div>
                            );
                          }
                          return null;
                        })}

                        {toolsUsed.length > 0 && (
                          <div className="text-[11px] text-muted-foreground">Tools usadas: {toolsUsed.join(", ")}</div>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Share className="h-4 w-4" />
                          </Button>
                          <div className="ml-auto flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </AiMessageBubble>
                    </div>
                  </>
                )}
              </div>
            );
          })}
          {isLoading && (
            <div className="flex gap-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-500">AI</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <AiTypingIndicator />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t p-6">
        <div className="w-full max-w-4xl">
          <form onSubmit={handleSubmit} className="relative">
            <div className="bg-muted flex items-center gap-2 rounded-lg border p-2">
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Faça sua pergunta..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isLoading}
              />
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Mic className="h-4 w-4" />
              </Button>
              <Button type="submit" size="sm" disabled={!input.trim() || isLoading} className="h-8 w-8 p-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
