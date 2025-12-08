export const normalizeParticipants = (ids: string[]) =>
  Array.from(new Set(ids)).filter(Boolean).sort();

export const buildConversationId = (
  projectId: string | null | undefined,
  participants: string[],
) => {
  const sorted = normalizeParticipants(participants);
  if (sorted.length !== 2) {
    throw new Error('Conversation requires exactly two participants');
  }
  const projectKey = projectId?.trim() ? projectId.trim() : 'direct';
  return `${projectKey}__${sorted[0]}__${sorted[1]}`;
};

export const getCounterpartyId = (participants: string[], currentUserId: string) =>
  normalizeParticipants(participants).find((id) => id !== currentUserId) || '';
