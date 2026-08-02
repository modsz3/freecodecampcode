import pb from '@/lib/pocketbaseClient';

export async function fetchPublishedArticles() {
  return pb.collection('articles').getFullList({
    filter: 'status = "published"',
    sort: '-date',
  });
}

export async function fetchArticleBySlug(slug) {
  const results = await pb.collection('articles').getFullList({
    filter: pb.filter('slug = {:slug} && status = "published"', { slug }),
    requestKey: `article-slug-${slug}`,
  });
  return results[0] || null;
}

export async function fetchAllArticles() {
  return pb.collection('articles').getFullList({ sort: '-date' });
}

export async function createArticle(data) {
  return pb.collection('articles').create(data);
}

export async function updateArticle(id, data) {
  return pb.collection('articles').update(id, data);
}

export async function deleteArticle(id) {
  return pb.collection('articles').delete(id);
}

export function adminLogin(email, password) {
  return pb.collection('users').authWithPassword(email, password);
}

export function adminLogout() {
  pb.authStore.clear();
}

export function isAdminAuthed() {
  return pb.authStore.isValid;
}
