import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ auth, chats }) {
    // Data awal 'chats' sekarang sudah dalam urutan ASC dari backend
    const [messages, setMessages] = useState(chats || []);
    const scrollRef = useRef(null);
    const { data, setData, post, processing, reset, errors } = useForm({
        message: '',
    });

    // Menggulir ke bawah setiap kali pesan baru ditambahkan atau saat load awal
    useEffect(() => {
        if (scrollRef.current) {
            // Gunakan behavior smooth untuk scrolling yang lebih baik
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]); // Dipanggil ulang setiap kali 'messages' berubah

    // Berlangganan (subscribe) ke channel chat saat komponen dimuat
    useEffect(() => {
        if (window.Echo) {
            // PASTIKAN INI PRIVATE, BUKAN CHANNEL
            window.Echo.channel('chat')
                .listen('MessageSent', (e) => {
                    console.log('New message received');
                    setMessages((prevMessages) => [...prevMessages, e]);
                });
        }

        return () => {
            if (window.Echo) {
                window.Echo.leaveChannel('chat');
            }
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('chat.store'), {
            onSuccess: () => {
                // Reset input setelah sukses kirim
                reset('message');
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Chat Ruangan</h2>}
        >
            <Head title="Chat Ruangan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div
                                ref={scrollRef}
                                // Tambahkan sedikit tinggi agar chat terlihat lebih baik
                                className="chat-box h-[500px] overflow-y-auto mb-4 p-4 border rounded-lg bg-gray-50 flex flex-col space-y-3"
                            >
                                {/* Pesan akan ditampilkan secara berurutan dari atas ke bawah */}
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        // Tambahkan sedikit pemformatan untuk membedakan pesan sendiri vs orang lain
                                        className={`p-2 rounded-lg max-w-xs ${
                                            message.user_name === auth.user.name
                                            ? 'bg-blue-100 self-end text-right'
                                            : 'bg-green-100 self-start text-left'
                                        }`}
                                    >
                                        <div className="flex items-baseline justify-between mb-1">
                                            <span className="font-semibold text-xs text-gray-600">
                                                {message.user_name}
                                            </span>
                                            <span className="text-xs text-gray-500 ml-2">{message.created_at}</span>
                                        </div>
                                        <p className="text-gray-800">{message.message}</p>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={submit} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ketik pesan Anda..."
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    disabled={processing}
                                />
                                <button
                                    type="submit"
                                    disabled={processing || !data.message.trim()}
                                    className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
                                >
                                    Kirim
                                </button>
                            </form>
                            {errors.message && <div className="text-red-500 mt-2">{errors.message}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
