import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { v4 as uuidv4 } from "uuid";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory Database
  const db = {
    users: [
      { id: "user-1", username: "alex_travels", name: "Alex Rivers", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop", bio: "Exploring the world one pixel at a time.", followers: 1240, following: 850 },
      { id: "user-2", username: "sarah_chef", name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop", bio: "Cooking is love made visible. 🍳", followers: 5600, following: 430 },
      { id: "user-3", username: "besta_official", name: "Besta App", avatar: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop", bio: "Welcome to Besta! Share your world.", followers: 99999, following: 1 }
    ],
    posts: [
      { 
        id: "post-1", 
        userId: "user-1", 
        type: "post",
        content: "Sunrise at the peak today was absolutely breathtaking. #travel #nature", 
        media: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
        likes: 124, 
        comments: [
          { id: "c1", userId: "user-2", text: "Stunning view Alex!" }
        ],
        createdAt: new Date().toISOString()
      },
      { 
        id: "post-2", 
        userId: "user-2", 
        type: "post",
        content: "New recipe just dropped: Truffle Pasta! 🍝✨", 
        media: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=800&q=80",
        likes: 852, 
        comments: [],
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      { 
        id: "reel-1", 
        userId: "user-1", 
        type: "reel",
        content: "Morning hike vibes", 
        media: "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4",
        likes: 3400, 
        comments: [],
        createdAt: new Date(Date.now() - 7200000).toISOString()
      }
    ],
    messages: [
      { id: "m1", fromId: "user-1", toId: "user-2", text: "Hey Sarah, loved your recipe!", createdAt: new Date().toISOString() }
    ],
    notifications: [],
    liveStreams: [
        { id: "live-1", userId: "user-2", title: "Cooking Italian Dinner!", viewers: 42 }
    ]
  };

  // API Routes
  app.get("/api/users", (req, res) => res.json(db.users));
  app.get("/api/users/:id", (req, res) => {
    const user = db.users.find(u => u.id === req.params.id || u.username === req.params.id);
    res.json(user);
  });

  app.get("/api/feed", (req, res) => {
    // Return posts and reels mixed or filtered
    const feed = [...db.posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(feed);
  });

  app.post("/api/posts", (req, res) => {
    const { userId, content, media, type } = req.body;
    const newPost = {
      id: uuidv4(),
      userId,
      content,
      media,
      type: type || 'post',
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };
    db.posts.unshift(newPost);
    res.json(newPost);
  });

  app.post("/api/posts/:id/like", (req, res) => {
    const post = db.posts.find(p => p.id === req.params.id);
    if (post) post.likes += 1;
    res.json(post);
  });

  app.get("/api/chat/:userId/:otherId", (req, res) => {
    const { userId, otherId } = req.params;
    const chat = db.messages.filter(m => 
      (m.fromId === userId && m.toId === otherId) || 
      (m.fromId === otherId && m.toId === userId)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    res.json(chat);
  });

  app.post("/api/chat", (req, res) => {
    const { fromId, toId, text } = req.body;
    const newMessage = { id: uuidv4(), fromId, toId, text, createdAt: new Date().toISOString() };
    db.messages.push(newMessage);
    res.json(newMessage);
  });

  app.get("/api/live", (req, res) => res.json(db.liveStreams));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
