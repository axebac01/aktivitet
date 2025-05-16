
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";
import { Tabs, TabsContent } from "@/components/ui/tabs";

export function ChatPanel() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Tabs defaultValue="chat" className="h-full">
        <TabsContent value="chat" className="h-full flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <ChatMessageList />
          </div>
          <ChatInput />
        </TabsContent>
      </Tabs>
    </div>
  );
}
