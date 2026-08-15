export class DrawEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DrawEngineError';
  }
}

export class ValidationError extends DrawEngineError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class BracketGenerationError extends DrawEngineError {
  constructor(message: string) {
    super(message);
    this.name = 'BracketGenerationError';
  }
}
