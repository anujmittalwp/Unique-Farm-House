import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, User, ArrowRight, ChevronLeft, Share2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const INITIAL_BLOG_POSTS = [
  {
    slug: 'perfect-pool-party-noida',
    title: 'How to Plan the Perfect Pool Party in Noida',
    excerpt: 'Discover the ultimate checklist for hosting an unforgettable pool party at a luxury farmhouse in Noida.',
    content: `
      <p>Planning a pool party in Noida? Whether it's a birthday bash, a corporate retreat, or just a weekend get-together with friends, a farmhouse with a private pool is the perfect setting. Here is your ultimate guide to making it a splash!</p>
      
      <h4>1. Choose the Right Farmhouse</h4>
      <p>Not all farmhouses are created equal. Look for a property that offers a large, clean swimming pool, ample deck space for lounging, and changing rooms. Unique Farmhouse in Sector 135, Noida, offers a pristine pool area perfect for both day and night parties.</p>
      
      <h4>2. Plan the Menu and Drinks</h4>
      <p>Keep the food light and easy to eat. Finger foods, barbecue, and refreshing mocktails or cocktails are always a hit. Consider hiring a local catering service that specializes in outdoor events.</p>
      
      <h4>3. Set the Mood with Music and Lighting</h4>
      <p>A good playlist is essential. Ensure the farmhouse has a decent sound system. For evening parties, ambient lighting around the pool and floating LED lights can create a magical atmosphere.</p>
      
      <h4>4. Pool Games and Floats</h4>
      <p>Keep your guests entertained with pool volleyball, water guns, and Instagram-worthy pool floats (think giant flamingos or pizza slices).</p>
      
      <h4>5. Safety First</h4>
      <p>Always prioritize safety. Ensure the pool area is well-lit, keep a first-aid kit handy, and make sure there are non-slip mats around the wet areas.</p>
    `,
    image: 'https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599275/Unique_Farm_House_Swimming_Pool12_lo1abs.jpg',
    date: 'April 10, 2026',
    author: 'Unique Farmhouse Team',
    category: 'Party Planning'
  },
  {
    slug: 'top-catering-services-sector-135',
    title: 'Top 5 Catering Services near Sector 135',
    excerpt: 'A curated list of the best catering services that deliver exquisite culinary experiences to farmhouses in Sector 135, Noida.',
    content: `
      <p>Food is the soul of any event. When you book a luxury farmhouse in Sector 135, Noida, you want the catering to match the elegance of the venue. Here are top catering options to consider for your next event at Unique Farmhouse.</p>
      
      <h4>1. The Grand Buffet Caterers</h4>
      <p>Known for their extensive multi-cuisine spreads, they are perfect for large weddings and corporate events. Their live chaat counters are a crowd favorite.</p>
      
      <h4>2. Spice & Grill BBQ</h4>
      <p>If you're hosting a winter evening party or a casual get-together, nothing beats live barbecue. They offer excellent marinated meats and paneer tikka right off the grill.</p>
      
      <h4>3. Elegant Eats (Gourmet Plated)</h4>
      <p>For intimate anniversary dinners or high-end corporate retreats, Elegant Eats provides a fine-dining experience with beautifully plated courses and professional waitstaff.</p>
      
      <h4>4. The Local Halwai</h4>
      <p>For traditional Indian weddings and pre-wedding functions like Mehndi or Haldi, authentic Indian sweets and regional delicacies are a must. They specialize in pure vegetarian feasts.</p>
      
      <h4>5. Mixology Masters (Bar & Beverages)</h4>
      <p>While not strictly food, a great bartending service is crucial for a party. They provide flair bartenders, custom cocktail menus, and premium mocktails.</p>
      
      <p><em>Tip: Unique Farmhouse has a fully equipped kitchen, making it easy for any of these caterers to set up and serve fresh food to your guests.</em></p>
    `,
    image: 'https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774596185/Unique_Farm_House_High_Tea3_pp6cha.jpg',
    date: 'April 5, 2026',
    author: 'Unique Farmhouse Team',
    category: 'Local Guide'
  },
  {
    slug: 'farmhouse-weddings-delhi-ncr',
    title: 'Why Farmhouse Weddings are Trending in Delhi NCR',
    excerpt: 'Explore why couples are choosing private farmhouses over traditional banquet halls for their intimate weddings.',
    content: `
      <p>The wedding landscape in Delhi NCR is shifting. Gone are the days when massive, crowded banquet halls were the only option. Today, couples are increasingly opting for farmhouse weddings. Here is why this trend is taking over.</p>
      
      <h4>1. Exclusivity and Privacy</h4>
      <p>A farmhouse offers complete privacy. You aren't sharing the venue with another wedding party next door. The entire property, including the villa, lawns, and pool, is exclusively yours for the duration of the event.</p>
      
      <h4>2. Customization Freedom</h4>
      <p>Banquet halls often have strict rules regarding decor and catering vendors. A farmhouse provides a blank canvas. Whether you want a rustic bohemian theme or a lavish floral wonderland, you have the freedom to bring your exact vision to life.</p>
      
      <h4>3. Intimate and Meaningful</h4>
      <p>Post-pandemic, there's a strong preference for intimate weddings with close family and friends. A farmhouse perfectly accommodates a guest list of 50 to 150 people, allowing the couple to actually spend time with their guests.</p>
      
      <h4>4. All-in-One Venue</h4>
      <p>Farmhouses like Unique Farmhouse in Noida offer luxurious bedrooms. This means the immediate family can stay on-site, making it incredibly convenient for pre-wedding rituals (Haldi, Mehndi) and late-night after-parties.</p>
      
      <h4>5. Nature as a Backdrop</h4>
      <p>Lush green lawns, open skies, and natural lighting provide a stunning backdrop for wedding photography that indoor halls simply cannot match.</p>
    `,
    image: 'https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599341/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn1_sizw31.jpg',
    date: 'March 28, 2026',
    author: 'Unique Farmhouse Team',
    category: 'Weddings'
  }
];

