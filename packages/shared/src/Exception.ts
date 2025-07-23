export class Exception extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status = 500, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    Object.setPrototypeOf(this, Exception.prototype);
  }
} 