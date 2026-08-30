import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  getCurrentIdToken,
  type Unsubscribe 
} from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import type { JournalInteraction, GeminiChatResponse, ReflectionCompass, JournalInsightsSynthesis } from '../types';

/**
 * Subscribes in real-time to a user's isolated interactions collection.
 * Path: /users/{userId}/interactions
 */
export function subscribeToUserInteractions(
  userId: string,
  onUpdate: (interactions: JournalInteraction[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!userId) {
    throw new Error('User ID is required to subscribe to interactions.');
  }

  const interactionsPath = `users/${userId}/interactions`;
  const interactionsRef = collection(db, 'users', userId, 'interactions');
  const interactionsQuery = query(interactionsRef, orderBy('updatedAt', 'desc'));

  return onSnapshot(
    interactionsQuery,
    (snapshot) => {
      const items: JournalInteraction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: data.userId || userId,
          title: data.title || 'Untitled Reflection',
          summary: data.summary || '',
          tags: Array.isArray(data.tags) ? data.tags : [],
          messages: Array.isArray(data.messages) ? data.messages : [],
          reflectionPrompt: data.reflectionPrompt || null,
          reflectionCompass: data.reflectionCompass || null,
          location: data.location && typeof data.location.latitude === 'number' && typeof data.location.longitude === 'number'
            ? {
                latitude: Number(data.location.latitude),
                longitude: Number(data.location.longitude),
                label: data.location.label ? String(data.location.label).slice(0, 200) : null,
                accuracy: typeof data.location.accuracy === 'number' ? data.location.accuracy : null,
                capturedAt: data.location.capturedAt || new Date().toISOString(),
              }
            : null,
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt || Date.now(),
        });
      });
      onUpdate(items);
    },
    (err) => {
      console.error('Firestore subscription error:', err);
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.GET, interactionsPath);
      } catch {
        // Logging is handled by handleFirestoreError
      }
    }
  );
}

/**
 * Persists a user's journal interaction to Cloud Firestore.
 * Path: /users/{userId}/interactions/{interactionId}
 */
export async function persistJournalInteraction(
  interaction: JournalInteraction
): Promise<void> {
  if (!interaction.userId || !interaction.id) {
    throw new Error('Invalid interaction payload: Missing userId or interaction id.');
  }

  const interactionPath = `users/${interaction.userId}/interactions/${interaction.id}`;
  const docRef = doc(db, 'users', interaction.userId, 'interactions', interaction.id);
  
  // Clean payload
  const payload: any = {
    id: interaction.id,
    userId: interaction.userId,
    title: (interaction.title || 'Untitled Reflection').slice(0, 150),
    summary: (interaction.summary || '').slice(0, 2000),
    tags: (interaction.tags || []).slice(0, 10),
    messages: (interaction.messages || []).map((m) => ({
      id: m.id,
      role: m.role,
      text: m.text,
      timestamp: m.timestamp,
    })),
    reflectionPrompt: interaction.reflectionPrompt || null,
    reflectionCompass: interaction.reflectionCompass
      ? {
          whatHappened: interaction.reflectionCompass.whatHappened || 'Not enough context yet',
          whatImFeeling: interaction.reflectionCompass.whatImFeeling || 'Not enough context yet',
          whatsBotheringMe: interaction.reflectionCompass.whatsBotheringMe || 'Not enough context yet',
          whatIWant: interaction.reflectionCompass.whatIWant || 'Not enough context yet',
          whatICanControl: interaction.reflectionCompass.whatICanControl || 'Not enough context yet',
          nextStep: interaction.reflectionCompass.nextStep || 'Not enough context yet',
          generatedAt: interaction.reflectionCompass.generatedAt || new Date().toISOString(),
        }
      : null,
    location: (interaction.location &&
      typeof interaction.location.latitude === 'number' &&
      typeof interaction.location.longitude === 'number' &&
      !isNaN(interaction.location.latitude) &&
      !isNaN(interaction.location.longitude) &&
      interaction.location.latitude >= -90 &&
      interaction.location.latitude <= 90 &&
      interaction.location.longitude >= -180 &&
      interaction.location.longitude <= 180)
      ? {
          latitude: Number(interaction.location.latitude),
          longitude: Number(interaction.location.longitude),
          label: interaction.location.label ? String(interaction.location.label).slice(0, 200) : null,
          accuracy: typeof interaction.location.accuracy === 'number' && !isNaN(interaction.location.accuracy) ? interaction.location.accuracy : null,
          capturedAt: interaction.location.capturedAt || new Date().toISOString(),
        }
      : null,
    createdAt: interaction.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  try {
    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, interactionPath);
  }
}

/**
 * Deletes an interaction from the user's isolated collection.
 */
export async function removeJournalInteraction(
  userId: string,
  interactionId: string
): Promise<void> {
  if (!userId || !interactionId) {
    throw new Error('User ID and Interaction ID are required for deletion.');
  }
  const interactionPath = `users/${userId}/interactions/${interactionId}`;
  const docRef = doc(db, 'users', userId, 'interactions', interactionId);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, interactionPath);
  }
}

/**
 * Sends conversation context and latest user prompt to the server-side Gemini endpoint.
 * Protected with Firebase ID Token.
 */
export async function requestGeminiReflection(params: {
  prompt: string;
  history?: Array<{ role: 'user' | 'model'; text: string }>;
  currentSummary?: string;
}): Promise<GeminiChatResponse> {
  const token = await getCurrentIdToken();
  if (!token) {
    throw new Error('Authentication token is missing. Please sign in again.');
  }

  const response = await fetch('/api/gemini/journal-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      prompt: params.prompt,
      history: params.history || [],
      currentSummary: params.currentSummary,
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to generate reflection response.';
    try {
      const errorData = await response.json();
      if (errorData?.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // ignore json parse error on error response
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Generates a structured 6-facet Reflection Compass from the current conversation.
 * Protected with Firebase ID Token.
 */
export async function requestReflectionCompass(params: {
  messages: Array<{ role: 'user' | 'model'; text: string }>;
  summary?: string;
}): Promise<{ compass: ReflectionCompass }> {
  const token = await getCurrentIdToken();
  if (!token) {
    throw new Error('Authentication token is missing. Please sign in again.');
  }

  const response = await fetch('/api/gemini/generate-compass', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      messages: params.messages,
      summary: params.summary,
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to generate Reflection Compass.';
    try {
      const errorData = await response.json();
      if (errorData?.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Requests cross-session Longitudinal Insights Synthesis from the server-side Gemini endpoint.
 * Protected with Firebase ID Token.
 */
export async function requestJournalInsightsSynthesis(
  interactions: JournalInteraction[]
): Promise<{ synthesis: JournalInsightsSynthesis }> {
  const token = await getCurrentIdToken();
  if (!token) {
    throw new Error('Authentication token is missing. Please sign in again.');
  }

  const reflectionsPayload = interactions.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    tags: item.tags,
    date: new Date(item.createdAt).toLocaleDateString(),
    compass: item.reflectionCompass || null,
  }));

  const response = await fetch('/api/gemini/synthesize-insights', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      reflections: reflectionsPayload,
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to synthesize journal insights.';
    try {
      const errorData = await response.json();
      if (errorData?.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // ignore parse error
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

