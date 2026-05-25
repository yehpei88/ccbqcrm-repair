import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Phone, CheckCircle, Clock, XCircle, PhoneOff, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Minsu, CallResult } from '@/lib/data';
import { CALL_RESULT_CONFIG } from '@/lib/data';

const RESULT_ICONS: Record<CallResult, React.ReactNode> = {
  'agreed': <CheckCircle size={16} className="text-green-500" />,
  'hesitating': <Clock size={16} className="text-yellow-500" />,
  'rejected': <XCircle size={16} className="text-red-500" />,
  'invalid': <PhoneOff size={16} className="text-gray-400" />,
  'closed': <Store size={16} className="text-gray-400" />,
  'missed': <PhoneOff size={16} className="text-gray-500" />,
};

const FEEDBACK_OPTIONS = [
  { value: 'follow-up-7days', label: '7 天後追蹤' },
  { value: 'follow-up-14days', label: '14 天後追蹤' },
  { value: 'follow-up-30days', label: '30 天後追蹤' },
  { value: 'no-follow-up', label: '無需追蹤' },
];

const QUICK_TAGS = [
  '老闆不在',
  '下週再聯絡',
  '已加 LINE',
  '需要報價',
  '有興趣',
  '暫不考慮',
  '轉接其他部門',
  '已簽約',
];

interface ContactCompleteDialogProps {
  open: boolean;
  minsu: Minsu | null;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    callResult: CallResult;
    feedbackStatus: string;
    lineId: string;
    quickTags: string[];
    note: string;
  }) => void;
}

export function ContactCompleteDialog({
  open,
  minsu,
  onOpenChange,
  onSave,
}: ContactCompleteDialogProps) {
  const [step, setStep] = useState(1);
  const [callResult, setCallResult] = useState<CallResult | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<string>('');
  const [needsLine, setNeedsLine] = useState(false);
  const [lineId, setLineId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const handleReset = () => {
    setStep(1);
    setCallResult(null);
    setFeedbackStatus('');
    setNeedsLine(false);
    setLineId('');
    setSelectedTags([]);
    setNote('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleReset();
    }
    onOpenChange(newOpen);
  };

  const handleSave = () => {
    // 驗證必填欄位
    if (!callResult) {
      toast.error('請選擇通話結果');
      return;
    }
    if (needsLine && !lineId.trim()) {
      toast.error('請輸入 LINE ID');
      return;
    }

    onSave({
      callResult,
      feedbackStatus,
      lineId: needsLine ? lineId : '',
      quickTags: selectedTags,
      note,
    });

    handleReset();
    onOpenChange(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone size={18} className="text-blue-500" />
            聯繫完成 — {minsu?.name}
          </DialogTitle>
        </DialogHeader>

        {minsu && (
          <div className="space-y-6">
            {/* 進度指示 */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className="flex items-center gap-1">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                      step >= s
                        ? 'bg-blue-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {s}
                  </div>
                  {s < 4 && <div className="w-4 h-0.5 bg-muted" />}
                </div>
              ))}
            </div>

            {/* 民宿資訊 */}
            <div className="bg-muted/30 rounded-lg p-3 text-sm">
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>📍 {minsu.area}</div>
                <div>📞 {minsu.phone}</div>
                <div>🎯 AI 評分：{minsu.aiScore}/50</div>
                <div>🏠 {minsu.isPackage ? '包棟' : '一般'} · {minsu.hasRainShelter ? '有雨棚' : '無雨棚'}</div>
              </div>
            </div>

            {/* Step 1-2: 通話結果選擇 */}
            {step >= 1 && (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-foreground">
                  Step 1-2：通話結果 *
                </div>
                <div className="space-y-2">
                  {(Object.keys(CALL_RESULT_CONFIG) as CallResult[]).map(result => (
                    <button
                      key={result}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium w-full',
                        callResult === result
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-border hover:border-blue-300 hover:bg-muted/30'
                      )}
                      onClick={() => setCallResult(result)}
                    >
                      {RESULT_ICONS[result]}
                      <span>{CALL_RESULT_CONFIG[result].label}</span>
                    </button>
                  ))}
                </div>

                {/* 自動化說明 */}
                {callResult === 'agreed' && (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100 text-sm text-green-700">
                    <div className="font-semibold mb-1">🎉 自動化流程將觸發</div>
                    <div className="text-xs space-y-0.5">
                      <div>✓ 自動發送 LINE 好友邀請</div>
                      <div>✓ 自動推送歡迎訊息與數位菜單</div>
                      <div>✓ 進入 AI 意向追蹤流程</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: 回訪狀態 */}
            {step >= 2 && callResult && (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-foreground">
                  Step 3：回訪狀態
                </div>
                <div className="space-y-2">
                  {FEEDBACK_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium w-full',
                        feedbackStatus === option.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-border hover:border-purple-300 hover:bg-muted/30'
                      )}
                      onClick={() => setFeedbackStatus(option.value)}
                    >
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full border-2',
                          feedbackStatus === option.value
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-border'
                        )}
                      />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: LINE ID 輸入 */}
            {step >= 3 && callResult && (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-foreground">
                  Step 4：LINE ID 輸入
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="needs-line"
                    checked={needsLine}
                    onCheckedChange={(checked) => setNeedsLine(checked as boolean)}
                  />
                  <Label htmlFor="needs-line" className="text-sm cursor-pointer">
                    ☑️ 對方答應加 LINE
                  </Label>
                </div>
                {needsLine && (
                  <Input
                    placeholder="請輸入對方的 LINE ID"
                    className="text-sm"
                    value={lineId}
                    onChange={e => setLineId(e.target.value)}
                  />
                )}
              </div>
            )}

            {/* Step 5: 快速標籤 + 備注 */}
            {step >= 4 && callResult && (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-foreground mb-2">
                    Step 5：快速標籤（可多選）
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_TAGS.map(tag => (
                      <button
                        key={tag}
                        className={cn(
                          'px-3 py-2 rounded-lg border-2 transition-all text-xs font-medium',
                          selectedTags.includes(tag)
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-border hover:border-orange-300 hover:bg-muted/30'
                        )}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-foreground mb-1.5">
                    備注（選填）
                  </div>
                  <Textarea
                    placeholder="輸入通話備注，例如：對方說下週再聯絡、老闆不在..."
                    className="text-sm resize-none"
                    rows={3}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex gap-2 justify-between">
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                上一步
              </Button>
            )}
            {step < 4 && callResult && (
              <Button size="sm" onClick={() => setStep(step + 1)}>
                下一步
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
              取消
            </Button>
            {step === 4 && (
              <Button size="sm" onClick={handleSave} disabled={!callResult}>
                完成聯繫
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
