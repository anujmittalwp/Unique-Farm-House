import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Plus, Edit3, Trash2, X, Image as ImageIcon, Save, Sparkles } from 'lucide-react';
import { getAI, safeAiCall } from './lib/ai';

export const BlogAdmin = ({ showToast, galleryImages }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void, galleryImages?: any[] }) => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<any>(null);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching blogs:", error);
      showToast('Failed to load blogs', 'error');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (blogToDelete) {
          setBlogToDelete(null);
        } else if (isEditing) {
          setIsEditing(false);
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isEditing, blogToDelete]);

  const handleAddNew = () => {
    setCurrentBlog({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image: '',
      category: 'Local Guide',
      author: 'Unique Farmhouse Team',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    });
    setIsEditing(true);
  };

  const handleGenerateAIPost = async () => {
    if (!galleryImages || galleryImages.length === 0) {
      showToast('No gallery images available to help AI generate a post.', 'error');
      return;
    }

    setIsGeneratingAI(true);
    showToast('Generating AI post... This could take 10-20 seconds.', 'info');
    try {
      const ai: any = getAI();
      
      const imageInfo = galleryImages.slice(0, 5).map(img => `Title: ${img.title}, Category: ${img.category}`).join('\n');
      
      const prompt = `Create a high-quality, SEO-optimized blog post for 'Unique Farmhouse Noida'.
      The blog should be written in a luxury, hospitable tone.
      Use these real property features to guide you:
      ${imageInfo}

      Return the response in JSON format:
      {
        "title": "Stunning Catchy Title",
        "slug": "url-friendly-slug",
        "excerpt": "A short 2-sentence meta description/summary",
        "content": "Full HTML content with <p>, <h4>, and <strong> tags. Minimum 300 words.",
        "image": "${galleryImages[0]?.src || ''}"
      }
      
      Ensure the content is engaging and highlights the pool, lush lawn, and 4BHK luxury villa. No markdown, just clean JSON.`;

      const result = await safeAiCall(() => ai.models.generateContent({
        model: "models/gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      }));

      const data = JSON.parse(result.text || '{}');
      
      setCurrentBlog({
        ...data,
        category: 'Trending',
        author: 'Unique Farmhouse Team',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      });
      setIsEditing(true);
      showToast('AI Blog generated successfully! You can tweak it before saving.', 'success');
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.message?.includes("Quota exceeded") 
        ? "AI Quota exceeded. Please try again later or provide a custom key."
        : error.message || 'Failed to generate';
      showToast(errorMsg, 'error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleEdit = (blog: any) => {
    setCurrentBlog(blog);
    setIsEditing(true);
  };

  const handleDeleteClick = (id: string) => {
    setBlogToDelete(id);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;
    try {
      await deleteDoc(doc(db, 'blogs', blogToDelete));
      showToast('Blog post deleted successfully', 'success');
    } catch (error) {
      console.error("Error deleting blog:", error);
      showToast('Failed to delete blog post', 'error');
    } finally {
      setBlogToDelete(null);
    }
  };

  const handleSave = async () => {
    if (!currentBlog.title || !currentBlog.content || !currentBlog.slug) {
      showToast('Please fill in all required fields (Title, Slug, Content)', 'error');
      return;
    }

    try {
      const blogData = {
        ...currentBlog,
        updatedAt: serverTimestamp()
      };

      if (currentBlog.id) {
        // Update existing
        const { id, ...dataToUpdate } = blogData;
        await updateDoc(doc(db, 'blogs', id), dataToUpdate);
        showToast('Blog post updated successfully', 'success');
      } else {
        // Create new
        blogData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'blogs'), blogData);
        showToast('Blog post created successfully', 'success');
      }
      setIsEditing(false);
      setCurrentBlog(null);
    } catch (error) {
      console.error("Error saving blog:", error);
      showToast('Failed to save blog post', 'error');
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  if (isEditing && currentBlog) {
    return (
      <div className="bg-white rounded-3xl border border-luxury-dark/5 shadow-sm p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-serif font-bold text-luxury-dark">
            {currentBlog.id ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h3>
          <button 
            onClick={() => setIsEditing(false)}
            className="p-2 hover:bg-luxury-dark/5 rounded-full transition-colors"
          >
            <X size={24} className="text-luxury-dark/60" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Title *</label>
              <input 
                type="text" 
                value={currentBlog.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setCurrentBlog({
                    ...currentBlog, 
                    title,
                    slug: currentBlog.id ? currentBlog.slug : generateSlug(title)
                  });
                }}
                className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                placeholder="Blog Title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">URL Slug *</label>
              <input 
                type="text" 
                value={currentBlog.slug}
                onChange={(e) => setCurrentBlog({...currentBlog, slug: e.target.value})}
                className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                placeholder="e.g. my-awesome-post"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Category</label>
              <input 
                type="text" 
                value={currentBlog.category}
                onChange={(e) => setCurrentBlog({...currentBlog, category: e.target.value})}
                className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                placeholder="e.g. Party Planning"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Author</label>
              <input 
                type="text" 
                value={currentBlog.author}
                onChange={(e) => setCurrentBlog({...currentBlog, author: e.target.value})}
                className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Date String</label>
              <input 
                type="text" 
                value={currentBlog.date}
                onChange={(e) => setCurrentBlog({...currentBlog, date: e.target.value})}
                className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Image URL</label>
            <div className="flex gap-4">
              <input 
                type="text" 
                value={currentBlog.image}
                onChange={(e) => setCurrentBlog({...currentBlog, image: e.target.value})}
                className="flex-1 px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                placeholder="https://..."
              />
              {currentBlog.image && (
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-luxury-dark/10">
                  <img src={currentBlog.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Excerpt (Short Summary)</label>
            <textarea 
              value={currentBlog.excerpt}
              onChange={(e) => setCurrentBlog({...currentBlog, excerpt: e.target.value})}
              className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all h-24 resize-none"
              placeholder="A brief summary of the post..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Content (HTML allowed) *</label>
            <textarea 
              value={currentBlog.content}
              onChange={(e) => setCurrentBlog({...currentBlog, content: e.target.value})}
              className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all h-64 font-mono"
              placeholder="<p>Your content here...</p>"
            />
            <p className="text-xs text-luxury-dark/40 mt-1">You can use standard HTML tags like &lt;p&gt;, &lt;h4&gt;, &lt;strong&gt;, etc.</p>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-luxury-dark/5">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-luxury-dark/60 hover:bg-luxury-dark/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-8 py-3 bg-luxury-gold text-luxury-dark rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-luxury-dark hover:text-white transition-all shadow-lg flex items-center gap-2"
            >
              <Save size={18} /> Save Post
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-serif font-bold text-luxury-dark">Blog Manager</h3>
          <p className="text-sm text-luxury-dark/60">Create and manage your blog posts</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleGenerateAIPost}
            disabled={isGeneratingAI}
            className="flex items-center gap-2 px-6 py-3 bg-[linear-gradient(110deg,#000,45%,#4D4D4D,55%,#000)] bg-[length:250%_100%] text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-black/20 transition-all disabled:opacity-50 animate-shimmer"
          >
            {isGeneratingAI ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles size={18} className="text-luxury-gold" />
            )}
            {isGeneratingAI ? 'Generating...' : 'Auto Generate Post'}
          </button>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-3 bg-luxury-gold text-luxury-dark rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-luxury-dark hover:text-white transition-all shadow-lg"
          >
            <Plus size={18} /> New Post
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-luxury-gold/20 border-t-luxury-gold rounded-full animate-spin" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-luxury-dark/5 p-12 text-center">
          <div className="w-16 h-16 bg-luxury-dark/5 rounded-full flex items-center justify-center mx-auto mb-4 text-luxury-dark/40">
            <ImageIcon size={24} />
          </div>
          <h4 className="text-lg font-serif font-bold text-luxury-dark mb-2">No Blog Posts Yet</h4>
          <p className="text-luxury-dark/60 mb-6">Create your first blog post to start engaging with your audience.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-dark text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-luxury-gold hover:text-luxury-dark transition-all shadow-lg"
            >
              <Plus size={18} /> Create First Post
            </button>
            <button
              onClick={async () => {
                try {
                  const samplePost = {
                    title: 'Why Farmhouse Weddings are Trending in Delhi NCR: Unique Farmhouse Noida',
                    slug: 'farmhouse-weddings-delhi-ncr',
                    excerpt: 'Discover why a Noida farmhouse wedding at Unique Farms is the top choice for couples seeking the best farmhouse in Noida for wedding celebrations.',
                    content: `
                      <p>The wedding landscape in Delhi NCR is shifting. Gone are the days when massive, crowded banquet halls were the only option. Today, couples are increasingly opting for a <strong>Noida farmhouse wedding</strong>. Whether you are looking for an <strong>intimate wedding venue in Noida</strong> or a grand <strong>destination wedding in Delhi NCR</strong>, <strong>Unique Farmhouse Noida</strong> offers a unique charm that traditional venues lack. Here is why this trend is taking over.</p>
                      
                      <div className="my-8 rounded-2xl overflow-hidden shadow-lg">
                        <img 
                          src="https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599343/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn6_q2gqyu.jpg" 
                          alt="Lush Green Lawn for Farmhouse Wedding in Noida" 
                          className="w-full h-auto object-cover"
                        />
                        <p className="text-center text-xs text-luxury-dark/40 mt-2 italic">Expansive lush green lawns at Unique Farms - ideal for wedding ceremonies.</p>
                      </div>

                      <h4>1. Exclusivity and Privacy at Your Luxury Wedding Venue</h4>
                      <p>A farmhouse offers complete privacy, making it a premier <strong>luxury wedding venue</strong>. You aren't sharing the venue with another wedding party next door. The entire property at <strong>Unique Farms</strong>, including the villa, lawns, and pool, is exclusively yours for the duration of your <strong>destination wedding in Delhi NCR</strong>.</p>
                      
                      <h4>2. Customization Freedom</h4>
                      <p>Banquet halls often have strict rules regarding decor and catering vendors. A farmhouse provides a blank canvas. Whether you want a rustic bohemian theme or a lavish floral wonderland, you have the freedom to bring your exact vision to life at the <strong>best farmhouse in Noida for wedding</strong> celebrations.</p>
                      
                      <h4>3. Intimate and Meaningful Celebrations</h4>
                      <p>Post-pandemic, there's a strong preference for intimate weddings with close family and friends. A farmhouse perfectly accommodates a guest list of 50 to 150 people, serving as the ideal <strong>intimate wedding venue in Noida</strong>, allowing the couple to actually spend time with their guests in a <strong>clean environment</strong>.</p>
                      
                      <h4>4. All-in-One Venue for Your Noida Farmhouse Wedding</h4>
                      <p>Farmhouses like <strong>Unique Farmhouse in Noida</strong> offer luxurious bedrooms. This means the immediate family can stay on-site, making it incredibly convenient for pre-wedding rituals (Haldi, Mehndi) and late-night after-parties during your <strong>Noida farmhouse wedding</strong> celebration.</p>
                      
                      <h4>5. Nature as a Backdrop</h4>
                      <p>Lush green lawns, open skies, and natural lighting provide a stunning backdrop for wedding photography that indoor halls simply cannot match. It truly defines the essence of a <strong>luxury wedding venue</strong> in the heart of nature at <strong>Unique Farms</strong>.</p>
                    `,
                    image: 'https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599341/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn1_sizw31.jpg',
                    category: 'Weddings',
                    author: 'Unique Farmhouse Team',
                    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                  };
                  await addDoc(collection(db, 'blogs'), samplePost);
                  showToast('Sample wedding post seeded successfully!', 'success');
                } catch (error) {
                  console.error("Error seeding blog:", error);
                  showToast('Failed to seed sample post', 'error');
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-luxury-dark border border-luxury-dark/10 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-luxury-dark/5 transition-all"
            >
              <ImageIcon size={18} /> Seed Sample Post
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map(blog => (
            <div key={blog.id} className="bg-white rounded-2xl border border-luxury-dark/5 overflow-hidden shadow-sm group">
              <div className="h-40 overflow-hidden relative">
                {blog.image ? (
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-luxury-dark/5 flex items-center justify-center text-luxury-dark/20">
                    <ImageIcon size={32} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <button 
                    onClick={() => handleEdit(blog)}
                    className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-luxury-dark hover:bg-luxury-gold hover:text-white transition-colors shadow-sm"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(blog.id)}
                    className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold mb-2">
                  {blog.category || 'Uncategorized'}
                </div>
                <h4 className="font-serif font-bold text-luxury-dark mb-2 line-clamp-2">{blog.title}</h4>
                <p className="text-xs text-luxury-dark/60 line-clamp-2 mb-4">{blog.excerpt}</p>
                <div className="text-[10px] text-luxury-dark/40 flex justify-between items-center">
                  <span>{blog.date}</span>
                  <span className="truncate max-w-[100px]">/{blog.slug}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {blogToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-serif text-luxury-dark mb-4">Delete Blog Post?</h3>
            <p className="text-luxury-dark/60 mb-8">Are you sure you want to delete this blog post? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setBlogToDelete(null)}
                className="px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-widest text-luxury-dark/60 hover:bg-luxury-dark/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-500 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
