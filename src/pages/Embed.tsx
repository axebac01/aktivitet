
import React from 'react';
import { ActivityStream } from '@/components/ActivityStream';
import { MessageInput } from '@/components/MessageInput';
import { crmApi } from '@/services/crmApi';

const Embed = () => {
  return (
    <div className="h-full flex flex-col bg-white border rounded shadow-sm">
      <div className="flex-1 overflow-y-auto">
        <ActivityStream />
      </div>
      
      <MessageInput 
        disabled={!crmApi.getApiUrl()} 
      />
    </div>
  );
};

export default Embed;
