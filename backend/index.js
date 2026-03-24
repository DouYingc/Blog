const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { connectDB, sequelize } = require("./config/db");
require("dotenv").config();

// Import models
const User = require("./models/User");
const Category = require("./models/Category");
const Tag = require("./models/Tag");
const Article = require("./models/Article");
const Comment = require("./models/Comment");
const Like = require("./models/Like");
const Favorite = require("./models/Favorite");
const Message = require("./models/Message");
const Notification = require("./models/Notification");
const Follow = require("./models/Follow");
const PrivateMessage = require("./models/PrivateMessage");

// Define associations
Category.hasMany(Article, { foreignKey: "category_id" });
Article.belongsTo(Category, { foreignKey: "category_id" });

User.hasMany(Article, { foreignKey: "user_id" });
Article.belongsTo(User, { foreignKey: "user_id" });

Article.belongsToMany(Tag, {
  through: "article_tags",
  foreignKey: "article_id",
  timestamps: false,
});
Tag.belongsToMany(Article, {
  through: "article_tags",
  foreignKey: "tag_id",
  timestamps: false,
});

Article.hasMany(Comment, { foreignKey: "article_id" });
Comment.belongsTo(Article, { foreignKey: "article_id" });

User.hasMany(Comment, { foreignKey: "user_id" });
Comment.belongsTo(User, { foreignKey: "user_id" });

Comment.hasMany(Comment, { as: "Replies", foreignKey: "parent_id" });
Comment.belongsTo(Comment, { as: "Parent", foreignKey: "parent_id" });

// Message Board Associations
User.hasMany(Message, { foreignKey: "user_id" });
Message.belongsTo(User, { foreignKey: "user_id" });

Message.hasMany(Message, { as: "Replies", foreignKey: "parent_id" });
Message.belongsTo(Message, { as: "Parent", foreignKey: "parent_id" });

// Notification Associations
User.hasMany(Notification, { foreignKey: "user_id" });
Notification.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Notification, {
  as: "SentNotifications",
  foreignKey: "sender_id",
});
Notification.belongsTo(User, { as: "sender", foreignKey: "sender_id" });

// Follow Associations
User.hasMany(Follow, { foreignKey: "follower_id", as: "Following" });
User.hasMany(Follow, { foreignKey: "following_id", as: "Followers" });
Follow.belongsTo(User, { foreignKey: "follower_id", as: "Follower" });
Follow.belongsTo(User, { foreignKey: "following_id", as: "Following" });

// Private Message Associations
User.hasMany(PrivateMessage, { foreignKey: "sender_id", as: "SentMessages" });
User.hasMany(PrivateMessage, {
  foreignKey: "receiver_id",
  as: "ReceivedMessages",
});
PrivateMessage.belongsTo(User, { foreignKey: "sender_id", as: "Sender" });
PrivateMessage.belongsTo(User, { foreignKey: "receiver_id", as: "Receiver" });

// Like & Favorite associations
User.belongsToMany(Article, {
  through: Like,
  as: "LikedArticles",
  foreignKey: "user_id",
});
Article.belongsToMany(User, {
  through: Like,
  as: "LikedByUsers",
  foreignKey: "article_id",
});

User.belongsToMany(Article, {
  through: Favorite,
  as: "FavoritedArticles",
  foreignKey: "user_id",
});
Article.belongsToMany(User, {
  through: Favorite,
  as: "FavoritedByUsers",
  foreignKey: "article_id",
});

// Add direct associations for direct querying (important for interactions routes)
Favorite.belongsTo(Article, { foreignKey: "article_id" });
Favorite.belongsTo(User, { foreignKey: "user_id" });
Like.belongsTo(Article, { foreignKey: "article_id" });
Like.belongsTo(User, { foreignKey: "user_id" });

// Also Article needs to know about Favorite/Like if we want to include them
Article.hasMany(Favorite, { foreignKey: "article_id", as: "Favorites" });
Article.hasMany(Like, { foreignKey: "article_id", as: "Likes" });

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");
const categoryRoutes = require("./routes/categories");
const tagRoutes = require("./routes/tags");
const commentRoutes = require("./routes/comments");
const statsRoutes = require("./routes/stats");
const interactionRoutes = require("./routes/interactions");
const uploadRoutes = require("./routes/upload");
const messageRoutes = require("./routes/messages");
const notificationRoutes = require("./routes/notifications");
const searchRoutes = require("./routes/search");
const followRoutes = require("./routes/follows");
const privateMessageRoutes = require("./routes/privateMessages");
const path = require("path");

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/privateMessages", privateMessageRoutes);

// 404 handler
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ message: "接口不存在" });
});

// Test DB Connection and Sync
const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
  }
};

startServer();
