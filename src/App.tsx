import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  Home, 
  Search, 
  PlusSquare, 
  Heart, 
  User, 
  MessageCircle, 
  Play, 
  Send, 
  MoreHorizontal, 
  Bookmark, 
  Camera, 
  Video,
  X,
  Settings,
  Grid,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Smile,
  Hash,
  Radio,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface UserData {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
}

interface Post {
  id: string;
  userId: string;
  type: 'post' | 'reel';
  content: string;
  media: string;
  likes: number;
  comments: any[];
  createdAt: string;
}

// --- Mock Auth ---
const CURRENT_USER_ID = "user-1"; // Simulation

// --- Global Context/State ---
const API_URL = "";

// --- Components ---

const Navbar = () => {
    const location = useLocation();
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const navItems = [
        { label: 'Home', icon: Home, path: '/' },
        { label: 'Search', icon: Search, path: '/explore' },
        { label: 'Reels', icon: Play, path: '/reels' },
        { label: 'Messages', icon: MessageCircle, path: '/messages' },
        { label: 'Live', icon: Radio, path: '/live' },
        { label: 'Profile', icon: User, path: `/profile/${CURRENT_USER_ID}` },
    ];

    if (isMobile) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center z-50">
                {navItems.map((item) => (
                    <Link key={item.path} to={item.path} className={cn(
                        "p-2 rounded-lg transition-colors",
                        location.pathname === item.path ? "text-black" : "text-gray-400"
                    )}>
                        <item.icon size={26} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
                    </Link>
                ))}
            </div>
        );
    }

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 p-4 flex flex-col hidden md:flex">
            <h1 className="text-2xl font-bold font-serif mb-10 px-2 italic">Besta</h1>
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <Link 
                        key={item.path} 
                        to={item.path} 
                        className={cn(
                            "flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-gray-50",
                            location.pathname === item.path ? "bg-gray-100 font-bold" : "text-gray-700"
                        )}
                    >
                        <item.icon size={24} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
                        <span className="text-lg">{item.label}</span>
                    </Link>
                ))}
            </nav>
            <div className="mt-auto">
                 <button className="flex items-center gap-4 p-3 w-full rounded-xl hover:bg-gray-50 transition-all text-gray-700">
                    <MoreHorizontal size={24} />
                    <span className="text-lg">More</span>
                </button>
            </div>
        </aside>
    );
};

const PostItem = ({ post, author }: any) => {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes);

    const handleLike = () => {
        setLiked(!liked);
        setLikesCount(prev => liked ? prev - 1 : prev + 1);
        // Sync with API would go here
    };

    return (
        <div className="bg-white border-b border-gray-100 md:border md:border-gray-200 md:rounded-xl mb-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                    <img 
                        src={author?.avatar || 'https://via.placeholder.com/150'} 
                        className="w-10 h-10 rounded-full border border-gray-100 object-cover"
                        alt={author?.username}
                    />
                    <div className="flex flex-col">
                        <span className="font-bold text-sm leading-tight">{author?.username}</span>
                        <span className="text-gray-500 text-xs">Original Audio</span>
                    </div>
                </div>
                <button className="p-1 hover:bg-gray-50 rounded-full">
                    <MoreHorizontal size={18} />
                </button>
            </div>

            {/* Media */}
            <div className="aspect-square bg-gray-50 relative group">
                <img 
                    src={post.media} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>

            {/* Actions */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                        <motion.button 
                            whileTap={{ scale: 1.2 }}
                            onClick={handleLike}
                        >
                            <Heart size={26} className={liked ? "fill-red-500 text-red-500" : "text-black"} />
                        </motion.button>
                        <button><MessageCircle size={26} /></button>
                        <button><Send size={26} /></button>
                    </div>
                    <button><Bookmark size={26} /></button>
                </div>

                <div className="font-bold text-sm mb-1">{likesCount.toLocaleString()} likes</div>
                <div className="text-sm">
                    <span className="font-bold mr-2">{author?.username}</span>
                    {post.content}
                </div>
                <div className="text-gray-500 text-xs mt-2 uppercase tracking-tight">
                    {formatDistanceToNow(new Date(post.createdAt))} ago
                </div>
            </div>
        </div>
    );
};

