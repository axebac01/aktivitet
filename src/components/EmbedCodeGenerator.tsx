
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { CodeIcon, Copy } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export const EmbedCodeGenerator: React.FC = () => {
  const [embedUrl, setEmbedUrl] = useState(window.location.origin);
  const [copied, setCopied] = useState(false);

  // Generate the different code snippets
  const iframeCode = `<iframe 
  src="${embedUrl}/embed" 
  width="100%" 
  height="600px" 
  frameborder="0"
  title="CRM Activity Stream">
</iframe>`;

  const scriptCode = `<div id="crm-activity-stream"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${embedUrl}/embed';
    iframe.width = '100%';
    iframe.height = '600px';
    iframe.frameBorder = '0';
    iframe.title = 'CRM Activity Stream';
    
    document.getElementById('crm-activity-stream').appendChild(iframe);
  })();
</script>`;

  const reactCode = `import React from 'react';

const CrmActivityStream = () => {
  return (
    <iframe 
      src="${embedUrl}/embed" 
      width="100%" 
      height="600px" 
      style={{ border: 'none' }}
      title="CRM Activity Stream"
    />
  );
};

export default CrmActivityStream;`;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast.success("Kod kopierad till urklipp!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bädda in aktivitetsflödet</CardTitle>
        <CardDescription>
          Kopiera koden nedan för att bädda in aktivitetsflödet i ditt CRM eller annan webbplats.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="text-sm font-medium">URL till denna tjänst</label>
          <div className="flex mt-1">
            <Input 
              value={embedUrl} 
              onChange={(e) => setEmbedUrl(e.target.value)}
              placeholder="https://your-activity-stream.example.com"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Detta är URL:en där din aktivitetsström är tillgänglig.
          </p>
        </div>

        <Tabs defaultValue="iframe">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="iframe">iFrame</TabsTrigger>
            <TabsTrigger value="script">Script</TabsTrigger>
            <TabsTrigger value="react">React</TabsTrigger>
          </TabsList>
          
          <TabsContent value="iframe" className="mt-0">
            <div className="relative">
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
                <code>{iframeCode}</code>
              </pre>
              <Button 
                variant="outline" 
                size="sm" 
                className="absolute top-2 right-2" 
                onClick={() => handleCopy(iframeCode)}
              >
                <Copy size={14} className="mr-1" />
                Kopiera
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="script" className="mt-0">
            <div className="relative">
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
                <code>{scriptCode}</code>
              </pre>
              <Button 
                variant="outline" 
                size="sm" 
                className="absolute top-2 right-2" 
                onClick={() => handleCopy(scriptCode)}
              >
                <Copy size={14} className="mr-1" />
                Kopiera
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="react" className="mt-0">
            <div className="relative">
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
                <code>{reactCode}</code>
              </pre>
              <Button 
                variant="outline" 
                size="sm" 
                className="absolute top-2 right-2" 
                onClick={() => handleCopy(reactCode)}
              >
                <Copy size={14} className="mr-1" />
                Kopiera
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          <CodeIcon size={16} className="inline-block mr-1" />
          För hjälp med implementationen, kontakta utvecklarteamet.
        </p>
      </CardFooter>
    </Card>
  );
};
