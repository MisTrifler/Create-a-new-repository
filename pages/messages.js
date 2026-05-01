import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [profilesMap, setProfilesMap] = useState({});
  const [myDisplayName, setMyDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!activeConversation) return;

    fetchMessages(activeConversation.id);

    const interval = setInterval(() => {
      fetchMessages(activeConversation.id, false);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeConversation]);

  async function init() {
    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
      alert("Please login to use messages.");
      window.location.href = "/login";
      return;
    }

    setUser(data.user);
    setCheckingUser(false);

    await fetchMyProfile(data.user);

    const params = new URLSearchParams(window.location.search);
    const productId = params.get("productId");

    if (productId) {
      await startConversation(data.user, productId);
    }

    await fetchConversations(data.user.id);
  }

  async function fetchMyProfile(currentUser) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (error) {
      console.error("Profile load error:", error);
      return;
    }

    if (data?.display_name) {
      setMyDisplayName(data.display_name);
      setProfilesMap((old) => ({
        ...old,
        [currentUser.id]: data
      }));
    } else {
      const fallbackName =
        currentUser.email?.split("@")[0]?.replace(/[._-]/g, " ") || "LocalDeal User";

      setMyDisplayName(fallbackName);

      setProfilesMap((old) => ({
        ...old,
        [currentUser.id]: {
          id: currentUser.id,
          display_name: fallbackName
        }
      }));
    }
  }

  async function saveMyDisplayName() {
    const cleaned = myDisplayName.trim();

    if (!cleaned) {
      alert("Please enter a display name.");
      return;
    }

    if (cleaned.length > 40) {
      alert("Display name must be under 40 characters.");
      return;
    }

    setSavingName(true);

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: cleaned,
      updated_at: new Date().toISOString()
    });

    setSavingName(false);

    if (error) {
      alert("Could not save display name: " + error.message);
      return;
    }

    setProfilesMap((old) => ({
      ...old,
      [user.id]: {
        ...(old[user.id] || {}),
        id: user.id,
        display_name: cleaned
      }
    }));

    alert("Display name saved.");
  }

  async function fetchProfilesForConversations(conversationRows) {
    const ids = [];

    conversationRows.forEach((conversation) => {
      if (conversation.buyer_id) ids.push(conversation.buyer_id);
      if (conversation.seller_id) ids.push(conversation.seller_id);
    });

    const uniqueIds = [...new Set(ids)];

    if (uniqueIds.length === 0) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .in("id", uniqueIds);

    if (error) {
      console.error("Profiles load error:", error);
      return;
    }

    const map = {};

    (data || []).forEach((profile) => {
      map[profile.id] = profile;
    });

    setProfilesMap((old) => ({
      ...old,
      ...map
    }));
  }

  async function startConversation(currentUser, productId) {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      alert("Product not found.");
      return;
    }

    if (!product.user_id) {
      alert("This listing does not have a seller account attached.");
      return;
    }

    if (product.user_id === currentUser.id) {
      alert("This is your own listing. Buyers will message you here.");
      window.location.href = "/my-listings";
      return;
    }

    const { data: existingConversation, error: existingError } = await supabase
      .from("conversations")
      .select("*")
      .eq("product_id", product.id)
      .eq("buyer_id", currentUser.id)
      .eq("seller_id", product.user_id)
      .maybeSingle();

    if (existingError) {
      alert("Could not check existing chat: " + existingError.message);
      return;
    }

    if (existingConversation) {
      const fullConversation = {
        ...existingConversation,
        products: product
      };

      setActiveConversation(fullConversation);
      await fetchProfilesForConversations([fullConversation]);
      return;
    }

    const { data: newConversation, error: createError } = await supabase
      .from("conversations")
      .insert([
        {
          product_id: product.id,
          buyer_id: currentUser.id,
          seller_id: product.user_id
        }
      ])
      .select("*")
      .single();

    if (createError) {
      alert("Could not start chat: " + createError.message);
      return;
    }

    const fullConversation = {
      ...newConversation,
      products: product
    };

    setActiveConversation(fullConversation);
    await fetchProfilesForConversations([fullConversation]);
  }

  async function fetchConversations(userId) {
    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        *,
        products (
          id,
          title,
          price,
          image_url,
          location,
          seller_name,
          user_id
        )
      `
      )
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("updated_at", { ascending: false });

    if (error) {
      alert("Could not load conversations: " + error.message);
      setConversations([]);
      return;
    }

    const rows = data || [];

    setConversations(rows);
    await fetchProfilesForConversations(rows);

    if (!activeConversation && rows.length > 0) {
      setActiveConversation(rows[0]);
    }
  }

  async function fetchMessages(conversationId, showLoading = true) {
    if (showLoading) {
      setLoadingMessages(true);
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setMessages(data || []);
    }

    setLoadingMessages(false);
  }

  async function sendMessage() {
    if (!activeConversation) {
      alert("Choose a conversation first.");
      return;
    }

    if (!newMessage.trim()) {
      return;
    }

    setSending(true);

    const { error } = await supabase.from("messages").insert([
      {
        conversation_id: activeConversation.id,
        sender_id: user.id,
        body: newMessage.trim()
      }
    ]);

    if (error) {
      setSending(false);
      alert("Could not send message: " + error.message);
      return;
    }

    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", activeConversation.id);

    setNewMessage("");
    setSending(false);

    await fetchMessages(activeConversation.id, false);
    await fetchConversations(user.id);
  }

  function formatName(name) {
    if (!name) return "";
    return name
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function getProfileName(userId) {
    const profile = profilesMap[userId];

    if (profile?.display_name) {
      return formatName(profile.display_name);
    }

    return "";
  }

  function getOtherUserId(conversation) {
    if (!conversation || !user) return null;

    if (conversation.buyer_id === user.id) {
      return conversation.seller_id;
    }

    return conversation.buyer_id;
  }

  function getOtherPersonLabel(conversation) {
    if (!conversation || !user) return "Conversation";

    const otherUserId = getOtherUserId(conversation);
    const profileName = getProfileName(otherUserId);

    if (profileName) {
      return profileName;
    }

    if (conversation.buyer_id === user.id) {
      return conversation.products?.seller_name || "Seller";
    }

    return "Buyer";
  }

  function getMessageSenderName(message) {
    if (!message || !user) return "";

    if (message.sender_id === user.id) {
      return "You";
    }

    const profileName = getProfileName(message.sender_id);

    if (profileName) {
      return profileName;
    }

    return getOtherPersonLabel(activeConversation);
  }

  if (checkingUser) {
    return (
      <div style={{ padding: "50px", fontFamily: "Arial" }}>
        Checking login...
      </div>
    );
  }

  return (
    <>
      <div className="page">
        <header className="header">
          <a href="/" className="logo">
            LocalDeal
          </a>

          <nav>
            <a href="/" className="navLink">
              Home
            </a>
            <a href="/post-product" className="navLink">
              Post Product
            </a>
            <a href="/my-listings" className="navLink">
              My Listings
            </a>
          </nav>
        </header>

        <main className="container">
          <div className="topText">
            <h1>Messages</h1>
            <p>
              Chat safely inside LocalDeal. Use your display name so buyers and
              sellers know who they are speaking to. Do not share passwords, bank
              details, full addresses, phone numbers or personal information.
            </p>
          </div>

          <div className="profileBox">
            <div>
              <h2>Your public chat name</h2>
              <p>This is shown in chats instead of your email address.</p>
            </div>

            <div className="profileForm">
              <input
                value={myDisplayName}
                onChange={(e) => setMyDisplayName(e.target.value)}
                placeholder="Example: Vidyut, Sarah, Laptop Seller"
                maxLength={40}
              />
              <button onClick={saveMyDisplayName} disabled={savingName}>
                {savingName ? "Saving..." : "Save Name"}
              </button>
            </div>
          </div>

          <div className="chatLayout">
            <aside className="conversationList">
              <h2>Chats</h2>

              {conversations.length === 0 && (
                <div className="emptyBox">
                  <p>No messages yet.</p>
                  <a href="/" className="browseButton">
                    Browse products
                  </a>
                </div>
              )}

              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setActiveConversation(conversation)}
                  className={
                    activeConversation?.id === conversation.id
                      ? "conversation activeConversation"
                      : "conversation"
                  }
                >
                  <img
                    src={
                      conversation.products?.image_url ||
                      "https://images.unsplash.com/photo-1607082349566-187342175e2f"
                    }
                    alt={conversation.products?.title || "Product"}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1607082349566-187342175e2f";
                    }}
                  />

                  <div>
                    <strong>{conversation.products?.title || "Product"}</strong>
                    <span>{getOtherPersonLabel(conversation)}</span>
                  </div>
                </button>
              ))}
            </aside>

            <section className="chatBox">
              {!activeConversation ? (
                <div className="noChat">
                  <h2>Select a conversation</h2>
                  <p>Your messages will appear here.</p>
                </div>
              ) : (
                <>
                  <div className="chatHeader">
                    <img
                      src={
                        activeConversation.products?.image_url ||
                        "https://images.unsplash.com/photo-1607082349566-187342175e2f"
                      }
                      alt={activeConversation.products?.title || "Product"}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1607082349566-187342175e2f";
                      }}
                    />

                    <div>
                      <h2>{activeConversation.products?.title || "Product"}</h2>
                      <p>
                        Chatting with{" "}
                        <strong>{getOtherPersonLabel(activeConversation)}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="safetyNotice">
                    Keep communication on LocalDeal. Avoid sharing phone numbers,
                    emails, full addresses, bank details or payment codes.
                  </div>

                  <div className="messagesArea">
                    {loadingMessages && <p>Loading messages...</p>}

                    {!loadingMessages && messages.length === 0 && (
                      <div className="emptyMessages">
                        <p>No messages yet. Start the conversation below.</p>
                      </div>
                    )}

                    {messages.map((message) => {
                      const mine = message.sender_id === user.id;

                      return (
                        <div
                          key={message.id}
                          className={mine ? "message mine" : "message theirs"}
                        >
                          <strong className="senderName">
                            {getMessageSenderName(message)}
                          </strong>
                          <p>{message.body}</p>
                          <small>
                            {new Date(message.created_at).toLocaleString()}
                          </small>
                        </div>
                      );
                    })}
                  </div>

                  <div className="sendBox">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                    />

                    <button onClick={sendMessage} disabled={sending}>
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        </main>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background: #f3f4f6;
          font-family: Arial, sans-serif;
        }

        .header {
          background: #111827;
          color: white;
          padding: 18px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .logo {
          color: white;
          text-decoration: none;
          font-size: 26px;
          font-weight: 800;
        }

        .navLink {
          color: white;
          text-decoration: none;
          margin-left: 18px;
          font-weight: 600;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .topText {
          margin-bottom: 24px;
        }

        .topText h1 {
          margin: 0 0 8px;
        }

        .topText p {
          color: #555;
          line-height: 1.6;
        }

        .profileBox {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 18px;
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 18px;
          align-items: center;
          margin-bottom: 22px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
        }

        .profileBox h2 {
          margin: 0 0 6px;
        }

        .profileBox p {
          color: #6b7280;
          margin: 0;
        }

        .profileForm {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
        }

        .profileForm input {
          width: 100%;
          padding: 13px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-size: 15px;
        }

        .profileForm button {
          background: #111827;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 16px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
        }

        .profileForm button:disabled {
          background: #777;
          cursor: not-allowed;
        }

        .chatLayout {
          display: grid;
          grid-template-columns: 330px 1fr;
          gap: 22px;
        }

        .conversationList,
        .chatBox {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
        }

        .conversationList {
          padding: 18px;
          max-height: 720px;
          overflow-y: auto;
        }

        .conversationList h2 {
          margin-top: 0;
        }

        .conversation {
          width: 100%;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 12px;
          padding: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          cursor: pointer;
          text-align: left;
        }

        .conversation:hover,
        .activeConversation {
          border-color: #f4b400;
          background: #fffbeb;
        }

        .conversation img {
          width: 54px;
          height: 54px;
          object-fit: cover;
          border-radius: 10px;
        }

        .conversation strong {
          display: block;
          color: #111827;
          font-size: 14px;
        }

        .conversation span {
          color: #6b7280;
          font-size: 13px;
        }

        .chatBox {
          min-height: 720px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chatHeader {
          padding: 18px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .chatHeader img {
          width: 64px;
          height: 64px;
          object-fit: cover;
          border-radius: 12px;
        }

        .chatHeader h2 {
          margin: 0 0 4px;
        }

        .chatHeader p {
          margin: 0;
          color: #6b7280;
        }

        .safetyNotice {
          margin: 14px 18px 0;
          background: #fef3c7;
          color: #92400e;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
        }

        .messagesArea {
          flex: 1;
          padding: 18px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message {
          max-width: 75%;
          padding: 12px;
          border-radius: 14px;
        }

        .senderName {
          display: block;
          font-size: 13px;
          margin-bottom: 6px;
          opacity: 0.85;
        }

        .message p {
          margin: 0 0 6px;
          line-height: 1.4;
          white-space: pre-wrap;
        }

        .message small {
          font-size: 11px;
          opacity: 0.75;
        }

        .mine {
          align-self: flex-end;
          background: #111827;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .theirs {
          align-self: flex-start;
          background: #f3f4f6;
          color: #111827;
          border-bottom-left-radius: 4px;
        }

        .sendBox {
          border-top: 1px solid #e5e7eb;
          padding: 14px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
        }

        .sendBox textarea {
          width: 100%;
          min-height: 54px;
          max-height: 140px;
          resize: vertical;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 12px;
          font-size: 15px;
          font-family: Arial, sans-serif;
        }

        .sendBox button,
        .browseButton {
          background: #111827;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 18px;
          font-weight: 800;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }

        .sendBox button:disabled {
          background: #777;
          cursor: not-allowed;
        }

        .emptyBox,
        .noChat,
        .emptyMessages {
          color: #555;
          padding: 20px;
          text-align: center;
        }

        @media (max-width: 850px) {
          .header {
            flex-direction: column;
            padding: 18px;
          }

          .navLink {
            margin-left: 8px;
            margin-right: 8px;
          }

          .container {
            padding: 24px 14px;
          }

          .profileBox {
            grid-template-columns: 1fr;
          }

          .profileForm {
            grid-template-columns: 1fr;
          }

          .profileForm button {
            width: 100%;
          }

          .chatLayout {
            grid-template-columns: 1fr;
          }

          .conversationList {
            max-height: 320px;
          }

          .chatBox {
            min-height: 620px;
          }

          .sendBox {
            grid-template-columns: 1fr;
          }

          .sendBox button {
            width: 100%;
          }

          .message {
            max-width: 90%;
          }
        }
      `}</style>
    </>
  );
}
