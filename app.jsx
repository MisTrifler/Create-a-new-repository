import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Star, MessageSquare, Heart, Flag, LogOut, Settings, Trash2, Eye, EyeOff, Home, User, Send, X, Video, Truck, CheckCircle, AlertCircle } from 'lucide-react';

export default function LocalMarketplaceEnhanced() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Listings state
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all'); // all, local, shipping

  // Modal states
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showListingDetail, setShowListingDetail] = useState(null);
  const [showMessaging, setShowMessaging] = useState(null);
  const [showVideoRequest, setShowVideoRequest] = useState(null);

  // Form states
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    category: 'other',
    location: '',
    images: [''], // Multiple images
    condition: '5', // 1-5 star condition
    videoUrl: '', // YouTube/Vimeo link
    allowsDelivery: false,
    allowsLocalPickup: true,
    itemDescription: '' // Extended description
  });
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');

  // Data
  const categories = ['all', 'electronics', 'furniture', 'clothing', 'books', 'tools', 'sports', 'other'];

  // Load data
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('marketplace-enhanced') || '{}');
    if (saved.listings) setListings(saved.listings);
    if (saved.currentUser) setCurrentUser(saved.currentUser);
    if (saved.messages) setMessages(saved.messages);
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('marketplace-enhanced', JSON.stringify({ listings, currentUser, messages }));
  }, [listings, currentUser, messages]);

  // Filter listings
  useEffect(() => {
    let filtered = listings.filter(l => !l.flagged);
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(l => l.category === selectedCategory);
    }

    if (deliveryFilter === 'local') {
      filtered = filtered.filter(l => l.allowsLocalPickup);
    } else if (deliveryFilter === 'shipping') {
      filtered = filtered.filter(l => l.allowsDelivery);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(l =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.itemDescription.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredListings(filtered);
  }, [listings, searchQuery, selectedCategory, deliveryFilter]);

  // Auth handlers
  const handleLogin = () => {
    if (!loginEmail || !loginPassword) return;
    const user = {
      id: Math.random(),
      email: loginEmail,
      createdAt: new Date(),
      isPremium: false,
      isVerified: false // New: seller verification
    };
    setCurrentUser(user);
    setLoginEmail('');
    setLoginPassword('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Create listing
  const handleCreateListing = () => {
    if (!newListing.title || !newListing.price || !newListing.location) return;
    
    const listing = {
      id: Date.now(),
      ...newListing,
      sellerId: currentUser.id,
      sellerEmail: currentUser.email,
      isSellerVerified: currentUser.isVerified,
      createdAt: new Date(),
      videoRequests: [],
      reviews: [],
      favorites: [],
      flagged: false
    };
    setListings([listing, ...listings]);
    setNewListing({
      title: '',
      description: '',
      price: '',
      category: 'other',
      location: '',
      images: [''],
      condition: '5',
      videoUrl: '',
      allowsDelivery: false,
      allowsLocalPickup: true,
      itemDescription: ''
    });
    setShowCreateListing(false);
  };

  const handleDeleteListing = (id) => {
    setListings(listings.filter(l => l.id !== id));
  };

  const handleFlagListing = (id) => {
    setListings(listings.map(l =>
      l.id === id ? { ...l, flagged: true } : l
    ));
  };

  const handleToggleFavorite = (id) => {
    setListings(listings.map(l => {
      if (l.id === id) {
        const isFavorited = l.favorites.includes(currentUser.id);
        return {
          ...l,
          favorites: isFavorited
            ? l.favorites.filter(uid => uid !== currentUser.id)
            : [...l.favorites, currentUser.id]
        };
      }
      return l;
    }));
  };

  // Video inspection request
  const handleVideoRequest = (listingId) => {
    setListings(listings.map(l => {
      if (l.id === listingId) {
        return {
          ...l,
          videoRequests: [...(l.videoRequests || []), {
            from: currentUser.email,
            requestedAt: new Date(),
            status: 'pending'
          }]
        };
      }
      return l;
    }));
    alert('Video inspection requested! Seller will respond within 24 hours.');
    setShowVideoRequest(null);
  };

  // Messaging
  const handleSendMessage = (recipientId, listingId) => {
    if (!newMessage.trim()) return;
    const conversationKey = [currentUser.id, recipientId, listingId].sort().join('_');
    const msg = {
      from: currentUser.id,
      to: recipientId,
      text: newMessage,
      timestamp: new Date(),
      listingId
    };
    setMessages({
      ...messages,
      [conversationKey]: [...(messages[conversationKey] || []), msg]
    });
    setNewMessage('');
  };

  const getConversationMessages = (otherUserId, listingId) => {
    const key = [currentUser.id, otherUserId, listingId].sort().join('_');
    return messages[key] || [];
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              LocalDeal
            </h1>
            <p className="text-slate-400 text-sm">Buy & sell locally. See first. Trust always.</p>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all"
            >
              Sign In / Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              LocalDeal
            </h1>
            <div className="flex gap-3">
              <button onClick={handleLogout} className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600">
                <LogOut size={20} />
              </button>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Built for people who can't travel far. Video inspections. Trust verified.</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Search & Filters */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none"
              />
            </div>
            <button
              onClick={() => setShowCreateListing(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Post Item
            </button>
          </div>

          {/* Delivery Filter */}
          <div className="flex gap-2 flex-wrap">
            <div className="text-sm text-slate-400 flex items-center">Delivery:</div>
            {['all', 'local', 'shipping'].map(option => (
              <button
                key={option}
                onClick={() => setDeliveryFilter(option)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  deliveryFilter === option
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {option === 'all' && '📍 All Options'}
                {option === 'local' && '🚶 Local Pickup'}
                {option === 'shipping' && '🚚 Ships Anywhere'}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map(listing => (
            <div
              key={listing.id}
              className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-colors group cursor-pointer"
              onClick={() => setShowListingDetail(listing)}
            >
              {/* Image Carousel */}
              <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center relative overflow-hidden">
                {listing.images && listing.images[0] && (
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                )}
                {!listing.images?.[0] && <div className="text-slate-600 text-4xl">📦</div>}
                
                {/* Multiple Images Badge */}
                {listing.images && listing.images.filter(i => i).length > 1 && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    {listing.images.filter(i => i).length} photos
                  </div>
                )}

                {/* Video Badge */}
                {listing.videoUrl && (
                  <div className="absolute bottom-2 right-2 bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs">
                    <Video size={14} /> Video
                  </div>
                )}

                {/* Delivery Option Badge */}
                {listing.allowsDelivery && (
                  <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs">
                    <Truck size={14} /> Ships
                  </div>
                )}

                {/* Seller Verification Badge */}
                {listing.isSellerVerified && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs">
                    <CheckCircle size={14} /> Verified
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-white truncate">{listing.title}</h3>
                  <p className="text-2xl font-black text-blue-400">£{listing.price}</p>
                </div>

                {/* Condition Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < parseInt(listing.condition) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">Condition</span>
                </div>

                <div className="space-y-1 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    {listing.location}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-700">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(listing.id);
                    }}
                    className={`flex-1 py-2 rounded font-semibold text-sm transition-colors ${
                      listing.favorites.includes(currentUser.id)
                        ? 'bg-red-600/30 text-red-400'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <Heart size={16} className="mx-auto" />
                  </button>
                  <button className="flex-1 py-2 bg-slate-700 text-slate-300 rounded font-semibold text-sm hover:bg-slate-600">
                    <MessageSquare size={16} className="mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No listings found. Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Listing Detail Modal */}
      {showListingDetail && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-4 z-40">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-white">{showListingDetail.title}</h2>
              <button onClick={() => setShowListingDetail(null)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {/* Image Gallery */}
            {showListingDetail.images && showListingDetail.images.filter(i => i).length > 0 && (
              <div className="space-y-2">
                <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
                  <img src={showListingDetail.images[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                </div>
                {showListingDetail.images.filter(i => i).length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {showListingDetail.images.filter(i => i).map((img, i) => (
                      <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded border border-slate-600 cursor-pointer" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Video Link */}
            {showListingDetail.videoUrl && (
              <div className="bg-red-600/20 border border-red-600/50 p-4 rounded-lg">
                <p className="font-semibold text-red-400 flex items-center gap-2">
                  <Video size={18} /> Video Available
                </p>
                <p className="text-sm text-slate-400">Watch seller's video tour: <a href={showListingDetail.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Open Video</a></p>
              </div>
            )}

            {/* Price & Details */}
            <div className="space-y-3">
              <p className="text-4xl font-black text-blue-400">£{showListingDetail.price}</p>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-700">
                <div>
                  <p className="text-slate-400 text-sm">Condition</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < parseInt(showListingDetail.condition) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Location</p>
                  <p className="font-semibold text-white flex items-center gap-2">
                    <MapPin size={16} /> {showListingDetail.location}
                  </p>
                </div>
              </div>

              {/* Delivery Options */}
              <div className="grid grid-cols-2 gap-4">
                {showListingDetail.allowsLocalPickup && (
                  <div className="bg-slate-700/50 p-3 rounded-lg">
                    <p className="text-sm text-slate-300">✓ Local Pickup Available</p>
                  </div>
                )}
                {showListingDetail.allowsDelivery && (
                  <div className="bg-green-600/20 border border-green-600/50 p-3 rounded-lg">
                    <p className="text-sm text-green-300 font-semibold">✓ Ships Anywhere</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-2">Description</p>
                <p className="text-white">{showListingDetail.itemDescription || showListingDetail.description}</p>
              </div>

              {/* Video Request Button */}
              {currentUser.id !== showListingDetail.sellerId && (
                <button
                  onClick={() => setShowVideoRequest(showListingDetail)}
                  className="w-full bg-red-600/20 border border-red-600/50 text-red-400 font-bold py-3 rounded-lg hover:bg-red-600/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Video size={20} />
                  Request Video Inspection
                </button>
              )}

              {/* Action Buttons */}
              {currentUser.id !== showListingDetail.sellerId && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowMessaging(showListingDetail);
                      setShowListingDetail(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={20} />
                    Message Seller
                  </button>
                  <button
                    onClick={() => handleFlagListing(showListingDetail.id)}
                    className="px-4 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <Flag size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Request Modal */}
      {showVideoRequest && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-4 z-40">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg space-y-4 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Video size={24} /> Request Video Inspection
            </h2>
            
            <div className="space-y-3 text-slate-300">
              <p>Can't see the item in person? Request a video inspection!</p>
              <div className="bg-blue-600/20 border border-blue-600/50 p-4 rounded-lg space-y-2">
                <p className="font-semibold text-blue-300">The seller will:</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Film the item from all angles</li>
                  <li>Show close-ups of condition</li>
                  <li>Demonstrate it working</li>
                  <li>Provide proof of authenticity</li>
                </ul>
              </div>
              <p className="text-sm">Response time: Usually within 24 hours</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleVideoRequest(showVideoRequest.id)}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Request Video
              </button>
              <button
                onClick={() => setShowVideoRequest(null)}
                className="flex-1 bg-slate-700 text-slate-300 font-bold py-3 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {showCreateListing && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-4 z-40">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Post an Item</h2>
              <button onClick={() => setShowCreateListing(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Item title"
                value={newListing.title}
                onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none"
              />

              {/* Multiple Images */}
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Photos (up to 5)</label>
                {newListing.images.map((img, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Image URL ${i + 1}`}
                    value={img}
                    onChange={(e) => {
                      const updated = [...newListing.images];
                      updated[i] = e.target.value;
                      setNewListing({ ...newListing, images: updated });
                    }}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 outline-none"
                  />
                ))}
              </div>

              {/* Condition Rating */}
              <div>
                <label className="text-sm text-slate-400">Item Condition (1-5 stars)</label>
                <select
                  value={newListing.condition}
                  onChange={(e) => setNewListing({ ...newListing, condition: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 outline-none"
                >
                  <option value="1">⭐ Poor</option>
                  <option value="2">⭐⭐ Fair</option>
                  <option value="3">⭐⭐⭐ Good</option>
                  <option value="4">⭐⭐⭐⭐ Very Good</option>
                  <option value="5">⭐⭐⭐⭐⭐ Like New</option>
                </select>
              </div>

              {/* Video URL */}
              <input
                type="text"
                placeholder="Video URL (YouTube/Vimeo - optional)"
                value={newListing.videoUrl}
                onChange={(e) => setNewListing({ ...newListing, videoUrl: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:border-blue-500 outline-none"
              />

              <textarea
                placeholder="Detailed description"
                value={newListing.itemDescription}
                onChange={(e) => setNewListing({ ...newListing, itemDescription: e.target.value })}
                rows="4"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none"
              />

              <input
                type="number"
                placeholder="Price (£)"
                value={newListing.price}
                onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none"
              />

              <select
                value={newListing.category}
                onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 outline-none"
              >
                {categories.slice(1).map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Location / City"
                value={newListing.location}
                onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none"
              />

              {/* Delivery Options */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newListing.allowsDelivery}
                    onChange={(e) => setNewListing({ ...newListing, allowsDelivery: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-300">I can ship this item</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newListing.allowsLocalPickup}
                    onChange={(e) => setNewListing({ ...newListing, allowsLocalPickup: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-300">Available for local pickup</span>
                </label>
              </div>

              <button
                onClick={handleCreateListing}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all"
              >
                Post Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messaging Modal */}
      {showMessaging && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-4 z-40">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] space-y-4 p-6 flex flex-col">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">{showMessaging.title}</h2>
              <button onClick={() => setShowMessaging(null)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 space-y-3 min-h-64 max-h-64 overflow-y-auto bg-slate-900/50 p-4 rounded-lg">
              {getConversationMessages(showMessaging.sellerId, showMessaging.id).map((msg, i) => (
                <div key={i} className={`flex ${msg.from === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.from === currentUser.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-white'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(showMessaging.sellerId, showMessaging.id)}
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none"
              />
              <button
                onClick={() => handleSendMessage(showMessaging.sellerId, showMessaging.id)}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}