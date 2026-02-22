export class AppError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string) {
    return new AppError(400, message);
  }

  static notFound(message: string) {
    return new AppError(404, message);
  }

  static internal(message: string) {
    return new AppError(500, message);
  }
}
