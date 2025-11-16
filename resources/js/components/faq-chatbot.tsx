// resources/js/components/faq-chatbot.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send, ThumbsUp, ThumbsDown, Loader2, UserCircle } from 'lucide-react';
import { type FAQ } from '@/types';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';
import { type SharedData } from '@/types';

interface ChatMessage {
    type: 'user' | 'bot';
    content: string;
    faqs?: FAQ[];
    searchId?: number;
}

export function FAQChatbot() {
    const { auth } = usePage<SharedData>().props;
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            type: 'bot',
            content: 'Hi! How can I help you today? Ask me anything about our resort, rates, or accommodations.',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await axios.post('/faq/search', { query: userMessage });
            const { faqs, search_id } = response.data;

            if (faqs.length > 0) {
                setMessages(prev => [
                    ...prev,
                    {
                        type: 'bot',
                        content: `I found ${faqs.length} answer${faqs.length > 1 ? 's' : ''} for you:`,
                        faqs,
                        searchId: search_id,
                    },
                ]);
            } else {
                setMessages(prev => [
                    ...prev,
                    {
                        type: 'bot',
                        content: "I couldn't find an answer to that question. Would you like to talk to our staff directly?",
                        searchId: search_id,
                    },
                ]);
            }
        } catch (error) {
            setMessages(prev => [
                ...prev,
                {
                    type: 'bot',
                    content: 'Sorry, something went wrong. Please try again.',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFeedback = async (searchId: number, wasHelpful: boolean) => {
        try {
            await axios.post(`/faq-search/${searchId}/feedback`, { was_helpful: wasHelpful });
            toast.success(wasHelpful ? 'Thanks for your feedback!' : 'Thanks! We\'ll improve this answer.');
        } catch (error) {
            toast.error('Failed to submit feedback');
        }
    };

    const handleTalkToStaff = () => {
        setIsOpen(false);
        if (auth.user) {
            router.visit('/chat');
        } else {
            router.visit('/login');
        }
    };

    return (
        <>
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    size="lg"
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-[#E55A2B] hover:bg-[#D14D24]"
                >
                    <MessageCircle className="h-6 w-6" />
                </Button>
            )}

            {isOpen && (
                <Card className="fixed bottom-6 right-6 w-[90vw] sm:w-96 h-[600px] shadow-2xl z-50 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
                        <CardTitle className="text-lg font-semibold">Need Help?</CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-lg p-3 ${
                                        message.type === 'user'
                                            ? 'bg-[#E55A2B] text-white'
                                            : 'bg-gray-100 text-gray-900'
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                                    {message.faqs && message.faqs.length > 0 && (
                                        <div className="mt-3 space-y-3">
                                            {message.faqs.map((faq) => (
                                                <div
                                                    key={faq.id}
                                                    className="bg-white rounded-lg p-3 border border-gray-200"
                                                >
                                                    <p className="font-semibold text-sm text-gray-900 mb-2">
                                                        {faq.question}
                                                    </p>
                                                    <p className="text-xs text-gray-600">{faq.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {message.searchId && message.type === 'bot' && (
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs"
                                                onClick={() => handleFeedback(message.searchId!, true)}
                                            >
                                                <ThumbsUp className="h-3 w-3 mr-1" />
                                                Helpful
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs"
                                                onClick={() => handleFeedback(message.searchId!, false)}
                                            >
                                                <ThumbsDown className="h-3 w-3 mr-1" />
                                                Not Helpful
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 rounded-lg p-3">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            </div>
                        )}
                    </CardContent>

                    <div className="p-4 border-t space-y-2">
                        {auth.user && (
                            <Button
                                onClick={handleTalkToStaff}
                                variant="outline"
                                size="sm"
                                className="w-full border-[#E55A2B] text-[#E55A2B] hover:bg-[#E55A2B] hover:text-white"
                            >
                                <UserCircle className="h-4 w-4 mr-2" />
                                Talk to Staff
                            </Button>
                        )}
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </Card>
            )}
        </>
    );
}
