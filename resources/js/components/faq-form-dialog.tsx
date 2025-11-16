// resources/js/components/faq-form-dialog.tsx

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { type FAQ } from '@/types';
import { X } from 'lucide-react';

interface FAQFormDialogProps {
    faq: FAQ;
    onClose: () => void;
}

export function FAQFormDialog({ faq, onClose }: FAQFormDialogProps) {
    const isEditing = faq.id !== 0;
    const [keywordInput, setKeywordInput] = useState('');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        question: faq.question,
        answer: faq.answer,
        keywords: faq.keywords || [],
        is_active: faq.is_active,
        order: faq.order,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(`/faqs/${faq.id}`, {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post('/faqs', {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    const addKeyword = () => {
        const keyword = keywordInput.trim();
        if (keyword && !data.keywords.includes(keyword)) {
            setData('keywords', [...data.keywords, keyword]);
            setKeywordInput('');
        }
    };

    const removeKeyword = (keyword: string) => {
        setData('keywords', data.keywords.filter(k => k !== keyword));
    };

    const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addKeyword();
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit FAQ' : 'New FAQ'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="question" className="text-sm cursor-text select-text">
                            Question
                        </Label>
                        <Input
                            id="question"
                            value={data.question}
                            onChange={(e) => setData('question', e.target.value)}
                            className="h-9"
                            placeholder="..."
                        />
                        {errors.question && <p className="text-xs text-destructive">{errors.question}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="answer" className="text-sm cursor-text select-text">
                            Answer
                        </Label>
                        <Textarea
                            id="answer"
                            value={data.answer}
                            onChange={(e) => setData('answer', e.target.value)}
                            rows={4}
                            className="resize-none"
                            placeholder="..."
                        />
                        {errors.answer && <p className="text-xs text-destructive">{errors.answer}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="keywords" className="text-sm cursor-text select-text">
                            Keywords
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="keywords"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyPress={handleKeywordKeyPress}
                                className="h-9"
                                placeholder="room, rates, price (press Enter)"
                            />
                            <Button type="button" onClick={addKeyword} size="sm" variant="outline">
                                Add
                            </Button>
                        </div>
                        {data.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {data.keywords.map((keyword, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                        {keyword}
                                        <button
                                            type="button"
                                            onClick={() => removeKeyword(keyword)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                        {errors.keywords && <p className="text-xs text-destructive">{errors.keywords}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="order" className="text-sm cursor-text select-text">
                            Display Order
                        </Label>
                        <Input
                            id="order"
                            type="number"
                            value={data.order}
                            onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                            className="h-9"
                            min="0"
                        />
                        {errors.order && <p className="text-xs text-destructive">{errors.order}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) => setData('is_active', checked)}
                        />
                        <Label htmlFor="is_active" className="text-sm cursor-pointer select-text">
                            Active
                        </Label>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button type="submit" disabled={processing} size="sm">
                            {isEditing ? 'Update FAQ' : 'Create FAQ'}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
