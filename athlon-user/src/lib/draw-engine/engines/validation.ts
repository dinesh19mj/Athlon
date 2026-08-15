import { Participant } from '../core/types';
import { ValidationError } from '../core/errors';

export const ValidationEngine = {
  /**
   * Validates that the draw size is a power of 2
   */
  validateDrawSize(size: number): void {
    if (size <= 0 || (size & (size - 1)) !== 0) {
      throw new ValidationError(`Draw size must be a power of 2. Received: ${size}`);
    }
  },

  /**
   * Validates that no duplicate participants exist
   */
  validateNoDuplicates(participants: Participant[]): void {
    const ids = new Set<string>();
    for (const p of participants) {
      if (ids.has(p.id)) {
        throw new ValidationError(`Duplicate participant detected: ${p.name} (${p.id})`);
      }
      ids.add(p.id);
    }
  },
  
  /**
   * Checks for minimum participants required for a knockout draw
   */
  validateMinimumParticipants(participants: Participant[], size: number): void {
    if (participants.length > size) {
        throw new ValidationError(`Too many participants (${participants.length}) for draw size ${size}`);
    }
    if (participants.length < 2) {
        throw new ValidationError(`At least 2 participants are required`);
    }
  }
};
