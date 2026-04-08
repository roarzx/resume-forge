"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Copy, Link2, Loader2, Trash2, Eye, EyeOff } from "lucide-react";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string;
  initialShareToken?: string | null;
  initialHasPassword?: boolean;
}

export function ShareDialog({
  open,
  onOpenChange,
  resumeId,
  initialShareToken,
  initialHasPassword,
}: ShareDialogProps) {
  const { toast } = useToast();

  const [isSharing, setIsSharing] = useState(false);
  const [shareEnabled, setShareEnabled] = useState(!!initialShareToken);
  const [usePassword, setUsePassword] = useState(!!initialHasPassword);
  const [password, setPassword] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(
    initialShareToken ? `${typeof window !== "undefined" ? window.location.origin : ""}/shared/${initialShareToken}` : null
  );
  const [copied, setCopied] = useState(false);

  const handleToggleShare = async (enabled: boolean) => {
    setIsSharing(true);
    try {
      if (!enabled && shareUrl) {
        // 取消分享
        await fetch(`/api/resumes/${resumeId}/share`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enable: false }),
        });
        setShareUrl(null);
        setShareEnabled(false);
        toast({ title: "已关闭分享链接" });
        return;
      }

      const response = await fetch(`/api/resumes/${resumeId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enable: true,
          password: usePassword ? password : undefined,
        }),
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      // 前端动态拼接，避免硬编码域名
      const origin = window.location.origin;
      setShareUrl(`${origin}/shared/${data.shareToken}`);
      setShareEnabled(true);
      toast({ title: "分享链接已生成" });
    } catch {
      toast({ title: "操作失败", variant: "destructive" });
    } finally {
      setIsSharing(false);
    }
  };

  const handleUpdatePassword = async () => {
    setIsSharing(true);
    try {
      const response = await fetch(`/api/resumes/${resumeId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enable: true,
          password: usePassword ? password : undefined,
        }),
      });

      if (!response.ok) throw new Error();
      toast({ title: usePassword ? "密码已设置" : "密码已移除" });
    } catch {
      toast({ title: "操作失败", variant: "destructive" });
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: "链接已复制到剪贴板" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            分享简历
          </DialogTitle>
          <DialogDescription>
            生成公开链接，无需登录即可查看简历
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* 开启/关闭分享 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{shareEnabled ? "分享已开启" : "分享已关闭"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {shareEnabled ? "他人可通过链接查看你的简历" : "关闭后链接将失效"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={shareEnabled ? "destructive" : "default"}
                onClick={() => handleToggleShare(!shareEnabled)}
                disabled={isSharing}
              >
                {isSharing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : shareEnabled ? (
                  <EyeOff className="h-4 w-4 mr-1" />
                ) : (
                  <Eye className="h-4 w-4 mr-1" />
                )}
                {shareEnabled ? "关闭" : "开启"}
              </Button>
            </div>
          </div>

          {/* 分享链接 */}
          {shareEnabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="share-url">分享链接</Label>
                <div className="flex gap-2">
                  <Input
                    id="share-url"
                    value={shareUrl || ""}
                    readOnly
                    className="text-sm"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button onClick={copyToClipboard} variant="outline" disabled={copied}>
                    {copied ? "已复制" : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  直接复制链接发送给 HR 或朋友
                </p>
              </div>

              {/* 密码保护 */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">密码保护</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      设置访问密码，查看者需输入密码才能看到简历
                    </p>
                  </div>
                  <Switch
                    checked={usePassword}
                    onCheckedChange={(checked) => {
                      setUsePassword(checked);
                      if (!checked) {
                        handleUpdatePassword();
                      }
                    }}
                  />
                </div>

                {usePassword && (
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="设置访问密码（可选）"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      size="sm"
                      onClick={handleUpdatePassword}
                      disabled={isSharing}
                    >
                      {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : "保存"}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            完成
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
