import pb from '@/lib/pocketbaseClient';

export async function fetchPublishedArticles() {
  return pb.collection('articles').getFullList({
    filter: 'status = "published"',
    sort: '-date',
    requestKey: 'articles-published-all',
  });
}

// Returns the most recent (highest/latest) batch value among all published
// articles. Batch values are ISO-date-style strings like "2026-08-13", so a
// descending lexicographic sort yields the latest batch. Returns null when
// there are no published articles or none have a batch value yet.
export async function fetchCurrentBatch() {
  const all = await pb.collection('articles').getFullList({
    filter: 'status = "published"',
    sort: '-date',
    requestKey: 'articles-batch-scan',
  });
  if (!all.length) return null;
  const batches = all
    .map((a) => a.batch)
    .filter((b) => typeof b === 'string' && b.trim() !== '');
  if (!batches.length) return null;
  batches.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  return batches[0];
}

// Returns only the published articles belonging to the most recent batch.
// If no published articles have a batch value, returns an empty array.
// Uses its own request key so it can run in parallel with
// fetchPublishedArticles without the SDK auto-cancelling either call.
export async function fetchCurrentBatchArticles() {
  const all = await pb.collection('articles').getFullList({
    filter: 'status = "published"',
    sort: '-date',
    requestKey: 'articles-batch-scan',
  });
  if (!all.length) return [];
  const batches = all
    .map((a) => a.batch)
    .filter((b) => typeof b === 'string' && b.trim() !== '');
  if (!batches.length) return [];
  batches.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  const currentBatch = batches[0];
  return all.filter((a) => a.batch === currentBatch);
}

// Returns all published articles NOT belonging to the current (most recent)
// batch value, sorted newest first by date. If no published articles have a
// batch value, returns an empty array (everything is considered "current").
export async function fetchArchivedArticles() {
  const all = await pb.collection('articles').getFullList({
    filter: 'status = "published"',
    sort: '-date',
    requestKey: 'articles-archive-scan',
  });
  if (!all.length) return [];
  const batches = all
    .map((a) => a.batch)
    .filter((b) => typeof b === 'string' && b.trim() !== '');
  if (!batches.length) return [];
  batches.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  const currentBatch = batches[0];
  return all.filter((a) => a.batch !== currentBatch);
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