const ReelItem = ({ post, author }: any) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);

    return (
        <div className="relative h-screen w-full md:h-[800px] md:w-[450px] md:rounded-3xl overflow-hidden bg-black flex flex-col snap-start">
            <video 
                ref={videoRef}
                src={post.media} 
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted={isMuted}
                playsInline
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Reel UI */}
            <div className="absolute bottom-10 left-0 right-0 p-4 flex items-end justify-between text-white">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <img src={author?.avatar} className="w-9 h-9 rounded-full border border-white/20" />
                        <span className="font-bold text-sm">{author?.username}</span>
                        <button className="px-3 py-1 bg-transparent border border-white rounded-lg text-xs font-bold hover:bg-white/10 transition-colors">Follow</button>
                    </div>
                    <p className="text-sm line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-2 mt-3 overflow-hidden">
                        <Play size={14} fill="currentColor" />
                        <div className="text-xs marquee-container w-full whitespace-nowrap">
                            Original Audio - {author?.name}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6 items-center">
                    <div className="flex flex-col items-center gap-1">
                        <button className="p-2 bg-black/20 backdrop-blur-md rounded-full"><Heart size={28} /></button>
                        <span className="text-xs font-medium">{post.likes}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <button className="p-2 bg-black/20 backdrop-blur-md rounded-full"><MessageCircle size={28} /></button>
                        <span className="text-xs font-medium">42</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <button className="p-2 bg-black/20 backdrop-blur-md rounded-full"><Send size={28} /></button>
                    </div>
                    <button className="p-2 bg-black/20 backdrop-blur-md rounded-full"><MoreHorizontal size={24} /></button>
                </div>
            </div>
        </div>
    );
};

// --- Pages ---

const Feed = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [feedRes, usersRes] = await Promise.all([
                    fetch('/api/feed'),
                    fetch('/api/users')
                ]);
                setPosts(await feedRes.json());
                setUsers(await usersRes.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading Besta...</div>;

    const normalPosts = posts.filter(p => p.type === 'post');

    return (
        <div className="max-w-2xl mx-auto pt-2 md:pt-8 pb-20 px-0 md:px-4">
            {/* Stories Placeholder */}
            <div className="flex gap-4 overflow-x-auto pb-6 mb-6 px-4 md:px-0 scrollbar-hide">
                {users.map(user => (
                    <div key={user.id} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer group">
                        <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 group-hover:scale-105 transition-transform">
                            <div className="p-0.5 rounded-full bg-white">
                                <img src={user.avatar} className="w-14 h-14 rounded-full object-cover" />
                            </div>
                        </div>
                        <span className="text-xs text-gray-700 w-16 text-center truncate">{user.username}</span>
                    </div>
                ))}
            </div>

            {/* Feed */}
            <div>
                {normalPosts.map(post => (
                    <PostItem 
                        key={post.id} 
                        post={post} 
                        author={users.find(u => u.id === post.userId)} 
                    />
                ))}
            </div>
        </div>
    );
};

const Reels = () => {
    const [reels, setReels] = useState<Post[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);

    useEffect(() => {
        fetch('/api/feed').then(res => res.json()).then(data => {
            setReels(data.filter((p: any) => p.type === 'reel'));
        });
        fetch('/api/users').then(res => res.json()).then(setUsers);
    }, []);

    return (
        <div className="h-screen w-full flex flex-col items-center bg-black md:bg-gray-100 md:py-8 overflow-y-scroll snap-y snap-mandatory pb-24 md:pb-0">
            {reels.map(reel => (
                <div key={reel.id} className="mb-8 snap-start">
                    <ReelItem post={reel} author={users.find(u => u.id === reel.userId)} />
                </div>
            ))}
        </div>
    );
};

