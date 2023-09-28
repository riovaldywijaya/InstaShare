class Helper {
  static getAllLikes(posts) {
    let totalLikes = 0;
    posts.forEach((post) => {
      totalLikes += post.likes;
    });

    return totalLikes;
  }
}

module.exports = Helper;
