import { DrawStatus } from '../core/types';

export interface DrawState {
  status: DrawStatus;
}

export const PublishEngine = {
  /**
   * Transitions a draw from DRAFT to REVIEW.
   */
  requestReview(state: DrawState): DrawState {
    if (state.status !== DrawStatus.DRAFT) {
      throw new Error("Only DRAFT draws can be sent for review.");
    }
    return { ...state, status: DrawStatus.REVIEW };
  },

  /**
   * Transitions a draw to PUBLISHED.
   */
  publish(state: DrawState): DrawState {
    if (state.status === DrawStatus.PUBLISHED) {
        throw new Error("Draw is already published.");
    }
    return { ...state, status: DrawStatus.PUBLISHED };
  },
  
  /**
   * Reverts a draw back to DRAFT state if modifications are needed.
   */
  revertToDraft(state: DrawState): DrawState {
    return { ...state, status: DrawStatus.DRAFT };
  }
};
