// Things you'll want to change before launch.
export const CONFIG = {
  // Official accounts used by SOCIAL quests ("find the code in our bio").
  // Put your real handles here, without the @. Empty = the app says "not set yet".
  instagram: '',
  tiktok: '',

  // Hashtag players add to social-post quests.
  hashtag: 'GhostSignal',

  // Mixed into reward claim codes. Change it to any random text before launch.
  claimSalt: 'change-me-before-launch',
}

export const SOCIAL_URL = {
  instagram: (handle: string) => `https://www.instagram.com/${handle}/`,
  tiktok: (handle: string) => `https://www.tiktok.com/@${handle}`,
}

// Links accepted as proof for social-post quests.
export const PROOF_DOMAINS = ['instagram.com', 'tiktok.com', 'x.com', 'twitter.com', 'facebook.com', 'threads.net', 'youtube.com', 'snapchat.com']