export const Blog = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          // Seed initial posts
          const seededPosts = [];
          for (const post of INITIAL_BLOG_POSTS) {
            const docRef = await addDoc(collection(db, 'blogs'), {
              ...post,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            seededPosts.push({ id: docRef.id, ...post });
          }
          setPosts(seededPosts);
        } else {
          setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="py-32 text-center min-h-screen flex flex-col items-center justify-center bg-luxury-cream/30">
        <div className="w-12 h-12 border-4 border-luxury-gold/20 border-t-luxury-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="py-24 px-6 bg-luxury-cream/30 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-luxury-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Local Guide</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-luxury-dark mb-6">Our Blog & Guides</h1>
          <p className="text-luxury-dark/60 max-w-2xl mx-auto text-lg">
            Discover tips for planning the perfect event, local recommendations, and insights into luxury farm stays in Noida.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <motion.article 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2rem] overflow-hidden border border-luxury-dark/5 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-luxury-dark">
                  {post.category}
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-4 text-xs text-luxury-dark/40 mb-4">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
                  <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>
                </div>
                <h3 className="text-2xl font-serif text-luxury-dark mb-4 group-hover:text-luxury-gold transition-colors line-clamp-2">
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-luxury-dark/60 mb-8 line-clamp-3 flex-grow">
                  {post.excerpt}
                </p>
                <Link 
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-luxury-dark hover:text-luxury-gold transition-colors mt-auto"
                >
                  Read Article <ArrowRight size={16} />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const q = query(collection(db, 'blogs'));
        const snapshot = await getDocs(q);
        const foundPost = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).find((p: any) => p.slug === id);
        setPost(foundPost);
      } catch (error) {
        console.error("Error fetching blog post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="py-32 text-center min-h-screen flex flex-col items-center justify-center bg-luxury-cream/30">
        <div className="w-12 h-12 border-4 border-luxury-gold/20 border-t-luxury-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-32 text-center min-h-screen flex flex-col items-center justify-center bg-luxury-cream/30">
        <h2 className="text-4xl font-serif text-luxury-dark mb-4">Article Not Found</h2>
        <Link to="/blog" className="text-luxury-gold hover:underline">Return to Blog</Link>
      </div>
    );
  }

  return (
    <article className="bg-luxury-cream/30 min-h-screen pb-24">
      <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] w-full">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-6 text-center text-white mt-16">
            <span className="inline-block bg-luxury-gold/90 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
              {post.category}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-6 text-sm text-white/80">
              <span className="flex items-center gap-2"><Calendar size={16} /> {post.date}</span>
              <span className="flex items-center gap-2"><User size={16} /> {post.author}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-16 relative z-10">
        <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-xl border border-luxury-dark/5">
          <Link to="/blog" className="inline-flex items-center gap-2 text-luxury-dark/40 hover:text-luxury-gold transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
            <ChevronLeft size={16} /> Back to Blog
          </Link>
          
          <div 
            className="prose prose-luxury prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          <div className="mt-12 pt-8 border-t border-luxury-dark/10 flex justify-between items-center">
            <p className="text-luxury-dark/60 italic">Share this article:</p>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full bg-luxury-dark/5 flex items-center justify-center text-luxury-dark hover:bg-luxury-gold hover:text-white transition-colors">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
