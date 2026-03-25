const User = require("./User");
const Article = require("./Article");
const Category = require("./Category");
const Tag = require("./Tag");
const Comment = require("./Comment");
const Like = require("./Like");
const Favorite = require("./Favorite");

// User associations
User.hasMany(Article, { foreignKey: "user_id", as: "UserArticles" });
User.hasMany(Comment, { foreignKey: "user_id", as: "UserComments" });
User.hasMany(Like, { foreignKey: "user_id", as: "UserLikes" });
User.hasMany(Favorite, { foreignKey: "user_id", as: "UserFavorites" });

// Article associations
Article.belongsTo(User, { foreignKey: "user_id", as: "ArticleUser" });
Article.belongsTo(Category, {
  foreignKey: "category_id",
  as: "ArticleCategory",
});
Article.belongsToMany(Tag, {
  through: "article_tags",
  as: "ArticleTags",
  foreignKey: "article_id",
  otherKey: "tag_id",
});
Article.hasMany(Comment, { foreignKey: "article_id", as: "ArticleComments" });
Article.hasMany(Like, { foreignKey: "article_id", as: "ArticleLikes" });
Article.hasMany(Favorite, { foreignKey: "article_id", as: "ArticleFavorites" });

// Category associations
Category.hasMany(Article, {
  foreignKey: "category_id",
  as: "CategoryArticles",
});

// Tag associations
Tag.belongsToMany(Article, {
  through: "article_tags",
  as: "TagArticles",
  foreignKey: "tag_id",
  otherKey: "article_id",
});

// Comment associations
Comment.belongsTo(User, { foreignKey: "user_id", as: "CommentUser" });
Comment.belongsTo(Article, { foreignKey: "article_id", as: "CommentArticle" });

// Like associations
Like.belongsTo(User, { foreignKey: "user_id", as: "LikeUser" });
Like.belongsTo(Article, { foreignKey: "article_id", as: "LikeArticle" });

// Favorite associations
Favorite.belongsTo(User, { foreignKey: "user_id", as: "FavoriteUser" });
Favorite.belongsTo(Article, {
  foreignKey: "article_id",
  as: "FavoriteArticle",
});

module.exports = {
  User,
  Article,
  Category,
  Tag,
  Comment,
  Like,
  Favorite,
};
