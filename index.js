import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

// --- Fonction qui appelle l'API privée Instagram ---
async function getInstagramProfile(username) {
  const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`;

  const headers = {
    "User-Agent": "Instagram 300.0.0.0",
    "X-IG-App-ID": "936619743392459"
  };

  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error(`Instagram API error: ${res.status}`);
  }

  const json = await res.json();
  const user = json.data.user;

  return {
    username: user.username,
    fullName: user.full_name,
    bio: user.biography,
    followers: user.edge_followed_by.count,
    following: user.edge_follow.count,
    profilePic: user.profile_pic_url_hd,
    externalUrl: user.external_url,
    isPrivate: user.is_private,
    isVerified: user.is_verified,
    posts: user.edge_owner_to_timeline_media.edges.map(edge => ({
      id: edge.node.id,
      caption: edge.node.edge_media_to_caption.edges[0]?.node.text || null,
      image: edge.node.display_url,
      video: edge.node.is_video ? edge.node.video_url : null,
      comments: edge.node.edge_media_to_comment.count,
      likes: edge.node.edge_liked_by.count
    }))
  };
}

// --- Route API ---
app.get("/profile", async (req, res) => {
  try {
    const username = req.query.user || "demattos.art";
    const data = await getInstagramProfile(username);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Lancement du serveur ---
app.listen(3000, () => {
  console.log("Instagram Private API — Running on port 3000");
});