const Profile = () => {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<UserData | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        const userId = id || CURRENT_USER_ID;
        fetch(`/api/users/${userId}`).then(res => res.json()).then(setUser);
        fetch('/api/feed').then(res => res.json()).then(data => {
            setPosts(data.filter((p: any) => p.userId === userId));
        });
    }, [id]);

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 pb-24">
            <header className="flex flex-col md:flex-row gap-8 items-start mb-12">
                <div className="w-24 h-24 md:w-40 md:h-40 rounded-full border border-gray-100 overflow-hidden shrink-0 mx-auto md:mx-0">
                    <img src={user.avatar} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <h2 className="text-xl font-light">{user.username}</h2>
                        <div className="flex gap-2">
                             <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 font-semibold rounded-lg text-sm transition-colors">Edit Profile</button>
                             <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 font-semibold rounded-lg text-sm transition-colors">View Archive</button>
                             <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"><Settings size={18} /></button>
                        </div>
                    </div>
                    <div className="flex gap-8 text-sm md:text-base">
                        <span><b className="mr-1">{posts.length}</b> posts</span>
                        <span><b className="mr-1">{user.followers}</b> followers</span>
                        <span><b className="mr-1">{user.following}</b> following</span>
                    </div>
                    <div>
                        <div className="font-bold">{user.name}</div>
                        <p className="text-gray-700 whitespace-pre-wrap">{user.bio}</p>
                    </div>
                </div>
            </header>

            <div className="border-t border-gray-200">
                <div className="flex justify-center gap-12 font-bold text-xs uppercase tracking-widest py-3">
                    <span className="flex items-center gap-1.5 border-t border-black -mt-3.5 pt-3.5 cursor-pointer"><Grid size={16} /> Posts</span>
                    <span className="flex items-center gap-1.5 text-gray-400 cursor-pointer pt-3.5"><Play size={16} /> Reels</span>
                    <span className="flex items-center gap-1.5 text-gray-400 cursor-pointer pt-3.5"><User size={16} /> Tagged</span>
                </div>

                <div className="grid grid-cols-3 gap-1 md:gap-8 mt-4">
                    {posts.map(post => (
                        <div key={post.id} className="aspect-square bg-gray-100 relative group cursor-pointer">
                            <img src={post.media} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold">
                                <span className="flex items-center gap-2"><Heart fill="currentColor" /> {post.likes}</span>
                                <span className="flex items-center gap-2"><MessageCircle fill="currentColor" /> {post.comments.length}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Messages = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/api/users').then(res => res.json()).then(data => {
            const others = data.filter((u: any) => u.id !== CURRENT_USER_ID);
            setUsers(others);
            if (others.length > 0) setSelectedUser(others[0]);
        });
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetch(`/api/chat/${CURRENT_USER_ID}/${selectedUser.id}`)
                .then(res => res.json())
                .then(setMessages);
        }
    }, [selectedUser]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!inputText.trim() || !selectedUser) return;
        const msg = { fromId: CURRENT_USER_ID, toId: selectedUser.id, text: inputText };
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msg)
        });
        const saved = await res.json();
        setMessages([...messages, saved]);
        setInputText("");
    };

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] md:h-[calc(100vh-40px)] md:my-5 bg-white border border-gray-200 rounded-xl flex overflow-hidden">
            {/* Contacts */}
            <div className="w-20 md:w-80 border-r border-gray-200 flex flex-col">
                <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="font-bold text-lg hidden md:block">Messages</h2>
                    <PlusSquare size={20} className="mx-auto md:mx-0" />
                </div>
                <div className="flex-1 overflow-y-auto pt-4">
                    {users.map(u => (
                        <div 
                            key={u.id} 
                            onClick={() => setSelectedUser(u)}
                            className={cn(
                                "flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                                selectedUser?.id === u.id && "bg-gray-100"
                            )}
                        >
                            <img src={u.avatar} className="w-14 h-14 rounded-full" />
                            <div className="flex-1 hidden md:block">
                                <div className="font-medium">{u.username}</div>
                                <div className="text-sm text-gray-500 truncate">Active 2h ago</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedUser ? (
                    <>
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src={selectedUser.avatar} className="w-8 h-8 rounded-full" />
                                <span className="font-bold">{selectedUser.username}</span>
                            </div>
                        </div>
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map(m => (
                                <div key={m.id} className={cn(
                                    "flex",
                                    m.fromId === CURRENT_USER_ID ? "justify-end" : "justify-start"
                                )}>
                                    <div className={cn(
                                        "max-w-[70%] p-3 rounded-2xl text-sm",
                                        m.fromId === CURRENT_USER_ID 
                                            ? "bg-blue-500 text-white rounded-br-none" 
                                            : "bg-gray-100 text-black rounded-bl-none"
                                    )}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-white">
                            <div className="flex items-center gap-2 p-2 px-4 border border-gray-200 rounded-full">
                                <Smile size={24} className="text-gray-500" />
                                <input 
                                    className="flex-1 bg-transparent border-none outline-none text-sm p-1" 
                                    placeholder="Message..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                />
                                <button onClick={sendMessage} className="text-blue-500 font-bold text-sm">Send</button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-24 h-24 rounded-full border-2 border-black flex items-center justify-center mb-6">
                            <Send size={45} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-xl font-bold">Your Messages</h2>
                        <p className="text-gray-500 mt-2">Send private photos and messages to a friend or group.</p>
                        <button className="mt-6 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">Send Message</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const Live = () => {
    const [streams, setStreams] = useState<any[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);

    useEffect(() => {
        fetch('/api/live').then(res => res.json()).then(setStreams);
        fetch('/api/users').then(res => res.json()).then(setUsers);
    }, []);

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                   <h1 className="text-2xl font-bold flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        Live Streams
                    </h1>
                    <p className="text-gray-500">Watch your favorite creators in real-time</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white font-bold rounded-full hover:shadow-lg transition-all active:scale-95">
                    <Video size={18} />
                    Go Live
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {streams.map(stream => {
                    const user = users.find(u => u.id === stream.userId);
                    return (
                        <div key={stream.id} className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-900 group cursor-pointer shadow-lg hover:shadow-xl transition-all">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                            <img src={user?.avatar} className="absolute inset-0 w-full h-full object-cover opacity-60 blur-sm scale-110 group-hover:scale-100 transition-transform duration-700" />
                            
                            <div className="absolute top-4 left-4 z-20 flex gap-2">
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">LIVE</span>
                                <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                                    <User size={10} /> {stream.viewers}
                                </span>
                            </div>

                            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border-2 border-red-500 overflow-hidden shrink-0">
                                    <img src={user?.avatar} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm leading-tight group-hover:text-red-400 transition-colors">{stream.title}</h3>
                                    <p className="text-white/70 text-xs">{user?.username}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const CreateModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [caption, setCaption] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(selected);
        }
    };

    const handleUpload = async () => {
        if (!preview) return;
        setLoading(true);
        try {
            await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: CURRENT_USER_ID,
                    content: caption,
                    media: preview, // In real app would upload to S3/Cloudinary
                    type: file?.type.startsWith('video') ? 'reel' : 'post'
                })
            });
            onClose();
            window.location.reload();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl relative z-10"
                    >
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <button onClick={onClose} className="p-1"><X size={24} /></button>
                            <h2 className="font-bold">Create new post</h2>
                            <button 
                                onClick={handleUpload}
                                disabled={!preview || loading}
                                className="text-blue-500 font-bold disabled:opacity-50"
                            >
                                Share
                            </button>
                        </div>
                        <div className="flex-1 min-h-[400px] flex flex-col p-6 items-center justify-center relative">
                            {preview ? (
                                <div className="w-full h-full flex flex-col gap-6">
                                    <div className="flex-1 rounded-2xl overflow-hidden shadow-inner bg-gray-50 border border-gray-100">
                                        {file?.type.startsWith('video') ? (
                                            <video src={preview} controls className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={preview} className="w-full h-full object-contain" />
                                        )}
                                    </div>
                                    <textarea 
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none text-sm min-h-[100px] focus:ring-2 focus:ring-blue-100 transition-all"
                                        placeholder="Write a caption..."
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                        <ImageIcon size={32} />
                                    </div>
                                    <p className="text-lg mb-6">Drag photos and videos here</p>
                                    <label className="px-6 py-2.5 bg-blue-500 text-white font-bold rounded-xl cursor-pointer hover:bg-blue-600 transition-colors shadow-md shadow-blue-200">
                                        Select from computer
                                        <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                                    </label>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const Layout = ({ children, onOpenCreate }: { children: React.ReactNode, onOpenCreate: () => void }) => {
    return (
        <div className="min-h-screen bg-white md:bg-gray-50">
            <Navbar />
            
            {/* Top Bar (Mobile Only) */}
            <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-gray-200 bg-white sticky top-0 z-40">
                <h1 className="text-2xl font-bold font-serif italic">Besta</h1>
                <div className="flex items-center gap-4">
                    <button onClick={onOpenCreate}><PlusSquare size={24} /></button>
                    <Heart size={24} />
                </div>
            </div>

            {/* Desktop Add Button */}
            <div className="hidden md:block fixed right-10 bottom-10 z-50">
                <button 
                    onClick={onOpenCreate}
                    className="p-4 bg-white border border-gray-200 shadow-xl rounded-2xl hover:scale-105 transition-transform group"
                >
                    <PlusSquare size={28} className="group-hover:text-blue-500 transition-colors" />
                </button>
            </div>

            <main className="md:ml-64 min-h-screen">
                {children}
            </main>
        </div>
    );
};

export default function App() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    return (
        <Router>
            <Layout onOpenCreate={() => setIsCreateOpen(true)}>
                <Routes>
                    <Route path="/" element={<Feed />} />
                    <Route path="/reels" element={<Reels />} />
                    <Route path="/explore" element={<div className="p-8 text-center">Search and Explore features coming soon!</div>} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/live" element={<Live />} />
                    <Route path="/profile/:id" element={<Profile />} />
                </Routes>
            </Layout>
            <CreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
        </Router>
    );
}
