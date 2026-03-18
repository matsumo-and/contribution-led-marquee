/**
 * Fetches GitHub contribution data for a given username
 */
export async function fetchContributions(username: string): Promise<string> {
  const url = `https://github.com/users/${username}/contributions`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch contributions: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    throw new Error(`Error fetching contributions for ${username}: ${error}`);
  }
}